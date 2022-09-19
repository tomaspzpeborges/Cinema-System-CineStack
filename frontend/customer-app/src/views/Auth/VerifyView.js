import React, { useEffect, useState } from 'react';

import {
    Avatar,
    Box,
    CardHeader,
    Paper,
    useMediaQuery,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import { useNavigate, useParams } from 'react-router-dom';

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
}));

export default function VerifyView() {
    const auth = useAuth();
    const styles = useStyles();
    const isSmallScreen = useMediaQuery((theme) =>
        theme.breakpoints.down('sm')
    );
    const navigate = useNavigate();
    const { id, token } = useParams();

    const [verified, setVerified] = useState(null);

    // verify on mount
    useEffect(() => {
        auth.verifyAccount(id, token).then((verified) => {
            setVerified(verified);
            setTimeout(() => navigate('/auth/login'), 3000);
        });
    }, []);

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
                title={
                    verified !== null
                        ? verified === true
                            ? 'Verified! Redirecting...'
                            : 'Invalid verification link.'
                        : 'Verifying...'
                }
                titleTypographyProps={{ align: 'center' }}
            />
        </Paper>
    );
}
