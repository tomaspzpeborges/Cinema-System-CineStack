import React, { useEffect, useState } from 'react';

import { useParams, useNavigate, useLocation } from 'react-router';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Typography,
} from '@material-ui/core';
import ArrowIcon from '@material-ui/icons/ArrowRightAlt';

import axios from 'axios';
import SeatPicker from './SeatPicker';

import { useAuth } from '../../../../utils/useAuth';
import { makeStyles } from '@material-ui/styles';
import { red } from '@material-ui/core/colors';

import { loadStripe } from '@stripe/stripe-js';

const useStyles = makeStyles((theme) => ({
    seatContainer: {
        display: 'flex',
        flexDirection: 'row',
        [theme.breakpoints.down('md')]: {
            flexDirection: 'column',
        },
    },
    seatTable: {
        height: 'fit-content',
        marginLeft: theme.spacing(2),
        width: '20rem',
        [theme.breakpoints.down('md')]: {
            marginTop: theme.spacing(2),
            marginLeft: 0,
            width: '100%',
        },
    },
    tableSection: {
        textAlign: 'center',
    },
}));

export default function SeatSelectionView() {
    const auth = useAuth();
    const styles = useStyles();
    const navigate = useNavigate();
    const location = useLocation();
    const [movie, setMovie] = useState(null);
    const [stripe, setStripe] = useState(null);
    const [screening, setScreening] = useState(null);
    const [occupiedSeats, setOccupiedSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [seatTypes, setSeatTypes] = useState({
        adultNormal: 0,
        adultVIP: 0,
        childNormal: 0,
        childVIP: 0,
        seniorNormal: 0,
        seniorVIP: 0,
    });

    const calculateTotalPrice = () =>
        seatTypes.adultNormal * movie.seatPricing.basePrice +
        seatTypes.adultVIP * movie.seatPricing.vipPrice +
        seatTypes.childNormal *
            movie.seatPricing.basePrice *
            (1 - movie.seatPricing.childDiscount / 100) +
        seatTypes.childVIP *
            movie.seatPricing.vipPrice *
            (1 - movie.seatPricing.childDiscount / 100) +
        seatTypes.seniorNormal *
            movie.seatPricing.basePrice *
            (1 - movie.seatPricing.seniorDiscount / 100) +
        seatTypes.seniorVIP *
            movie.seatPricing.vipPrice *
            (1 - movie.seatPricing.seniorDiscount / 100);

    const [loginBoxOpen, setLoginBoxOpen] = useState(false);
    const [error, setError] = useState(null);

    const handleSeatClick = (seat) => {
        if (!auth.user) return setLoginBoxOpen(true);
        const idx = selectedSeats.indexOf(seat);
        if (idx == -1)
            return setSelectedSeats(
                [...selectedSeats, seat].sort((a, b) =>
                    a[0] == b[0]
                        ? parseInt(a.substr(1)) - parseInt(b.substr(1))
                        : a.charCodeAt(0) - b.charCodeAt(0)
                )
            );

        selectedSeats.splice(idx, 1);
        setSelectedSeats(
            [...selectedSeats].sort((a, b) =>
                a[0] == b[0]
                    ? parseInt(a.substr(1)) - parseInt(b.substr(1))
                    : a.charCodeAt(0) - b.charCodeAt(0)
            )
        );
    };

    const handleNext = () => {
        let oldSeats = [...selectedSeats];
        let newSeats = [];

        for (let i = 0; i < seatTypes.adultNormal; i++) {
            let cSeat = null;
            for (let cSeatIdx = 0; cSeatIdx < oldSeats.length; cSeatIdx++)
                if ('DEFGHIKLM'.includes(oldSeats[cSeatIdx][0])) {
                    cSeat = oldSeats[cSeatIdx] + 'A';
                    oldSeats.splice(cSeatIdx, 1);
                    break;
                }
            if (!cSeat)
                return setError(
                    'Mismatch in number of standard seats selected to booking quantity'
                );
            newSeats.push(cSeat);
        }
        for (let i = 0; i < seatTypes.childNormal; i++) {
            let cSeat = null;
            for (let cSeatIdx = 0; cSeatIdx < oldSeats.length; cSeatIdx++)
                if ('DEFGHIKLM'.includes(oldSeats[cSeatIdx][0])) {
                    cSeat = oldSeats[cSeatIdx] + 'C';
                    oldSeats.splice(cSeatIdx, 1);
                    break;
                }
            if (!cSeat)
                return setError(
                    'Mismatch in number of standard seats selected to booking quantity'
                );
            newSeats.push(cSeat);
        }
        for (let i = 0; i < seatTypes.seniorNormal; i++) {
            let cSeat = null;
            for (let cSeatIdx = 0; cSeatIdx < oldSeats.length; cSeatIdx++)
                if ('DEFGHIKLM'.includes(oldSeats[cSeatIdx][0])) {
                    cSeat = oldSeats[cSeatIdx] + 'S';
                    oldSeats.splice(cSeatIdx, 1);
                    break;
                }
            if (!cSeat)
                return setError(
                    'Mismatch in number of standard seats selected to booking quantity'
                );
            newSeats.push(cSeat);
        }

        for (let i = 0; i < seatTypes.adultVIP; i++) {
            let cSeat = null;
            for (let cSeatIdx = 0; cSeatIdx < oldSeats.length; cSeatIdx++)
                if ('ABC'.includes(oldSeats[cSeatIdx][0])) {
                    cSeat = oldSeats[cSeatIdx] + 'A';
                    oldSeats.splice(cSeatIdx, 1);
                    break;
                }
            if (!cSeat)
                return setError(
                    'Mismatch in number of VIP seats selected to booking quantity'
                );
            newSeats.push(cSeat);
        }
        for (let i = 0; i < seatTypes.childVIP; i++) {
            let cSeat = null;
            for (let cSeatIdx = 0; cSeatIdx < oldSeats.length; cSeatIdx++)
                if ('ABC'.includes(oldSeats[cSeatIdx][0])) {
                    cSeat = oldSeats[cSeatIdx] + 'C';
                    oldSeats.splice(cSeatIdx, 1);
                    break;
                }
            if (!cSeat)
                return setError(
                    'Mismatch in number of VIP seats selected to booking quantity'
                );
            newSeats.push(cSeat);
        }
        for (let i = 0; i < seatTypes.seniorVIP; i++) {
            let cSeat = null;
            for (let cSeatIdx = 0; cSeatIdx < oldSeats.length; cSeatIdx++)
                if ('ABC'.includes(oldSeats[cSeatIdx][0])) {
                    cSeat = oldSeats[cSeatIdx] + 'S';
                    oldSeats.splice(cSeatIdx, 1);
                    break;
                }
            if (!cSeat)
                return setError(
                    'Mismatch in number of VIP seats selected to booking quantity'
                );
            newSeats.push(cSeat);
        }

        axios
            .post(
                '/api/v1/tickets',
                JSON.stringify({ screening: screening._id, seats: newSeats }),
                {
                    headers: {
                        Authorization: `Bearer ${auth.jwtToken}`,
                    },
                }
            )
            .then((res) => {
                axios
                    .post(
                        '/api/v1/billing/session',
                        JSON.stringify({ ticket_ids: [res.data.data] }),
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
            })
            .catch(() => setError('Server error occured, try again later'));
    };

    // handle logout during booking
    useEffect(() => {
        if (!auth.user) setSelectedSeats([]);
    }, [auth]);

    const { screeningId } = useParams();

    // get data at the beginning
    useEffect(async () => {
        // get screening data
        let scr = (await axios.get(`/api/v1/movie/screening/${screeningId}`))
            .data.screening;
        setScreening(scr);

        // get occupied seats data
        setOccupiedSeats(
            (await axios.get(`/api/v1/tickets/screening/${screeningId}`)).data
                .data
        );

        // get movie data
        setMovie((await axios.get(`/api/v1/movie/${scr.movie}`)).data.movie);

        // load stripe
        setStripe(
            await loadStripe(
                'pk_test_51IcdXYGHRklWcmBt4kWCXAfk6oDuauqDPwO0S0fd01DeHCUDjXBLEnVh7Y9tinAdKax9g6Fn1GULlKbKLUQOjYnm00SkEOd2j9'
            )
        );
    }, []);

    const renderSelectOptions = () => {
        let items = [];
        for (let i = 0; i <= selectedSeats.length; i++)
            items.push(<MenuItem value={i}>{i}</MenuItem>);
        return items;
    };

    return movie && screening && occupiedSeats ? (
        <Grid container spacing={3} direction="column" alignItems="center">
            <Dialog open={error} onClose={() => setError(null)}>
                <DialogTitle>Error</DialogTitle>
                <DialogContent>{error}</DialogContent>
                <DialogActions>
                    <Button onClick={() => setError(null)}>Dismiss</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={loginBoxOpen} onClose={() => setLoginBoxOpen(false)}>
                <DialogTitle>Login Required</DialogTitle>
                <DialogContent>You must login to start a booking</DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setLoginBoxOpen(false)}
                        color="secondary"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() =>
                            navigate(`/auth/login?r=${location.pathname}`)
                        }
                        color="Primary"
                    >
                        Login
                    </Button>
                </DialogActions>
            </Dialog>
            <Grid item>
                <Typography variant="h2" align="center">
                    {movie.title}
                </Typography>
            </Grid>
            <Grid item>
                <Typography variant="h4" align="center">
                    {Intl.DateTimeFormat('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        hour: 'numeric',
                        minute: 'numeric',
                    }).format(new Date(screening.datetime))}
                </Typography>
            </Grid>
            <Grid item style={{ marginTop: '3rem' }}>
                <Box className={styles.seatContainer}>
                    <SeatPicker
                        occupiedSeats={occupiedSeats}
                        selectedSeats={selectedSeats}
                        onSeatClick={handleSeatClick}
                    />
                    <TableContainer
                        className={styles.seatTable}
                        component={Paper}
                        variant="outlined"
                    >
                        <Table className={styles.details} size="small">
                            <TableBody>
                                <TableRow>
                                    <TableCell
                                        variant="head"
                                        colSpan={2}
                                        className={styles.tableSection}
                                    >
                                        Booking Information
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell variant="head" rowSpan={2}>
                                        Seats
                                    </TableCell>
                                    <TableCell>
                                        {selectedSeats.length}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>
                                        {selectedSeats.length > 0
                                            ? selectedSeats.join(', ')
                                            : 'No seats selected'}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell variant="head">Adult</TableCell>
                                    <TableCell>
                                        Normal:{' '}
                                        <Select
                                            value={seatTypes.adultNormal}
                                            defaultValue={0}
                                            onChange={(e) =>
                                                setSeatTypes({
                                                    ...seatTypes,
                                                    adultNormal: e.target.value,
                                                })
                                            }
                                        >
                                            {renderSelectOptions()}
                                        </Select>
                                        @ £{movie.seatPricing.basePrice}
                                        <br />
                                        VIP:{' '}
                                        <Select
                                            value={seatTypes.adultVIP}
                                            defaultValue={0}
                                            onChange={(e) =>
                                                setSeatTypes({
                                                    ...seatTypes,
                                                    adultVIP: e.target.value,
                                                })
                                            }
                                        >
                                            {renderSelectOptions()}
                                        </Select>
                                        @ £{movie.seatPricing.vipPrice}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell variant="head">Child</TableCell>
                                    <TableCell>
                                        Normal:{' '}
                                        <Select
                                            value={seatTypes.childNormal}
                                            defaultValue={0}
                                            onChange={(e) =>
                                                setSeatTypes({
                                                    ...seatTypes,
                                                    childNormal: e.target.value,
                                                })
                                            }
                                        >
                                            {renderSelectOptions()}
                                        </Select>
                                        @ £
                                        {movie.seatPricing.basePrice *
                                            (1 -
                                                movie.seatPricing
                                                    .seniorDiscount /
                                                    100)}
                                        <br />
                                        VIP:{' '}
                                        <Select
                                            value={seatTypes.childVIP}
                                            defaultValue={0}
                                            onChange={(e) =>
                                                setSeatTypes({
                                                    ...seatTypes,
                                                    childVIP: e.target.value,
                                                })
                                            }
                                        >
                                            {renderSelectOptions()}
                                        </Select>
                                        @ £
                                        {movie.seatPricing.vipPrice *
                                            (1 -
                                                movie.seatPricing
                                                    .seniorDiscount /
                                                    100)}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell variant="head">Senior</TableCell>
                                    <TableCell>
                                        Normal:{' '}
                                        <Select
                                            value={seatTypes.seniorNormal}
                                            defaultValue={0}
                                            onChange={(e) =>
                                                setSeatTypes({
                                                    ...seatTypes,
                                                    seniorNormal:
                                                        e.target.value,
                                                })
                                            }
                                        >
                                            {renderSelectOptions()}
                                        </Select>
                                        @ £
                                        {movie.seatPricing.basePrice *
                                            (1 -
                                                movie.seatPricing
                                                    .seniorDiscount /
                                                    100)}
                                        <br />
                                        VIP:{' '}
                                        <Select
                                            value={seatTypes.senior}
                                            defaultValue={0}
                                            onChange={(e) =>
                                                setSeatTypes({
                                                    ...seatTypes,
                                                    senior: e.target.value,
                                                })
                                            }
                                        >
                                            {renderSelectOptions()}
                                        </Select>
                                        @ £
                                        {movie.seatPricing.vipPrice *
                                            (1 -
                                                movie.seatPricing
                                                    .seniorDiscount /
                                                    100)}
                                    </TableCell>
                                </TableRow>
                                {Object.values(seatTypes).reduce(
                                    (total, v) => total + v,
                                    0
                                ) != selectedSeats.length ||
                                selectedSeats.length == 0 ? (
                                    <TableRow>
                                        <TableCell
                                            variant="head"
                                            colSpan={2}
                                            style={{ color: red[400] }}
                                            className={styles.tableSection}
                                        >
                                            {selectedSeats.length > 0
                                                ? 'Total does not match seats!'
                                                : 'Please select seats'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    <React.Fragment>
                                        <TableRow>
                                            <TableCell
                                                variant="head"
                                                colSpan={2}
                                                className={styles.tableSection}
                                            >
                                                Total Price
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell
                                                colSpan={2}
                                                className={styles.tableSection}
                                            >
                                                £{calculateTotalPrice()}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell colSpan={2}>
                                                <Button
                                                    style={{ float: 'right' }}
                                                    color="primary"
                                                    endIcon={<ArrowIcon />}
                                                    onClick={handleNext}
                                                >
                                                    Pay
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    </React.Fragment>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Grid>
        </Grid>
    ) : null;
}
