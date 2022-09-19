import React from 'react';

import { Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import { Outlet } from 'react-router-dom';

const useStyles = makeStyles({
    root: {
        minHeight: '100vh',
        minWidth: '100vw',
    },
});

export default function AuthLayout() {
    const styles = useStyles();
    return (
        <Grid
            className={styles.root}
            container
            direction="column"
            justify="center"
            alignItems="center"
        >
            <Outlet />
        </Grid>
    );
}
