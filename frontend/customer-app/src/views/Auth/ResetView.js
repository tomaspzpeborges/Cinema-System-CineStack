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
import { useNavigate, useParams } from 'react-router-dom';

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

export default function ResetView() {
    const auth = useAuth();
    const styles = useStyles();
    const isSmallScreen = useMediaQuery((theme) =>
        theme.breakpoints.down('sm')
    );
    const [password, setPassword] = useState('');
    const [errored, setErrored] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const { token } = useParams();

    const sendReset = () => {
        auth.resetPassword(token, password).then((res) => {
            if (res.error) setErrored(true);
            else setSuccess(true);
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
                title="Reset Password"
                titleTypographyProps={{ align: 'center' }}
            />
            <CardContent>
                <Box
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                >
                    <TextField
                        label="Password"
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        variant="outlined"
                        placeholder="Password"
                        className={styles.inputField}
                    />
                    {success && (
                        <Typography
                            variant="outlined"
                            className={styles.successText}
                        >
                            Password reset successfully!
                        </Typography>
                    )}
                    {errored && (
                        <Typography
                            variant="outlined"
                            className={styles.errorText}
                        >
                            Invalid link.
                        </Typography>
                    )}
                    <Button
                        variant="contained"
                        color="primary"
                        disableElevation
                        className={styles.passResetBtn}
                        onClick={sendReset}
                    >
                        Reset Password
                    </Button>
                </Box>
            </CardContent>
        </Paper>
    );
}
