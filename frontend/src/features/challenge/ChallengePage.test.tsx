import '@testing-library/jest-dom';
import { renderWithQuery } from '../../test-utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ChallengePage from './ChallengePage';

const mockRequest = jest.fn();

jest.mock('../../api/client', () => ({
    request: (...args: unknown[]) => mockRequest(...args),
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

it('shows expired for 404', async () => {
    const err = new Error('404');
    (err as { status?: number }).status = 404;

    mockRequest.mockRejectedValue(err);

    renderAt('abc123');

    expect(
        await screen.findByText(/not found or expired/i),
    ).toBeInTheDocument();
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
