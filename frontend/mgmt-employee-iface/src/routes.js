import { Outlet, Navigate } from 'react-router-dom';
import LoginView from './views/LoginView';

// manager route imports
import Movies from './manager/Movies';
import Movie from './manager/Movie';
import Employee from './manager/Employee';
import Employees from './manager/Employees';
import Landing from './manager/Landing';
import Navigation from './manager/Navigation';
import Revenue from './manager/Revenue';

//POS route imports
import POSLanding from './views/pos/POSLanding';
import POSVisitorCount from './views/pos/POSVisitorCount';
import POSMovieSelection from './views/pos/POSMovieSelection';
import POSScreeningSelection from './views/pos/POSScreeningSelection';
import POSSeatSelection from './views/pos/POSSeatSelection';
import POSTicketSearch from './views/pos/POSTicketSearch';
import POSTicketDetail from './views/pos/POSTicketDetail';
import POSTicketViewer from './views/pos/POSTicketViewer';
import POSPaymentMethod from './views/pos/POSPaymentMethod';
import POSContainer from './views/pos/container';
import { BookingProvider } from './contexts/BookingContext';

const routes = [
    {
        path: '/',
        element: <Outlet />,
        children: [
            {
                path: '/',
                element: <Navigate to='/login' />
            },
            {
                path: '/login',
                element: <LoginView />,
            },
            {
                path: '/management/*',
                element: <Navigation />,
                children: [
                    {
                        path: '/movies/:name',
                        element: <Movie />
                    }, {
                        path: '/movies',
                        element: <Movies />
                    }, {
                        path: '/employees/:name',
                        element: <Employee />
                    }, {
                        path: '/employees',
                        element: <Employees />
                    }, {
                        path: '/statistics',
                        element: <Revenue />
                    }, {
                        path: '/',
                        element: <Landing />
                    }
                ],
            },
            {
                path: '/pos',
                element: <POSContainer />,
                children: [
                    {
                        path: '/home',
                        element: <POSLanding />,
                    },
                    {
                        path: '/booking',
                        element: (
                            <BookingProvider>
                                <Outlet />
                            </BookingProvider>
                        ),
                        children: [
                            {
                                path: '/visitor-count',
                                element: <POSVisitorCount />,
                            },
                            {
                                path: '/movie-select',
                                element: <POSMovieSelection />,
                            },
                            {
                                path: '/screening-select',
                                element: <POSScreeningSelection />,
                            },
                            {
                                path: '/seat-select',
                                element: <POSSeatSelection />,
                            },
                            {
                                path: '/payment-select',
                                element: <POSPaymentMethod />,
                            },
                        ],
                    },
                    {
                        path: '/tickets',
                        children: [
                            {
                                path: '/search',
                                element: <POSTicketSearch />,
                            },
                            {
                                path: '/detail/:ticketId',
                                element: <POSTicketDetail />
                            },
                            {
                                path: '/view/:ticketId',
                                element: <POSTicketViewer />
                            }
                        ],
                    },
                ],
            },
        ],
    },
];

export default routes;
