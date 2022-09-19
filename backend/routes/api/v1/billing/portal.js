'use strict';

/*
    billing/portal.js
    Team SEGFAULT (17)
*/

/*
    Module dependencies
*/

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const mongoose = require('mongoose');

// get models
const Customer = mongoose.model('Customer');

const passport = require('passport');

/*
    Endpoints
*/

module.exports = function ({ app }) {
    app.post(
        '/api/v1/billing/portal',
        passport.authenticate('jwt', { session: false }),
        async (req, res) => {
            // API can only be used by a customer
            let customer = req.user;
            if (!(customer instanceof Customer)) {
                res.status(401).json({
                    result: 'error',
                    reason: 'no_permission',
                });
                return;
            }

            try {
                // Creates a billing portal session and redirects the user to it
                const session = await stripe.billingPortal.sessions.create({
                    customer: customer.stripeID,
                    return_url: `${process.env.BASE_URL_APP}/tickets`, // TODO: Return URL
                });

                res.json({
                    url: session.url,
                });
            } catch (err) {
                console.log(err);
                res.status(500).json({
                    result: 'error',
                    reason: 'internal_error',
                });
            }
        }
    );
};
