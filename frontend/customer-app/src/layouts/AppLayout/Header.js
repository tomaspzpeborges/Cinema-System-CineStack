import React, { useState } from 'react';

import {
    AppBar,
    Avatar,
    Button,
    Divider,
    Drawer,
    IconButton,
    InputBase,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    useMediaQuery,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import { Link, useNavigate } from 'react-router-dom';

import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import HomeIcon from '@material-ui/icons/Home';
import MovieIcon from '@material-ui/icons/Movie';
import TicketsIcon from '@material-ui/icons/ConfirmationNumber';
import WalletIcon from '@material-ui/icons/AccountBalanceWallet';
import AuthenticateIcon from '@material-ui/icons/ExitToApp';

import Logo from '../../assets/cinestack.png';
import { useAuth } from '../../utils/useAuth';
import { red } from '@material-ui/core/colors';

import axios from 'axios';

const useStyles = makeStyles((theme) => ({
    root: {
        position: 'fixed',
    },
    logo: {
        marginRight: theme.spacing(2),
    },
    title: {
        color: 'white',
    },
    linkBtn: {
        textDecoration: 'none',
        '&:not(:last-child)': {
            marginRight: theme.spacing(1),
        },
    },
    drawerLink: {
        textDecoration: 'none',
        color: 'inherit',
    },
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: red[400],
        '&:hover': {
            backgroundColor: red[200],
        },
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
        flexGrow: 1,
    },
    searchIcon: {
        padding: theme.spacing(0, 2),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchInput: {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
        width: '100%',
        color: 'white',
    },
}));

export default function AppHeader() {
    const auth = useAuth();
    const styles = useStyles();
    const navigate = useNavigate();

    const [drawerOpen, setDrawerOpen] = useState(false);

    const onClickPaymentMethods = () => {
        axios
            .post('/api/v1/billing/portal', null, {
                headers: {
                    Authorization: `Bearer ${auth.jwtToken}`,
                },
            })
            .then((res) => {
                window.location.href = res.data.url;
            });
    };

    const isSmallScreen = useMediaQuery((theme) =>
        theme.breakpoints.down('sm')
    );

    return (
        <AppBar className={styles.root}>
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            >
                <List>
                    <Link to="/" className={styles.drawerLink}>
                        <ListItem button>
                            <ListItemIcon>
                                <HomeIcon />
                            </ListItemIcon>
                            <ListItemText disableTypography primary="Home" />
                        </ListItem>
                    </Link>
                    <Link to="/movies" className={styles.drawerLink}>
                        <ListItem button>
                            <ListItemIcon>
                                <MovieIcon />
                            </ListItemIcon>
                            <ListItemText primary="Movies" />
                        </ListItem>
                    </Link>
                    <Divider />
                    {auth.user ? (
                        <React.Fragment>
                            <ListItem button onClick={onClickPaymentMethods}>
                                <ListItemIcon>
                                    <WalletIcon />
                                </ListItemIcon>
                                <ListItemText primary="My Payment Methods" />
                            </ListItem>
                            <Link to="/tickets" className={styles.drawerLink}>
                                <ListItem button>
                                    <ListItemIcon>
                                        <TicketsIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="My Tickets" />
                                </ListItem>
                            </Link>
                            <ListItem button onClick={auth.signout}>
                                <ListItemIcon>
                                    <AuthenticateIcon />
                                </ListItemIcon>
                                <ListItemText primary="Logout" />
                            </ListItem>
                        </React.Fragment>
                    ) : (
                        <Link to="/auth/login">
                            <ListItem button>
                                <ListItemIcon>
                                    <AuthenticateIcon />
                                </ListItemIcon>
                                <ListItemText primary="Login" />
                            </ListItem>
                        </Link>
                    )}
                </List>
            </Drawer>
            <Toolbar>
                {isSmallScreen ? (
                    <IconButton
                        edge="start"
                        className={styles.logo}
                        onClick={() => setDrawerOpen(true)}
                    >
                        <MenuIcon htmlColor="white" />
                    </IconButton>
                ) : (
                    <Link to="/">
                        <Avatar alt="logo" src={Logo} className={styles.logo} />
                    </Link>
                )}
                <Link to="/" className={`${styles.linkBtn} ${styles.title}`}>
                    <Typography variant="h5">CineStack</Typography>
                </Link>
                <div className={styles.search}>
                    <div className={styles.searchIcon}>
                        <SearchIcon />
                    </div>
                    <InputBase
                        classes={{
                            input: styles.searchInput,
                        }}
                        placeholder="Search Movies"
                        inputProps={{ 'aria-label': 'search' }}
                        style={{ width: '100%' }}
                        onChange={(e) =>
                            navigate(`/movies/search?q=${e.target.value}`, {
                                replace: true,
                            })
                        }
                        onClick={() => {
                            navigate('/movies/search?q=');
                        }}
                    />
                </div>
                {!isSmallScreen &&
                    (auth.user ? (
                        <React.Fragment>
                            <IconButton
                                className={styles.linkBtn}
                                style={{ color: 'white' }}
                                onClick={onClickPaymentMethods}
                            >
                                <WalletIcon />
                            </IconButton>
                            <Link to="/tickets" className={styles.linkBtn}>
                                <Button variant="contained">My Tickets</Button>
                            </Link>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={auth.signout}
                            >
                                Logout
                            </Button>
                        </React.Fragment>
                    ) : (
                        <Link to="/auth/login" className={styles.linkBtn}>
                            <Button variant="contained">Login</Button>
                        </Link>
                    ))}
            </Toolbar>
        </AppBar>
    );
}
