import React, { useState, useEffect } from 'react';
import styles from './index.module.css';
import { Card, Typography, Spin } from 'antd';
import BackButton from '../../../components/pos/BackButton';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../../contexts/BookingContext';
import axios from 'axios';

export default function POSScreeningSelection() {
    const booking = useBooking();
    let navigate = useNavigate();

    const [movie, setMovie] = useState(null);

    // get relevant movie data from API
    useEffect(() => {
        axios
            .get(`/api/v1/movie/${booking.selectedMovie._id}`)
            .then((response) => {
                setMovie(response.data.movie);
            });
    }, []);

    console.log(movie);
    if (!movie)
        return (
            <div className={styles.loadingWrapper}>
                <Spin size="large" />
            </div>
        );
    else
        return (
            <div className={styles.container}>
                <div className={styles.posterHalf}>
                    <img
                        alt="example"
                        src={movie.promoMaterial.portraitBanner}
                    />
                </div>
                <div className={styles.screeningsList}>
                    {movie.screenings.length ? (
                        movie.screenings.map((screening) => {
                            return (
                                <Card
                                    className={styles.screening}
                                    bodyStyle={{ padding: 0 }}
                                    onClick={() => {
                                        booking.setSelectedScreening(screening);
                                        navigate('/pos/booking/seat-select');
                                    }}
                                >
                                    <Typography.Title level={2}>
                                        {new Date(
                                            screening.datetime
                                        ).toLocaleDateString('en-GB')}{' '}
                                        -{' '}
                                        {new Date(
                                            screening.datetime
                                        ).toLocaleTimeString('en-GB')}
                                    </Typography.Title>
                                </Card>
                            );
                        })
                    ) : (
                        <Typography.Title>No screenings found</Typography.Title>
                    )}
                    <section className={styles.backButtonWrapper}>
                        <BackButton
                            onClick={() =>
                                navigate('/pos/booking/movie-select')
                            }
                        />
                    </section>
                </div>
            </div>
        );
}
