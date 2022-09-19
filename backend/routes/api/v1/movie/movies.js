'use strict';

const mongoose = require('mongoose');
let Movie = mongoose.model('Movie');
let Screening = mongoose.model('Screening');
const Staff = mongoose.model('Staff');
const Ticket = mongoose.model('Ticket');

const passport = require('passport');

module.exports = function ({ app, logger }) {
    app.get('/api/v1/movie/screening/:id', async (req, res) => {
        let scr = await Screening.findById(req.params.id);
        if (!scr) return res.sendStatus(404); // not found

        res.json({
            result: 'ok',
            screening: scr,
        });
    });

    //gets all movies
    app.get('/api/v1/movie/movies', async function (req, res) {

        Movie.find({}, function (err, docs) {
            if (err) {
                res.status(400).json({
                    result: 'error',
                });
                return;
            } else {
                res.status(200).json({
                    result: 'ok',
                    docs,
                });
                return;
            }
        });
    });

    //gets movie based on id
    app.get('/api/v1/movie/:id', async function (req, res) {
        let movie;
        try {
            movie = await Movie.findById(req.params.id);
            if (!movie) return res.sendStatus(404);

            await movie.populate('screenings').execPopulate();
        } catch (e) {
            res.status(500).json({
                result: 'error',
            });
        }

        res.status(200).json({
            result: 'ok',
            movie,
        });
    });

    // store the sent movie
    app.post(
        '/api/v1/movie',
        passport.authenticate('jwt', { session: false }),
        async (req, res) => {
            //needs to be auth'd
            if (!req.isAuthenticated()) {
                res.status(401).json({
                    result: 'error',
                    reason: 'could not verify auth token',
                });
                return;
            }

            //needs to be a staff member
            if (!(req.user instanceof Staff)) {
                res.status(401).json({
                    result: 'error',
                    reason: 'user does not have permission',
                });
                return;
            }

            //needs to be manager
            if (req.user.type != 0) {
                res.status(401).json({
                    result: 'error',
                    reason: 'user does not have permission',
                });
                return;
            }

            const movieData = req.body.movieData || null;
            let movie1;

            if (!movieData) {
                res.status(400).json({
                    result: 'error',
                    reason: 'missing movieData field',
                });
                return;
            }

            // this is necessary since we need the movie to create screenings
            // and creating them needs to wait
            let screeningStr = movieData.screenings;
            let screenings = [];
            movieData.screenings = [];

            movie1 = new Movie(movieData);

            for (let screen of screeningStr) {
                let scrn = new Screening({
                    datetime: screen,
                    movie: movie1._id,
                });
                screenings.push(scrn);
                movie1.screenings.push(scrn);

                console.log(scrn);
            }

            try {
                await movie1.save();
                for (let screen of screenings) {
                    await screen.save();
                }
            } catch (e) {
                logger.info(e);
                res.status(400).json({
                    result: 'error',
                    reason: 'invalid movie',
                });
                return;
            }

            res.status(200).json({
                result: movie1._id,
            });
        }
    );

    app.put(
        '/api/v1/movie/:id',
        passport.authenticate('jwt', { session: false }),
        async (req, res) => {
            //needs to be auth'd
            if (!req.isAuthenticated()) {
                res.status(401).json({
                    result: 'error',
                    reason: 'could not verify auth token',
                });
                return;
            }

            //needs to be a staff member
            if (!(req.user instanceof Staff)) {
                res.status(401).json({
                    result: 'error',
                    reason: 'user does not have permission',
                });
                return;
            }

            //needs to be manager
            if (req.user.type != 0) {
                res.status(401).json({
                    result: 'error',
                    reason: 'user does not have permission',
                });
                return;
            }

            const movieData = req.body.movieData || null;
            const movieId = req.params.id || null;

            if (!movieId || !movieData) {
                res.status(400).json({
                    result: 'error',
                    reason: 'missing_fields',
                });
                return;
            }

            var objectMovieId = mongoose.Types.ObjectId(movieId);
            let movie;

            //get the current movie
            try {
                movie = await Movie.findById(objectMovieId);
            } catch (e) {
                logger.info(e);
                res.status(403).json({
                    result: 'error',
                    reason: 'db error while trying to find movie',
                });
                return;
            }

            if (movie == null) {
                //movie not found
                res.status(404).json({
                    result: 'error',
                    reason: 'movie not found',
                });
                return;
            }

            //delete all the screenings for this movie (in the screening db)
            await Screening.deleteMany({ movie: objectMovieId });

            //create Screening objects from datetime's
            //turn movieData.screenings array from datetime's to complete Screening objects
            let screeningStr = movieData.screenings;
            let screenings = [];
            movieData.screenings = [];

            for (let screen of screeningStr) {
                let scrn = new Screening({
                    datetime: screen,
                    movie: movieId,
                });
                screenings.push(scrn);
                movieData.screenings.push(scrn);
            }

            try {
                //updating the movie with all the new movieData, including correct screenings
                await Movie.updateOne({ _id: objectMovieId }, movieData);

                //saving new Screening objects
                for (let screen of screenings) {
                    await screen.save();
                }
            } catch (e) {
                logger.info(e);
                res.status(403).json({
                    result: 'error',
                    reason:
                        'error when trying to save screening to db or when updating movie in db',
                });
                return;
            }

            res.status(200).json({
                result: 'ok',
            });
            return;
        }
    );

    app.delete(
        '/api/v1/movie/:id',
        passport.authenticate('jwt', { session: false }),
        async (req, res) => {
            //needs to be auth'd
            if (!req.isAuthenticated()) {
                res.status(401).json({
                    result: 'error',
                    reason: 'could not verify auth token',
                });
                return;
            }

            //needs to be a staff member
            if (!(req.user instanceof Staff)) {
                res.status(401).json({
                    result: 'error',
                    reason: 'user does not have permission',
                });
                return;
            }

            //needs to be manager
            if (req.user.type != 0) {
                res.status(401).json({
                    result: 'error',
                    reason: 'user does not have permission',
                });
                return;
            }

            const movieId = req.params.id || null;
            if (!movieId) {
                res.status(400).json({
                    result: 'error',
                    reason: 'missing_fields',
                });
                return;
            }

            var objectMovieId = mongoose.Types.ObjectId(movieId);

            try {
                //deleting the movie
                await Movie.deleteOne({ _id: objectMovieId });

                let screenings = await Screening.find({movie: objectMovieId});
                
                //delete tickets associated with each screening for this movie
                for (let screen of screenings) {

                    await Ticket.deleteMany({ screening: screen._id });

                }

                //delete all the screenings for this movie (in the screening db)
                await Screening.deleteMany({movie: objectMovieId});
                
            } catch (e) {
                logger.info(e);
                res.status(403).json({
                    result: 'error',
                    reason: 'db error',
                });
                return;
            }

            res.status(200).json({
                result: 'ok',
            });
            return;
        }
    );
};
