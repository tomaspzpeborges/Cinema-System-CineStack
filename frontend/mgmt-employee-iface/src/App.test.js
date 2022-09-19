import React from 'react';
import {
    render,
    fireEvent,
    waitFor,
    screen,
    act,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';

import App from './App';

describe('/login - login page', () => {
    test('should render login page', () => {
        render(
            <MemoryRouter initialEntries={['/login']}>
                <App />
            </MemoryRouter>
        );

        let usernameInput = screen.getByPlaceholderText('Username');
        expect(usernameInput).toBeInTheDocument();

        let passInput = screen.getByPlaceholderText('Password');
        expect(passInput).toBeInTheDocument();

        let loginBtn = screen.getByRole('button');
        expect(loginBtn).toHaveTextContent('Log in');
    });
    test('should reject empty username', async () => {
        render(
            <MemoryRouter initialEntries={['/login']}>
                <App />
            </MemoryRouter>
        );

        let passInput = screen.getByPlaceholderText('Password');

        act(() => {
            passInput.nodeValue = 'badpass';

            fireEvent.submit(screen.getByText('Log in'));
        });

        await waitFor(() =>
            expect(screen.getByText('Username is required')).toBeInTheDocument()
        );
    });
    test('should reject empty password', async () => {
        render(
            <MemoryRouter initialEntries={['/login']}>
                <App />
            </MemoryRouter>
        );

        let usernameInput = screen.getByPlaceholderText('Username');

        act(() => {
            usernameInput.nodeValue = 'badlogin';

            fireEvent.submit(screen.getByRole('button'));
        });

        await waitFor(() =>
            expect(screen.getByText('Password is required')).toBeInTheDocument()
        );
    });
});

describe('/pos - POS routes', () => {
    test('should render POS home', async () => {
        render(
            <MemoryRouter initialEntries={['/pos/home']}>
                <App />
            </MemoryRouter>
        );

        await waitFor(
            () => expect(screen.getByText('Make Booking')).toBeInTheDocument(),
            expect(screen.getByText('Search Tickets')).toBeInTheDocument()
        );
    });

    test('should render POS ticket search', async () => {
        render(
            <MemoryRouter initialEntries={['/pos/tickets/search']}>
                <App />
            </MemoryRouter>
        );

        const jsdomAlert = window.alert; // remember the jsdom alert
        window.alert = () => {}; // provide an empty implementation for window.alert

        await waitFor(
            () =>
                expect(
                    screen.getByText('Error retrieving tickets')
                ).toBeInTheDocument() // since no backend access
        );
        window.alert = jsdomAlert;
    });

    test('should render POS movie selection', async () => {
        render(
            <MemoryRouter initialEntries={['/pos/booking/movie-select']}>
                <App />
            </MemoryRouter>
        );

        const jsdomAlert = window.alert; // remember the jsdom alert
        window.alert = () => {}; // provide an empty implementation for window.alert

        await waitFor(
            () =>
                expect(
                    screen.getByPlaceholderText('Search by title')
                ).toBeInTheDocument() // since no backend access
        );
        window.alert = jsdomAlert;
    });
});
