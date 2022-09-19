import React from 'react';

import { Container } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import { Outlet } from 'react-router-dom';

import Header from './Header';

const useStyles = makeStyles((theme) => ({
    offset: theme.mixins.toolbar,
    container: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        minWidth: '100%',
    },
}));

export default function AppLayout() {
    const styles = useStyles();
    return (
        <React.Fragment>
            <Header />
            <div className={styles.offset} />
            <Container className={styles.container}>
                <Outlet />
            </Container>
        </React.Fragment>
    );
}
