import React, { useEffect, useState } from 'react';
import { styled } from '@material-ui/styles';
import {
    Button,
    CircularProgress,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Typography,
} from '@material-ui/core';
import axios from 'axios';
import { useAuth } from '../../../utils/useAuth';
import { useNavigate, useParams } from 'react-router';
import { loadStripe } from '@stripe/stripe-js';

const Ticket = styled(({ title, datetime, ...other }) => (
    <div {...other}>
        <Typography variant="h5" align="center">
            {title}
        </Typography>
        <Typography variant="h6" align="center" gutterBottom>
            {Intl.DateTimeFormat('en-GB', {
                day: 'numeric',
                month: 'long',
                hour: 'numeric',
                minute: 'numeric',
            }).format(new Date(datetime))}
        </Typography>
    </div>
))({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))',
    padding: '1em',
    fontSize: ' 16px',
    backgroundSize: '51% 100%',
    backgroundRepeat: 'no-repeat',
    backgroundImage:
        'radial-gradient(circle at 0 50%, rgba(255,255,224,0) 0.4em, #fffff0 0.5em), radial-gradient(circle at 100% 50%, rgba(255,255,224,0) 0.4em, #fffff0 0.5em)',
    backgroundPosition: 'top left, top right',
});

const PayButton = styled(Button)(({ theme }) => ({
    minWidth: '50vw',
    width: '340px',
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    '&:hover': {
        color: theme.palette.primary.main,
    },
}));

export default function PayView() {
    const auth = useAuth();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [stripe, setStripe] = useState(null);

    useEffect(async () => {
        setStripe(
            await loadStripe(
                'pk_test_51IcdXYGHRklWcmBt4kWCXAfk6oDuauqDPwO0S0fd01DeHCUDjXBLEnVh7Y9tinAdKax9g6Fn1GULlKbKLUQOjYnm00SkEOd2j9'
            )
        );
    }, []);

    const { ticketId } = useParams();

    const onPay = () => {
        axios
            .post(
                '/api/v1/billing/session',
                JSON.stringify({ ticket_ids: [ticketId] }),
                {
                    headers: {
                        Authorization: `Bearer ${auth.jwtToken}`,
                    },
                }
            )
            .then((res) => {
                stripe.redirectToCheckout({
                    sessionId: res.data.session,
                });
            });
    };

    // get ticket data onmount
    useEffect(() => {
        // verify logged in
        if (!auth.user) return navigate('/auth/login', { replace: true });

        // get data
        axios
            .get(`/api/v1/tickets/${ticketId}`, {
                headers: { Authorization: `Bearer ${auth.jwtToken}` },
            })
            .then((res) => {
                let ticket = { ...res.data.data };
                ticket.seats = ticket.seats.sort((a, b) =>
                    a[0] == b[0]
                        ? parseInt(a.substr(1)) - parseInt(b.substr(1))
                        : a.charCodeAt(0) - b.charCodeAt(0)
                );
                setTicket(ticket);
            });
    }, []);

    return (
        <Grid container direction="column" alignItems="center" spacing={3}>
            {ticket ? (
                <React.Fragment>
                    <Grid item>
                        <Ticket
                            title={ticket.screening.movie.title}
                            datetime={ticket.screening.datetime}
                            style={{ minWidth: '50vw', width: '340px' }}
                        />
                    </Grid>
                    <Grid item>
                        <TableContainer
                            component={Paper}
                            variant="outlined"
                            style={{ minWidth: '50vw', width: '340px' }}
                        >
                            <Table>
                                <TableBody>
                                    <TableRow>
                                        <TableCell variant="head" colSpan={2}>
                                            Ticket Information
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell variant="head" rowSpan={3}>
                                            Seats
                                        </TableCell>
                                        <TableCell>
                                            {ticket.seats.length}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>
                                            {ticket.seats
                                                .map((ticket) =>
                                                    ticket.substring(
                                                        0,
                                                        ticket.length - 1
                                                    )
                                                )
                                                .join(', ')}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>
                                            {(() => {
                                                let adults = 0,
                                                    children = 0,
                                                    senior = 0;

                                                ticket.seats.forEach((seat) => {
                                                    switch (
                                                        seat[seat.length - 1]
                                                    ) {
                                                        case 'C':
                                                            children++;
                                                            break;
                                                        case 'A':
                                                            adults++;
                                                            break;
                                                        case 'S':
                                                            senior++;
                                                            break;
                                                    }
                                                });

                                                return (
                                                    <React.Fragment>
                                                        Adult: {adults}
                                                        <br />
                                                        Child: {children}
                                                        <br />
                                                        Senior: {senior}
                                                    </React.Fragment>
                                                );
                                            })()}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell variant="head">
                                            Price
                                        </TableCell>
                                        <TableCell>£{ticket.price}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>
                    {stripe != null ? (
                        <Grid item>
                            <PayButton onClick={onPay}>Pay</PayButton>
                        </Grid>
                    ) : (
                        <Grid item>
                            <CircularProgress />
                        </Grid>
                    )}
                </React.Fragment>
            ) : (
                <CircularProgress />
            )}
        </Grid>
    );
}
