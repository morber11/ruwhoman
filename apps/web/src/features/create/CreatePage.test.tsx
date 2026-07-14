import '@testing-library/jest-dom';
import { renderWithQuery } from '../../test-utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreatePage from './CreatePage';

const mockCreate = jest.fn();

jest.mock('../../api/client', () => ({
    request: (...args: unknown[]) => mockCreate(...args),
    API_BASE: 'http://localhost:3001/api',
}));

beforeEach(() => {
    mockCreate.mockReset();
});

it('calls the API on click and shows URLs', async () => {
    mockCreate.mockResolvedValue({
        challengeUrl: 'http://example.com/abc',
        monitorUrl: 'http://example.com/monitor/xyz',
    });

    renderWithQuery(<CreatePage />);
    await userEvent.click(screen.getByRole('button', { name: /create/i }));

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(
        await screen.findByText('http://example.com/abc'),
    ).toBeInTheDocument();
});

it('sends slider type when selected in advanced options', async () => {
    mockCreate.mockResolvedValue({
        challengeUrl: 'http://example.com/abc',
        monitorUrl: 'http://example.com/monitor/xyz',
    });

    renderWithQuery(<CreatePage />);
    await userEvent.click(screen.getByText(/advanced options/i));

    await userEvent.click(screen.getByLabelText('Slider'));
    await userEvent.click(screen.getByRole('button', { name: /create/i }));

    expect(mockCreate).toHaveBeenCalledWith(
        '/challenges',
        expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ type: 'slider' }),
        }),
    );
});

it('sends captcha type when selected in advanced options', async () => {
    mockCreate.mockResolvedValue({
        challengeUrl: 'http://example.com/abc',
        monitorUrl: 'http://example.com/monitor/xyz',
    });

    renderWithQuery(<CreatePage />);
    await userEvent.click(screen.getByText(/advanced options/i));

    await userEvent.click(screen.getByLabelText('Math'));
    await userEvent.click(screen.getByRole('button', { name: /create/i }));

    expect(mockCreate).toHaveBeenCalledWith(
        '/challenges',
        expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ type: 'math' }),
        }),
    );
});
