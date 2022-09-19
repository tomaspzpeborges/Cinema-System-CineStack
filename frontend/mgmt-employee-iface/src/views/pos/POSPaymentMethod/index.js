import React from 'react';
import styles from './index.module.css';
import { Card, Typography } from 'antd';
import { DollarCircleOutlined, CreditCardOutlined } from '@ant-design/icons';
import BackButton from '../../../components/pos/BackButton';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useBooking } from '../../../contexts/BookingContext';

export default function POSPaymentMethod() {
    const cardStyle = {
        height: 200,
        width: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
        cursor: 'pointer',
    };

    let navigate = useNavigate();
    const booking = useBooking();

    const makePayment = () => {
        console.log(booking.ticket);
        axios
            .post('/api/v1/billing/pos', { id: booking.ticket })
            .then((response) => {
                window.alert('Payment successful');
                navigate('/pos/home');
            })
            .catch((error) => {
                window.alert(`Payment failed: ${error}`);
            });
    };

    return (
        <div className={styles.container}>
            <Card bodyStyle={cardStyle} onClick={makePayment}>
                <DollarCircleOutlined style={{ fontSize: 120 }} />
                <Typography.Title level={2}>Cash</Typography.Title>
            </Card>
            <Card bodyStyle={cardStyle} onClick={makePayment}>
                <CreditCardOutlined style={{ fontSize: 120 }} />
                <Typography.Title level={2}>Card</Typography.Title>
            </Card>
            <section className={styles.backButtonWrapper}>
                <BackButton
                    onClick={() => navigate('/pos/booking/seat-select')}
                />
            </section>
        </div>
    );
}
