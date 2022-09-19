import React, { useEffect, useState } from 'react';

import Carousel from 'react-material-ui-carousel';

import axios from 'axios';
import { Box, makeStyles, useMediaQuery } from '@material-ui/core';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
    carousel: {
        width: '50%',
        [theme.breakpoints.down('md')]: {
            width: '75%',
        },
        [theme.breakpoints.down('sm')]: {
            width: '100%',
        },
        marginBottom: theme.spacing(4),
    },
    poster: {
        width: '25%',
        [theme.breakpoints.down('md')]: {
            width: '75%',
            marginBottom: theme.spacing(2),
        },
        [theme.breakpoints.up('md')]: {
            marginRight: theme.spacing(2),
        },
    },
}));

export default function HomepageView() {
    const styles = useStyles();
    const [movies, setMovies] = useState([]);
    useEffect(() => {
        axios.get('/api/v1/movie/movies').then(async (res) => {
            let randomMovies = [];
            // get 3 random, but unique movies
            while (randomMovies.length < 3) {
                let candidate =
                    res.data.docs[
                        Math.floor(Math.random() * res.data.docs.length)
                    ];

                if (!randomMovies.includes(candidate))
                    randomMovies.push(candidate);
            }

            let movieDeets = [];
            for (let movie of randomMovies) {
                let deets = await axios.get(`/api/v1/movie/${movie['_id']}`);
                movieDeets.push(deets.data.movie);
            }
            setMovies(movieDeets);
        });
    }, []);
    const isMediumScreen = useMediaQuery((theme) =>
        theme.breakpoints.down('md')
    );

    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
        >
            <Carousel className={styles.carousel} animation="slide">
                {movies.map((mov) => (
                    <img
                        style={{ width: '100%', height: '100%' }}
                        key={mov._id}
                        alt="movie landscape banner"
                        src={mov.promoMaterial.landscapeBanner}
                    />
                ))}
            </Carousel>
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                width="100%"
                flexDirection={isMediumScreen ? 'column' : 'row'}
            >
                {movies.map((mov) => (
                    <Box
                        key={mov._id}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        className={styles.poster}
                    >
                        <iframe
                            src={mov.promoMaterial.trailer.replace(
                                'watch?v=',
                                'embed/'
                            )}
                            frameBorder="0"
                            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="Trailer"
                            width="100%"
                            height={300}
                        />
                        <Link to={`/movies/${mov._id}`}>
                            <img
                                alt="movie portrait banner"
                                src={mov.promoMaterial.portraitBanner}
                                style={{ width: '100%' }}
                            />
                        </Link>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
