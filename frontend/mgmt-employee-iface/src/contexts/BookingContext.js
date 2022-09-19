import axios from 'axios';
import React, { useState, useContext } from 'react';

const BookingContext = React.createContext();

export function BookingProvider(props) {
    const booking = useProvideBooking();
    return (
        <BookingContext.Provider value={booking}>
            {props.children}
        </BookingContext.Provider>
    );
}

export const useBooking = () => {
    return useContext(BookingContext);
};

function useProvideBooking() {
    const [numAdults, setNumAdults] = useState(0);
    const [numChildren, setNumChildren] = useState(0);
    const [members, setMembers] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [selectedScreening, setSelectedScreening] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [ticket, setTicket] = useState(null);

    // a utility function to remove a single item from an array
    // returns new array with the item removed
    const removeItemFromArray = (array, item) => {
        let newArr = array;
        var index = newArr.indexOf(item);
        if (index > -1) {
            newArr.splice(index, 1);
        }
        return newArr;
    };

    const addMember = (type) => {
        setMembers((oldArray) => [
            ...oldArray,
            {
                type: type,
                seat: '',
            },
        ]);
        switch (type) {
            case 'adult':
                setNumAdults(numAdults + 1);
                break;
            case 'child':
                setNumChildren(numChildren + 1);
                break;
        }
    };

    const removeMember = (type) => {
        for (let member of members) {
            // prioritize members without seat
            if (member.type == type && member.seat == '') {
                setMembers(removeItemFromArray(members, member));
                switch (type) {
                    case 'adult':
                        setNumAdults(numAdults - 1);
                        break;
                    case 'child':
                        setNumChildren(numChildren - 1);
                        break;
                }
                return;
            }

            // else, remove the first member of that type
            if (member.type == type) {
                setMembers(removeItemFromArray(members, member));
                switch (type) {
                    case 'adult':
                        setNumAdults(numAdults - 1);
                        break;
                    case 'child':
                        setNumChildren(numChildren - 1);
                        break;
                }
                return;
            }
        }
    };

    const createTicket = (seats) => {
        let ticketObj = {
            screening: selectedScreening,
            seats: seats,
        };

        axios
            .post('/api/v1/tickets', ticketObj)
            .then(
                (response) => setTicket(response.data),
                (error) => window.alert(error)
            );
    };

    //booking  done, clear all state and prepare for the next one
    const finishBooking = () => {
        setSelectedMovie(null);
        setSelectedScreening(null);
        setSelectedSeats([]);
        setTicket({});
    };

    return {
        numAdults,
        numChildren,
        members,
        setMembers,
        addMember,
        removeMember,
        setNumAdults,
        setNumChildren,
        selectedMovie,
        setSelectedMovie,
        setSelectedScreening,
        selectedScreening,
        createTicket,
        ticket,
        finishBooking,
    };
}
