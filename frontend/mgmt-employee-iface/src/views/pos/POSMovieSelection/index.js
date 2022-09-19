import React, { useState, useEffect, useContext } from 'react';
import { Input, Card, Typography, Spin } from 'antd';
import BackButton from '../../../components/pos/BackButton';
import styles from './index.module.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Carousel from '@brainhubeu/react-carousel';
import '@brainhubeu/react-carousel/lib/style.css';
import { useBooking } from '../../../contexts/BookingContext';

const movieItemStyle = {
    width: '15vw',
    maxWidth: 275,
};
export default function POSMovieSelection() {
    const booking = useBooking();

    const [moviesList, setMoviesList] = useState([]);
    const [searchBoxValue, setSearchBoxValue] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setLoading] = useState(false);

    // get movie list from API
    useEffect(() => {
        setLoading(true);
        axios.get('/api/v1/movie/movies').then((response) => {
            setMoviesList(response.data.docs);
            setSearchResults(response.data.docs);
            setLoading(false);
        });
    }, []);

    // filter movie list when searchbox input changes
    useEffect(() => {
        console.log(searchBoxValue);
        const results = moviesList.filter((movie) =>
            movie.title.toLowerCase().includes(searchBoxValue)
        );
        setSearchResults(results);
    }, [searchBoxValue]);

    const handleMovieSelected = (id) => {
        booking.setSelectedMovie(id);
        navigate('/pos/booking/screening-select');
    };

    let navigate = useNavigate();
    // TODO: fix slider scaling issues
    return (
        <div className={styles.container}>
            <section className={styles.searchBoxWrapper}>
                <Input
                    className={styles.searchBox}
                    size="large"
                    placeholder="Search by title"
                    bordered={false}
                    onChange={(e) => setSearchBoxValue(e.target.value)}
                />
            </section>
            {isLoading && <Spin />}
            {!isLoading && moviesList.length ? (
                <Carousel arrows slidesPerPage={4}>
                    {searchResults.map((movie) => {
                        return (
                            <Card
                                style={movieItemStyle}
                                className={styles.movieCard}
                                cover={
                                    <img
                                        alt="example"
                                        src={movie.promoMaterial.portraitBanner}
                                    />
                                }
                                onClick={() => handleMovieSelected(movie)}
                            >
                                <Card.Meta
                                    title={movie.title}
                                    description={`${movie.director} - ${movie.certificate}`}
                                />
                            </Card>
                        );
                    })}
                </Carousel>
            ) : (
                <Typography.Title>No movies found</Typography.Title>
            )}
            <section className={styles.backButtonWrapper}>
                <BackButton
                    onClick={() => navigate('/pos/home')}
                />
            </section>
        </div>
    );
}
