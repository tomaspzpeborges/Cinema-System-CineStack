import React from 'react';
import { useRoutes } from 'react-router-dom';
import routes from './routes';

import '@fontsource/roboto';
import './App.css';

import axios from 'axios';

import { createMuiTheme, CssBaseline, ThemeProvider } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#c62828',
        },
        secondary: {
            main: '#263238',
        },
    },
    overrides: {
        MuiCssBaseline: {
            '@global': {
                '*': {
                    'scrollbar-width': 'thin',
                },
                '*::-webkit-scrollbar': {
                    backgroundColor: 'lightgrey',
                },
                '*::-webkit-scrollbar-thumb': {
                    backgroundColor: 'darkgrey',
                },
            },
        },
    },
});

function App() {
    axios.defaults.baseURL =
        process.env.REACT_APP_NODE_ENV == 'nightly'
            ? 'https://testing.segfault.zone'
            : process.env.NODE_ENV == 'production'
            ? 'https://segfault.zone'
            : 'http://localhost:3000';
    axios.defaults.headers.post['Content-Type'] = 'application/json';
    const router = useRoutes(routes);
    return (
        <MuiPickersUtilsProvider utils={MomentUtils}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {router}
            </ThemeProvider>
        </MuiPickersUtilsProvider>
    );
}

export default App;
