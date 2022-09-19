import React, { useState } from 'react';

import {
    Avatar,
    Box,
    Button,
    Paper,
    CardContent,
    CardHeader,
    TextField,
    useMediaQuery,
    Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { red, green } from '@material-ui/core/colors';

import applogo from '../../assets/cinestack.png';
import { useAuth } from '../../utils/useAuth';
import { useNavigate } from 'react-router';

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
        marginBottom: '10px',
    },
    errorText: {
        color: red[600],
    },
    successText: {
        color: green[600],
    },
    passResetBtn: {
        height: '40px',
    },
}));

export default function ForgotView() {
    const auth = useAuth();
    const styles = useStyles();
    const isSmallScreen = useMediaQuery((theme) =>
        theme.breakpoints.down('sm')
    );
    const [email, setEmail] = useState('');
    const [errored, setErrored] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const sendReset = () => {
        auth.sendPasswordResetEmail(email).then((res) => {
            if (res.error) return setErrored(true);
            setSuccess(true);
            setTimeout(() => navigate('/auth/login'), 3000);
        });
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
                title="Forgot Password"
                titleTypographyProps={{ align: 'center' }}
            />
            <CardContent>
                <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                >
                    <TextField
                        label="Email"
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        variant="outlined"
                        placeholder="Email"
                        className={styles.inputField}
                    />
                    {success && (
                        <Typography
                            variant="outlined"
                            className={styles.successText}
                        >
                            Check your email for a reset link!
                        </Typography>
                    )}
                    {errored && (
                        <Typography
                            variant="outlined"
                            className={styles.errorText}
                        >
                            Internal server error. Try again later
                        </Typography>
                    )}
                    <Button
                        variant="contained"
                        color="primary"
                        disableElevation
                        className={styles.passResetBtn}
                        onClick={sendReset}
                    >
                        Send Reset Email
                    </Button>
                </Box>
            </CardContent>
        </Paper>
    );
}
