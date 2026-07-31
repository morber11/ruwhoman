import '@testing-library/jest-dom';
import { renderWithQuery } from '../../test-utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ChallengePage from './ChallengePage';

jest.mock('./ReCaptchaV3Challenge', () => ({
    __esModule: true,
    default: () => null,
}));

jest.mock('./ReCaptchaV2Challenge', () => ({
    __esModule: true,
    default: () => null,
}));

const mockRequest = jest.fn();

jest.mock('../../api/client', () => ({
    request: (...args: unknown[]) => mockRequest(...args),
    API_BASE: 'http://localhost:3001/api',
    ApiError: class extends Error {
        status: number;
        constructor(status: number) {
            super(String(status));
            this.status = status;
        }
    },
}));

beforeEach(() => {
    mockRequest.mockReset();
});

function renderAt(token: string) {
    return renderWithQuery(
        <MemoryRouter initialEntries={[`/${token}`]}>
            <Routes>
                <Route path="/:token" element={<ChallengePage />} />
            </Routes>
        </MemoryRouter>,
    );
}

it('submits the answer and shows passed', async () => {
    mockRequest
        .mockResolvedValueOnce({ type: 'math', question: 'What is 1 + 1?' })
        .mockResolvedValueOnce({ passed: true });

    renderAt('abc123');
    await screen.findByText('What is 1 + 1?');

    await userEvent.type(screen.getByRole('textbox'), '2');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(
        await screen.findByText(/correct/i),
    ).toBeInTheDocument();
});

it('keeps the form visible and shows attempts left after a wrong answer', async () => {
    mockRequest
        .mockResolvedValueOnce({ type: 'math', question: 'What is 1 + 1?' })
        .mockResolvedValueOnce({ passed: false, attemptsLeft: 1 })
        .mockResolvedValueOnce({ passed: true, attemptsLeft: 1 });

    renderAt('abc123');
    await screen.findByText('What is 1 + 1?');

    await userEvent.type(screen.getByRole('textbox'), '3');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByText(/1 attempt left/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();

    await userEvent.type(screen.getByRole('textbox'), '2');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByText(/correct/i)).toBeInTheDocument();
});

it('shows expired for 404', async () => {
    const err = new Error('404');
    (err as { status?: number }).status = 404;

    mockRequest.mockRejectedValue(err);

    renderAt('abc123');

    expect(
        await screen.findByText(/not found or expired/i),
    ).toBeInTheDocument();
});

it('renders text captcha and accepts answer', async () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><text>abc12</text></svg>';

    mockRequest
        .mockResolvedValueOnce({ type: 'text', question: svg })
        .mockResolvedValueOnce({ passed: true });

    const { container } = renderAt('abc123');
    await screen.findByRole('textbox');

    expect(container.querySelector('img[alt="Captcha"]')).toBeInTheDocument();

    await userEvent.type(screen.getByRole('textbox'), 'abc12');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByText(/correct/i)).toBeInTheDocument();
});

it('renders slider captcha and submits the slider position', async () => {
    mockRequest
        .mockResolvedValueOnce({
            type: 'slider',
            pieceWidth: 50,
            imageWidth: 400,
        })
        .mockResolvedValueOnce({ passed: true });

    renderAt('abc123');
    await screen.findByRole('slider');

    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);

    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(await screen.findByText(/correct/i)).toBeInTheDocument();
});

it('shows completed for 409', async () => {
    const err = new Error('409');
    (err as { status?: number }).status = 409;

    mockRequest.mockRejectedValue(err);

    renderAt('abc123');

    expect(
        await screen.findByText(/already been completed/i),
    ).toBeInTheDocument();
});
