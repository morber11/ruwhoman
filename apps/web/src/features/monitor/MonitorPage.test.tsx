import '@testing-library/jest-dom';
import { renderWithQuery } from '../../test-utils';
import { screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import MonitorPage from './MonitorPage';

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
        <MemoryRouter initialEntries={[`/monitor/${token}`]}>
            <Routes>
                <Route path="/monitor/:token" element={<MonitorPage />} />
            </Routes>
        </MemoryRouter>,
    );
}

it('polls the API every 5s while status is pending', async () => {
    mockRequest.mockResolvedValue({
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        completedAt: null,
    });

    renderAt('xyz');

    await screen.findByText('Waiting for response');
    expect(mockRequest).toHaveBeenCalledTimes(1);
});
