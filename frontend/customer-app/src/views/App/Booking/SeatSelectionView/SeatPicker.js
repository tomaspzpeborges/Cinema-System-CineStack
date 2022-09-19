import React from 'react';
import { styled } from '@material-ui/styles';
import { green, grey, purple, red } from '@material-ui/core/colors';
import { Tooltip, Typography } from '@material-ui/core';

const SeatBase = styled('span')(({ theme }) => ({
    width: '2rem',
    height: '2rem',
    borderRadius: '0.75rem 0.75rem 0 0',
    backgroundColor: 'black',
    transition: 'transform 0.2s',
    '&:hover': {
        transform: 'translateY(-5px)',
        cursor: 'pointer',
    },
    '&:not(:nth-last-child(2))': {
        marginRight: theme.spacing(1),
        '&:nth-child(4)': {
            marginRight: theme.spacing(3),
        },
        '&:nth-child(14)': {
            marginRight: theme.spacing(3),
        },
    },
}));

const Seat = {
    Occupied: styled(SeatBase)({
        backgroundColor: red[400],
        border: `5px solid ${red[600]}`,
        borderBottom: 0,
    }),
    Selected: styled(SeatBase)({
        backgroundColor: green[400],
        border: `5px solid ${green[600]}`,
        borderBottom: 0,
    }),
    Normal: styled(SeatBase)({
        backgroundColor: grey[400],
        border: `5px solid ${grey[600]}`,
        borderBottom: 0,
    }),
    VIP: styled(SeatBase)({
        backgroundColor: purple[400],
        border: `5px solid ${purple[600]}`,
        borderBottom: 0,
    }),
};

const SeatRow = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    '&:not(:last-child)': {
        marginBottom: theme.spacing(1),
    },
}));

const RowLabel = styled((props) => <Typography {...props} variant="h6" />)({
    width: '2rem',
    height: '2rem',
    lineHeight: '2rem',
    textAlign: 'center',
});

const SeatContainer = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-evenly',
});

const Screen = styled('div')({
    width: '100%',
    height: '20px',
    textAlign: 'center',
    color: 'white',
    backgroundColor: 'black',
    lineHeight: '20px',
});

export default function SeatPicker({
    occupiedSeats,
    selectedSeats,
    onSeatClick,
}) {
    const rows = [];
    for (let i = 'A'.charCodeAt(0); i <= 'M'.charCodeAt(0); i++) {
        let seats = [];
        seats.push(<RowLabel>{String.fromCharCode(i)}</RowLabel>);
        for (let seat = 1; seat <= 16; seat++) {
            if (occupiedSeats.includes(`${String.fromCharCode(i)}${seat}`))
                seats.push(<Seat.Occupied />);
            else if (selectedSeats.includes(`${String.fromCharCode(i)}${seat}`))
                seats.push(
                    <Seat.Selected
                        onClick={() =>
                            onSeatClick(`${String.fromCharCode(i)}${seat}`)
                        }
                    />
                );
            else if ('ABC'.includes(String.fromCharCode(i)))
                seats.push(
                    <Seat.VIP
                        onClick={() =>
                            onSeatClick(`${String.fromCharCode(i)}${seat}`)
                        }
                    />
                );
            else
                seats.push(
                    <Seat.Normal
                        onClick={() =>
                            onSeatClick(`${String.fromCharCode(i)}${seat}`)
                        }
                    />
                );
        }
        rows.push(<SeatRow>{seats}</SeatRow>);
        seats.push(<RowLabel>{String.fromCharCode(i)}</RowLabel>);
    }
    return (
        <SeatContainer>
            <SeatRow>
                <Tooltip
                    disableFocusListener
                    disableTouchListener
                    disableHoverListener
                    open={true}
                    arrow
                    title={<Typography>Occupied</Typography>}
                    placement="top"
                >
                    <Seat.Occupied />
                </Tooltip>
                <Tooltip
                    disableFocusListener
                    disableTouchListener
                    disableHoverListener
                    open={true}
                    arrow
                    title={<Typography>Normal</Typography>}
                    placement="top"
                >
                    <Seat.Normal />
                </Tooltip>
                <Tooltip
                    disableFocusListener
                    disableTouchListener
                    disableHoverListener
                    open={true}
                    arrow
                    title={<Typography>VIP</Typography>}
                    placement="top"
                >
                    <Seat.VIP />
                </Tooltip>
                <Tooltip
                    disableFocusListener
                    disableTouchListener
                    disableHoverListener
                    open={true}
                    arrow
                    title={<Typography>Selected</Typography>}
                    placement="top"
                >
                    <Seat.Selected />
                </Tooltip>
            </SeatRow>
            {rows}
            <Screen>Screen</Screen>
        </SeatContainer>
    );
}
