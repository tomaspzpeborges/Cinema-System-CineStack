import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// import layouts
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';

// import auth views
import LoginView from './views/Auth/LoginView';
import RegisterView from './views/Auth/RegisterView';
import ForgotView from './views/Auth/ForgotView';
import VerifyView from './views/Auth/VerifyView';
import ResetView from './views/Auth/ResetView';

// import app views
import HomepageView from './views/App/HomepageView';

import MoviesSearchView from './views/App/Movies/SearchView';
import MoviesDetailsView from './views/App/Movies/DetailsView';

import BookingSeatSelectionView from './views/App/Booking/SeatSelectionView';
import BookingPayView from './views/App/Booking/PayView';

import TicketsDetailsView from './views/App/Tickets/DetailsView';
import TicketsListView from './views/App/Tickets/ListView';

const routes = [
    {
        path: 'auth',
        element: <AuthLayout />,
        children: [
            {
                path: 'login',
                element: <LoginView />,
            },
            {
                path: 'register',
                element: <RegisterView />,
            },
            {
                path: 'forgot',
                element: <ForgotView />,
            },
            {
                path: 'verify/:id/:token',
                element: <VerifyView />,
            },
            {
                path: 'reset/:token',
                element: <ResetView />,
            },
            {
                path: '/',
                element: <Navigate to="/auth/login" />,
            },
            {
                path: '*',
                element: <Navigate to="/auth/login" />,
            },
        ],
    },
    {
        path: '/',
        element: <AppLayout />,
        children: [
            {
                path: '/movies',
                element: <Outlet />,
                children: [
                    {
                        path: '/search',
                        element: <MoviesSearchView />,
                    },
                    {
                        path: '/:movieId',
                        element: <MoviesDetailsView />,
                    },
                ],
            },
            {
                path: '/tickets',
                element: <Outlet />,
                children: [
                    {
                        path: '/:ticketId',
                        element: <TicketsDetailsView />,
                    },
                    {
                        path: '/',
                        element: <TicketsListView />,
                    },
                ],
            },
            {
                path: '/booking',
                element: <Outlet />,
                children: [
                    {
                        path: '/seats/:screeningId',
                        element: <BookingSeatSelectionView />,
                    },
                    {
                        path: '/pay/:ticketId',
                        element: <BookingPayView />,
                    },
                ],
            },
            {
                path: '/',
                element: <HomepageView />,
            },
            {
                path: '*',
                element: <Navigate to="/" />,
            },
        ],
    },
];

export default routes;
