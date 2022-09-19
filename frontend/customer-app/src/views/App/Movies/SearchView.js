import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router';

import axios from 'axios';
import {
    Grid,
    makeStyles,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@material-ui/core';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
    searchResult: {
        position: 'relative',
        '&:hover $movieDetails': {
            position: 'absolute',
            top: theme.spacing(3),
            right: theme.spacing(3),
            left: theme.spacing(3),
            bottom: theme.spacing(3),
            zIndex: '1',
            display: 'block',
        },
    },
    movieDetails: {
        display: 'none',
    },
    banner: {
        width: '100%',
        borderRadius: '5px',
    },
}));

export default function SearchView() {
    const styles = useStyles();
    const [movies, setMovies] = useState(null);
    const query = new URLSearchParams(useLocation().search).get('q');

    // get ALL DA MOVIES
    useEffect(() => {
        axios.get('/api/v1/movie/movies').then(async (res) => {
            // is this efficient? no
            // is it worth restructuring the backend for perf? no
            // does it work? yes
            let mov = [];
            for (let movie of res.data.docs)
                mov.push(
                    (await axios.get(`/api/v1/movie/${movie._id}`)).data.movie
                );
            setMovies(mov);
        });
    }, []);

    console.log(movies);
    return movies ? (
        <Grid container spacing={3}>
            {movies.map(
                (movie) =>
                    movie.title.toLowerCase().includes(query.toLowerCase()) && (
                        <Grid
                            key={movie._id}
                            item
                            xs={12}
                            md={6}
                            lg={4}
                            className={styles.searchResult}
                        >
                            <Link to={`/movies/${movie._id}`}>
                                <img
                                    src={movie.promoMaterial.portraitBanner}
                                    className={styles.banner}
                                />
                                <div className={styles.movieDetails}>
                                    <TableContainer
                                        className={styles.panel}
                                        component={Paper}
                                        variant="outlined"
                                        elevation={1}
                                    >
                                        <Table
                                            className={styles.details}
                                            size="small"
                                        >
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell
                                                        align="center"
                                                        colSpan={2}
                                                    >
                                                        {movie.title}
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell colSpan={2}>
                                                        {movie.blurb}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>
                                                        Age Rating
                                                    </TableCell>
                                                    <TableCell>
                                                        {movie.certificate}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>
                                                        Director
                                                    </TableCell>
                                                    <TableCell>
                                                        {movie.director}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow>
                                                    <TableCell>
                                                        Lead Actors
                                                    </TableCell>
                                                    <TableCell>
                                                        {movie.leadActors.join(
                                                            ', '
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </div>
                            </Link>
                        </Grid>
                    )
            )}
        </Grid>
    ) : null;
}
