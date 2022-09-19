import React, { useState } from 'react';

import {
    Avatar,
    Box,
    Button,
    Paper,
    Link,
    CardContent,
    CardHeader,
    FormControlLabel,
    TextField,
    useMediaQuery,
    Checkbox,
    Typography,
} from '@material-ui/core';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { makeStyles } from '@material-ui/styles';
import { red } from '@material-ui/core/colors';

import applogo from '../../assets/cinestack.png';
import { useAuth } from '../../utils/useAuth';

const useStyles = makeStyles((theme) => ({
    root: {
        padding: '50px',
        [theme.breakpoints.down('sm')]: {
            width: '100vw',
            height: '100vh',
        },
        [theme.breakpoints.up('sm')]: {
            minWidth: '350px',
            height: 'fit-content',
        },
    },
    inputField: {
        '&:not(:last-child)': {
            marginBottom: '10px',
        },
    },
    errorMessage: {
        color: red[600],
    },
    loginBtn: {
        height: '40px',
    },
}));

export default function LoginView() {
    const auth = useAuth();
    const styles = useStyles();
    const redir = new URLSearchParams(useLocation().search).get('r');
    const isSmallScreen = useMediaQuery((theme) =>
        theme.breakpoints.down('sm')
    );
    const [form, setForm] = useState(null);
    const [errored, setErrored] = useState(false);
    const navigate = useNavigate();

    // login handler
    const login = () => {
        const data = new FormData(form);
        auth.signin(data.get('email'), data.get('password'))
            .then(() => (redir ? navigate(redir) : navigate('/')))
            .catch((e) => setErrored(e.response.data.message));
    };

    return (
        <Paper
            variant={isSmallScreen ? null : 'outlined'}
            elevation={0}
            className={styles.root}
        >
            <Box display="flex" justifyContent="center">
                <Avatar alt="logo" src={applogo} />
            </Box>
            <CardHeader
                title="Login"
                titleTypographyProps={{ align: 'center' }}
            />
            <CardContent>
                <form ref={(ref) => setForm(ref)} onSubmit={() => false}>
                    <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                    >
                        <TextField
                            name="email"
                            label="Email"
                            type="text"
                            variant="outlined"
                            placeholder="Email"
                            className={styles.inputField}
                        />
                        <TextField
                            name="password"
                            label="Password"
                            type="password"
                            variant="outlined"
                            placeholder="Password"
                            className={styles.inputField}
                        />
                        {errored && (
                            <Typography
                                variant="overline"
                                className={styles.errorMessage}
                            >
                                {errored}
                            </Typography>
                        )}
                        <Button
                            variant="contained"
                            color="primary"
                            disableElevation
                            className={styles.loginBtn}
                            onClick={login}
                        >
                            Login
                        </Button>
                        <Box
                            display="flex"
                            flexDirection="row"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <FormControlLabel
                                control={<Checkbox />}
                                label="Remember me"
                            />
                            <Link component={RouterLink} to="/auth/forgot">
                                Forgot password?
                            </Link>
                        </Box>
                        <Typography>
                            Don&apos;t have an account?{' '}
                            <Link component={RouterLink} to="/auth/register">
                                Register
                            </Link>
                        </Typography>
                    </Box>
                </form>
            </CardContent>
        </Paper>
    );
}
