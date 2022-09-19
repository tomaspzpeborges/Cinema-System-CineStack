import { useRoutes } from 'react-router-dom';
import routes from './routes';
import './App.css';

import axios from 'axios';

import { AuthProvider } from './utils/useAuth';

function App() {
    axios.defaults.baseURL =
        process.env.REACT_APP_NODE_ENV == 'nightly'
            ? 'https://testing.segfault.zone'
            : process.env.NODE_ENV == 'production'
            ? 'https://segfault.zone'
            : 'http://localhost:3000';

    // add an interceptor to include the auth token on every request
    axios.interceptors.request.use(function (config) {
        const token = localStorage.getItem('user-jwt');
        config.headers.Authorization = 'Bearer ' + token;

        return config;
    });
    const router = useRoutes(routes);
    return <AuthProvider>{router}</AuthProvider>;
}

export default App;
