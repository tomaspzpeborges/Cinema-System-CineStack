import React, { useState, useEffect } from 'react';
import styles from './index.module.css';
import { Card, Button } from 'antd';
import BackButton from '../../../components/pos/BackButton';
import { useNavigate } from 'react-router-dom';
import SeatPicker from '../../../components/pos/SeatPicker';
import { useBooking } from '../../../contexts/BookingContext';
import axios from 'axios';
import {
    Box,
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
import { red } from '@material-ui/core/colors';

export default function POSSeatSelection() {
    let navigate = useNavigate();
    const booking = useBooking();

    const totalMembers = booking.numAdults + booking.numChildren;
    const [seatMap, setSeatMap] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [error, setError] = useState(null);
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

    const handleSeatClick = (seat) => {
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

    const renderSelectOptions = () => {
        let items = [];
        for (let i = 0; i <= selectedSeats.length; i++)
            items.push(<MenuItem value={i}>{i}</MenuItem>);
        return items;
    };

    const confirmSeatSelection = () => {
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

        booking.createTicket(newSeats);
        // nav to payment page
        navigate('/pos/booking/payment-select');
    };

    useEffect(() => {
        if (!booking.selectedMovie) navigate('/pos/booking/movie-select');

        axios
            .get(`/api/v1/tickets/screening/${booking.selectedScreening}`)
            .then((response) => {
                console.log(response);
                setSeatMap(response.data.data);
            });
    }, []);

    const movie = booking.selectedMovie;
    return (
        <div className={styles.container}>
            <Dialog open={error} onClose={() => setError(null)}>
                <DialogTitle>Error</DialogTitle>
                <DialogContent>{error}</DialogContent>
                <DialogActions>
                    <Button onClick={() => setError(null)}>Dismiss</Button>
                </DialogActions>
            </Dialog>

            <div className={styles.seatSel}>
                <Card className={styles.seatSelCard}>
                    <SeatPicker
                        occupiedSeats={seatMap}
                        selectedSeats={selectedSeats}
                        onSeatClick={handleSeatClick}
                    />
                </Card>
            </div>
            <div className={styles.actions}>
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
                                <TableCell>{selectedSeats.length}</TableCell>
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
                                            movie.seatPricing.seniorDiscount /
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
                                            movie.seatPricing.seniorDiscount /
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
                                                seniorNormal: e.target.value,
                                            })
                                        }
                                    >
                                        {renderSelectOptions()}
                                    </Select>
                                    @ £
                                    {movie.seatPricing.basePrice *
                                        (1 -
                                            movie.seatPricing.seniorDiscount /
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
                                            movie.seatPricing.seniorDiscount /
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
                                </React.Fragment>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Button
                    size="large"
                    className={styles.confirmBtn}
                    onClick={() => confirmSeatSelection()}
                >
                    Confirm
                </Button>
                <section className={styles.backButtonWrapper}>
                    <BackButton
                        onClick={() =>
                            navigate('/pos/booking/screening-select')
                        }
                    />
                </section>
            </div>
        </div>
    );
}
