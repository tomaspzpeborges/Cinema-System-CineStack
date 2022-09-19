'use strict';

/*
    billing/pos.js
    Team SEGFAULT (17)
*/

/*
    Module dependencies
*/

const mongoose = require('mongoose');

// get models
const Ticket = mongoose.model('Ticket');

const passport = require('passport');

/*
    Endpoints
*/

module.exports = function ({ app }) {
    const handler = (verb, path, middleware, handler) =>
        app[verb](
            path,
            [
                passport.authenticate('jwt', { session: false }),
                (req, res, next) => {
                    if (!req.isAuthenticated()) return res.sendStatus(403);
                    next();
                },
                ...middleware,
            ],
            handler
        );

    /**
     * Billing for POS - just flips the "paid" flag for a given ticket
     * @name POST_/api/v1/billing/pos
     * @function
     * @memberof module:routes/api/v1/billing~billingRoutes
     * @inner
     */
    handler('post', '/api/v1/billing/pos', [], async (req, res) => {
        const ticket = await Ticket.findById(req.body.id.data);
        if (!ticket) res.sendStatus(400);

        ticket.paid = true;
        await ticket.save();

        return res.sendStatus(200);
    });
};
