import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';

import App from './App';

describe('/auth - auth pages', () => {
    describe('/login', () => {
        test('should render login page', () => {
            render(
                <MemoryRouter initialEntries={['/auth/login']}>
                    <App />
                </MemoryRouter>
            );

            let emailInput = screen.getByPlaceholderText('Email');
            expect(emailInput).toBeInTheDocument();

            let passInput = screen.getByPlaceholderText('Password');
            expect(passInput).toBeInTheDocument();

            let loginBtn = screen.getByRole('button');
            expect(loginBtn).toHaveTextContent('Login');
        });
    });
    test('/register should render register page', () => {
        render(
            <MemoryRouter initialEntries={['/auth/register']}>
                <App />
            </MemoryRouter>
        );

        let emailInput = screen.getByPlaceholderText('Email');
        expect(emailInput).toBeInTheDocument();

        let nameInput = screen.getByPlaceholderText('Name');
        expect(nameInput).toBeInTheDocument();

        let dobInput = screen.getByText('Date of Birth');
        expect(dobInput).toBeInTheDocument();

        let passInput = screen.getByPlaceholderText('Password');
        expect(passInput).toBeInTheDocument();

        let passConfirmInput = screen.getByPlaceholderText('Confirm Password');
        expect(passConfirmInput).toBeInTheDocument();

        let registerBtn = screen.getByRole('button');
        expect(registerBtn).toHaveTextContent('Register');
    });
    test('/forgot should render forgot password page', () => {
        render(
            <MemoryRouter initialEntries={['/auth/forgot']}>
                <App />
            </MemoryRouter>
        );
        let emailInput = screen.getByPlaceholderText('Email');
        expect(emailInput).toBeInTheDocument();
        let registerBtn = screen.getByRole('button');
        expect(registerBtn).toHaveTextContent('Send Reset Email');
    });
});
