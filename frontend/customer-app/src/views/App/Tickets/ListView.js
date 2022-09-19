import React, { useEffect, useState } from 'react';
import { styled } from '@material-ui/styles';
import {
    Chip,
    CircularProgress,
    Container,
    Grid,
    TextField,
    Typography,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { red, green } from '@material-ui/core/colors';
import axios from 'axios';
import { useAuth } from '../../../utils/useAuth';
import { useNavigate } from 'react-router';

const Ticket = styled(({ title, createdAt, datetime, paid, ...other }) => (
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
        <Chip
            size="small"
            label={paid ? 'Confirmed' : 'Payment Pending'}
            style={{
                backgroundColor: paid ? green[400] : red[400],
                color: 'white',
            }}
        />
        {!paid && (
            <Chip
                size="small"
                label={`Expires in ${(
                    10 -
                    (new Date() - new Date(createdAt)) / 1000 / 60
                ).toFixed(1)} minutes`}
            />
        )}
    </div>
))({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))',
    padding: '1em',
    fontSize: ' 16px',
    backgroundSize: '50% 100%',
    backgroundRepeat: 'no-repeat',
    backgroundImage:
        'radial-gradient(circle at 0 50%, rgba(255,255,224,0) 0.4em, #fffff0 0.5em), radial-gradient(circle at 100% 50%, rgba(255,255,224,0) 0.4em, #fffff0 0.5em)',
    backgroundPosition: 'top left, top right',
    transition: 'transform 0.25s',
    transformOrigin: '0 100% 0',
    '&:hover': {
        transform: 'rotateZ(-10deg)',
        cursor: 'pointer',
    },
});

export default function ListView() {
    const auth = useAuth();
    const navigate = useNavigate();
    const [search, setSearch] = useState(null);
    const [tickets, setTickets] = useState(null);

    // get ticket data onmount
    useEffect(() => {
        // verify logged in
        if (!auth.user) return navigate('/auth/login', { replace: true });

        // get data
        axios
            .get('/api/v1/tickets', {
                headers: { Authorization: `Bearer ${auth.jwtToken}` },
            })
            .then((res) => setTickets(res.data.data));
    }, []);

    return (
        <Container>
            <TextField
                label="Search Tickets"
                variant="filled"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ float: 'right' }}
            />
            <Grid container spacing={2} justify="flex-start">
                {tickets != null ? (
                    tickets.length > 0 ? (
                        tickets.map((ticket) =>
                            search && search != '' ? (
                                ticket.screening.movie.title
                                    .toLowerCase()
                                    .includes(search.toLowerCase()) ? (
                                    <Grid item xs={6} md={3} key={ticket._id}>
                                        <Ticket
                                            title={ticket.screening.movie.title}
                                            createdAt={ticket.createdAt}
                                            datetime={ticket.screening.datetime}
                                            paid={ticket.paid}
                                            onClick={() =>
                                                ticket.paid
                                                    ? navigate(
                                                          `/tickets/${ticket._id}`
                                                      )
                                                    : navigate(
                                                          `/booking/pay/${ticket._id}`
                                                      )
                                            }
                                        />
                                    </Grid>
                                ) : null
                            ) : (
                                <Grid item xs={6} md={3} key={ticket._id}>
                                    <Ticket
                                        title={ticket.screening.movie.title}
                                        createdAt={ticket.createdAt}
                                        datetime={ticket.screening.datetime}
                                        paid={ticket.paid}
                                        onClick={() =>
                                            ticket.paid
                                                ? navigate(
                                                      `/tickets/${ticket._id}`
                                                  )
                                                : navigate(
                                                      `/booking/pay/${ticket._id}`
                                                  )
                                        }
                                    />
                                </Grid>
                            )
                        )
                    ) : (
                        <Alert severity="info">No tickets found!</Alert>
                    )
                ) : (
                    <CircularProgress />
                )}
            </Grid>
        </Container>
    );
}
