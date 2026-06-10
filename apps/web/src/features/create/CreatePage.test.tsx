import '@testing-library/jest-dom';
import { renderWithQuery } from '../../test-utils';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreatePage from './CreatePage';

const mockCreate = jest.fn();

jest.mock('../../api/client', () => ({
    request: (...args: unknown[]) => mockCreate(...args),
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
