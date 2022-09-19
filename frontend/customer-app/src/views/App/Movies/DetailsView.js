import {
    Button,
    CircularProgress,
    Grid,
    makeStyles,
    Modal,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@material-ui/core';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
    loadingModal: {
        display: 'grid',
        placeItems: 'center',
    },
    panel: {
        width: '100%',
        marginBottom: theme.spacing(2),
    },
    screenings: {
        order: 2,
        [theme.breakpoints.down('sm')]: {
            order: 1,
        },
    },
    movieDetails: {
        order: 1,
        [theme.breakpoints.down('sm')]: {
            order: 2,
        },
    },
    screeningLink: {
        textDecoration: 'none',
        '&:not(:last-child)': {
            marginRight: theme.spacing(1),
        },
    },
    details: {
        width: '100%',
    },
    movieBanner: {
        width: '100%',
    },
}));

export default function DetailsView() {
    const { movieId } = useParams();
    const styles = useStyles();
    const [movieDeets, setMovieDeets] = useState(null);

    // get movie details first thing
    useEffect(() => {
        axios.get(`/api/v1/movie/${movieId}`).then((res) => {
            let data = { ...res.data.movie }; // shallow copy

            // process screenings
            let screenings = {};
            let screeningsArr = [];

            for (let screening of data.screenings) {
                let dateStr = screening.datetime.substring(
                    0,
                    screening.datetime.indexOf('T')
                );
                if (!screenings[dateStr]) screenings[dateStr] = [];
                screenings[dateStr].push(screening);
            }

            for (let [k, v] of Object.entries(screenings))
                screeningsArr.push([k, v]);

            screeningsArr.sort(
                (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
            );

            console.log(screeningsArr);

            data.screenings = screeningsArr;
            setMovieDeets(data);
        });
    }, []);

    return movieDeets ? (
        <Grid container justify="center" spacing={6}>
            <Grid item xs={12} md={4} className={styles.movieDetails}>
                <TableContainer
                    className={styles.panel}
                    component={Paper}
                    variant="outlined"
                    elevation={1}
                >
                    <Table className={styles.details} size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" colSpan={2}>
                                    {movieDeets.title}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={2}>
                                    {movieDeets.blurb}
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Age Rating</TableCell>
                                <TableCell>{movieDeets.certificate}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Director</TableCell>
                                <TableCell>{movieDeets.director}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Lead Actors</TableCell>
                                <TableCell>
                                    {movieDeets.leadActors.join(', ')}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
                <iframe
                    src={movieDeets.promoMaterial.trailer.replace(
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
                <img
                    src={movieDeets.promoMaterial.portraitBanner}
                    className={styles.movieBanner}
                />
            </Grid>

            <Grid item xs={12} md={8} className={styles.screenings}>
                <TableContainer
                    className={styles.panel}
                    component={Paper}
                    variant="outlined"
                >
                    <Table className={styles.details} size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" colSpan={2}>
                                    Screenings
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {movieDeets.screenings.map(
                                ([date, screenings]) =>
                                    new Date(date) - new Date() >= 6e5 && (
                                        <TableRow key={date}>
                                            <TableCell>
                                                {Intl.DateTimeFormat('en-GB', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                }).format(new Date(date))}
                                            </TableCell>
                                            <TableCell>
                                                {screenings.map((screening) => (
                                                    <Link
                                                        key={screening.datetime}
                                                        to={`/booking/seats/${screening._id}`}
                                                        className={
                                                            styles.screeningLink
                                                        }
                                                    >
                                                        <Button
                                                            variant="contained"
                                                            color="secondary"
                                                        >
                                                            {Intl.DateTimeFormat(
                                                                'en-GB',
                                                                {
                                                                    hour:
                                                                        'numeric',
                                                                    minute:
                                                                        'numeric',
                                                                }
                                                            ).format(
                                                                new Date(
                                                                    screening.datetime
                                                                )
                                                            )}
                                                        </Button>
                                                    </Link>
                                                ))}
                                            </TableCell>
                                        </TableRow>
                                    )
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </Grid>
    ) : (
        <Modal open={true} className={styles.loadingModal}>
            <CircularProgress />
        </Modal>
    );
}
