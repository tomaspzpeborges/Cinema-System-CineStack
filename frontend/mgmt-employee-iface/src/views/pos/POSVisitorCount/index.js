import React from 'react';
import { InputNumber, Button } from 'antd';
import styles from './index.module.css';
import { useBooking } from '../../../contexts/BookingContext';
import { PlusOutlined, MinusOutlined, RightOutlined } from '@ant-design/icons';
import BackButton from '../../../components/pos/BackButton';
import { useNavigate } from 'react-router-dom';

export default function POSVisitorCount() {
    let navigate = useNavigate();
    const booking = useBooking();

    const incrementAdult = () => booking.addMember("adult");

    const decrementAdult = () => {
        if (booking.members.length - 1 < 0) return;
        booking.removeMember("adult");
    };

    const incrementChild = () => booking.addMember("child");

    const decrementChild = () => {
        if (booking.members.length - 1 < 0) return;
        booking.removeMember("child");
    };

    const canSubmit = booking.members.length;
    console.log(booking.members);
    return (
        <div className={styles.container}>
            <div className={styles.category}>
                <span className={styles.thicc}>Adults</span>
                <span className={styles.thicc}>{booking.numAdults}</span>
                <Button
                    icon={<MinusOutlined />}
                    className={styles.thiccBtn}
                    onClick={decrementAdult}
                ></Button>
                <Button
                    icon={<PlusOutlined />}
                    className={styles.thiccBtn}
                    onClick={incrementAdult}
                ></Button>
            </div>
            <div className={styles.category}>
                <span className={styles.thicc}>Children</span>
                <span className={styles.thicc}>{booking.numChildren}</span>
                <Button
                    icon={<MinusOutlined />}
                    className={styles.thiccBtn}
                    onClick={decrementChild}
                ></Button>
                <Button
                    icon={<PlusOutlined />}
                    className={styles.thiccBtn}
                    onClick={incrementChild}
                ></Button>
            </div>
            <section className={styles.backButtonWrapper}>
                <BackButton onClick={() => navigate('/pos/home')} />
            </section>
            <section className={styles.nextButtonWrapper}>
                <Button
                    size="large"
                    className={styles.nextButton}
                    icon={<RightOutlined />}
                    disabled={!canSubmit}
                    onClick={() => navigate('/pos/booking/movie-select')}
                >
                    Next
                </Button>
            </section>
        </div>
    );
}
