import React, { useState } from 'react';

import {
    Avatar,
    Box,
    Button,
    Paper,
    Link,
    CardContent,
    CardHeader,
    TextField,
    useMediaQuery,
    Typography,
} from '@material-ui/core';
import { DatePicker } from '@material-ui/pickers';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { makeStyles } from '@material-ui/styles';
import { red, green } from '@material-ui/core/colors';

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
    errorText: {
        color: red[600],
    },
    successText: {
        color: green[600],
    },
    registerBtn: {
        height: '40px',
    },
}));

export default function RegisterView() {
    const auth = useAuth();

    const styles = useStyles();
    const isSmallScreen = useMediaQuery((theme) =>
        theme.breakpoints.down('sm')
    );
    const navigate = useNavigate();

    const [form, setForm] = useState(null);
    const [dob, setDob] = useState(null);
    const [errors, setErrors] = useState([]);
    const [success, setSuccess] = useState(false);

    // register handler
    const register = () => {
        const fields = new FormData(form);

        // check passwords match
        if (fields.get('password') != fields.get('passconfirm'))
            return setErrors(['Passwords do not match']);

        // register
        auth.signup(
            fields.get('name'),
            dob,
            fields.get('email'),
            fields.get('password')
        ).then((res) => {
            if (!res.error) {
                setSuccess(true);
                setTimeout(() => navigate('/auth/login'), 5000);
                return;
            }
            let e = [];
            for (let field of Object.values(res.error)) e.push(field.message);
            setErrors(e);
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
                title="Register"
                titleTypographyProps={{ align: 'center' }}
            />
            <CardContent>
                <form ref={(form) => setForm(form)} onSubmit={() => false}>
                    <Box
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                    >
                        <TextField
                            name="name"
                            label="Name"
                            type="text"
                            variant="outlined"
                            placeholder="Name"
                            className={styles.inputField}
                            required
                        />
                        <DatePicker
                            name="dob"
                            disableFuture
                            value={dob}
                            onChange={setDob}
                            openTo="year"
                            format="DD/MM/yyyy"
                            label="Date of Birth"
                            views={['year', 'month', 'date']}
                            inputVariant="outlined"
                            className={styles.inputField}
                            required
                        />
                        <TextField
                            name="email"
                            label="Email"
                            type="text"
                            variant="outlined"
                            placeholder="Email"
                            className={styles.inputField}
                            required
                        />
                        <TextField
                            name="password"
                            label="Password"
                            type="password"
                            variant="outlined"
                            placeholder="Password"
                            className={styles.inputField}
                            required
                        />
                        <TextField
                            name="passconfirm"
                            label="Confirm Password"
                            type="password"
                            variant="outlined"
                            placeholder="Confirm Password"
                            className={styles.inputField}
                            required
                        />
                        {errors.map((message) => (
                            <Typography
                                key={message}
                                variant="overline"
                                className={styles.errorMessage}
                            >
                                {message}
                            </Typography>
                        ))}
                        {success && (
                            <Typography variant="overline">
                                Check your email for a verification link!
                            </Typography>
                        )}
                        <Button
                            variant="contained"
                            color="primary"
                            disableElevation
                            className={styles.registerBtn}
                            onClick={register}
                        >
                            Register
                        </Button>
                        <Typography>
                            Already have an account?{' '}
                            <Link component={RouterLink} to="/auth/login">
                                Login instead
                            </Link>
                        </Typography>
                    </Box>
                </form>
            </CardContent>
        </Paper>
    );
}
