import React from 'react';
import styles from './index.module.css';
import { Card, Typography } from 'antd';
import { Link } from 'react-router-dom';

const welcomeBtnBodyStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
};

export default function POSLanding() {
    return (
        <div className={styles.welcomeContainer}>
            <Link to="/pos/tickets/search">
                <Card
                    className={styles.welcomeScreenBtn}
                    bodyStyle={welcomeBtnBodyStyle}
                >
                    <Typography.Title className={styles.welcomeScreenBtnText}>
                        Search Tickets
                    </Typography.Title>
                </Card>
            </Link>
            <Link to="/pos/booking/movie-select">
                <Card
                    className={styles.welcomeScreenBtn}
                    bodyStyle={welcomeBtnBodyStyle}
                >
                    <Typography.Title className={styles.welcomeScreenBtnText}>
                        Make Booking
                    </Typography.Title>
                </Card>
            </Link>
        </div>
    );
}
