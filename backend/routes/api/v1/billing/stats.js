'use strict';

/*
    billing/stats.js
    Team SEGFAULT (17)
*/

/*
    Module dependencies
*/

const mongoose = require('mongoose');

// get models
const Ticket = mongoose.model('Ticket');
const Staff = mongoose.model('Staff');

const passport = require('passport');

/*
    Endpoints
*/

module.exports = function ({ app, logger }) {
    app.get(
        '/api/v1/billing/stats',
        passport.authenticate('jwt', { session: false }),
        async function (req, res) {
            let staff = req.user;
            // must be a staff member
            if (!(staff instanceof Staff)) {
                res.status(401).json({
                    result: 'error',
                    reason: 'no_permission',
                });
                return;
            }

            // must be a manager
            if (req.user.type != 0) {
                res.status(401).json({
                    result: 'error',
                    reason: 'no_permission',
                });
                return;
            }

            // return revenue stats
            // can filter by movie & datarange
            let movieId = req.query.movie_id || null;
            let startDate = req.query.start_date || null;
            let endDate = req.query.end_date || null;

            // query tickets
            let query = Ticket.find({});

            logger.debug(JSON.stringify(req.query));

            if (startDate != null) {
                startDate = Date.parse(startDate);
                query = query.where('createdAt').gte(startDate);
            }
            if (endDate != null) {
                endDate = Date.parse(endDate);
                query = query.where('createdAt').lte(endDate);
            }

            let result = await query.exec(); // tickets array
            let grouped = {};

            for (let ticket of result) {
                await ticket.populate('screening').execPopulate();
                await ticket.screening
                    .populate({ path: 'movie', select: 'title' })
                    .execPopulate();

                if (movieId != null && movieId !== ticket.screening.movie.id)
                    // filter this ticket
                    continue;

                //to_return.push({
                //    numberTickets: ticket.seats.length,
                //    moneyPaid: ticket.price,
                //    screening: screening.datetime,
                //    movieId: movie._id,
                //    movieTitle: movie.title,
                //});

                const datestring = ticket.screening.datetime.toLocaleDateString();
                let movies;
                if (Object.keys(grouped).includes(datestring)) {
                    movies = grouped[datestring];
                } else {
                    movies = {};
                }

                let tickets;
                if (Object.keys(movies).includes(ticket.screening.movie.id)) {
                    tickets = movies[ticket.screening.movie.id];
                } else {
                    tickets = [];
                }

                tickets.push({
                    number_seats: ticket.seats.length,
                    price: ticket.price,
                    movie_title: ticket.screening.movie.title,
                    movie_id: ticket.screening.movie.id,
                });

                movies[ticket.screening.movie.id] = tickets;
                grouped[datestring] = movies;
            }

            let data = [];

            for (let datestring of Object.keys(grouped)) {
                const movies = grouped[datestring];
                for (let movie of Object.keys(movies)) {
                    const tickets = movies[movie];
                    let priceSum = 0;
                    for (let { price } of tickets) {
                        priceSum += price;
                    }
                    data.push({
                        datestring: datestring,
                        price_sum: priceSum,
                        ticket_count: movies[movie].length,
                        movie_title: movies[movie][0].movie_title,
                        movie_id: movies[movie][0].movie_id,
                    });
                }
            }

            return res.status(200).json({ result: 'ok', stats: data });
        }
    );
};
