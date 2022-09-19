'use strict';

/*
    billing/session.js
    Team SEGFAULT (17)
*/

/*
    Module dependencies
*/

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const mongoose = require('mongoose');

// get models
const Ticket = mongoose.model('Ticket');
const Customer = mongoose.model('Customer');

const passport = require('passport');

/*
    Endpoints
*/

module.exports = function ({ app }) {
    app.post(
        '/api/v1/billing/session',
        passport.authenticate('jwt', { session: false }),
        async function (req, res) {
            // API can only be used by a customer
            let customer = req.user;
            if (!(customer instanceof Customer)) {
                res.status(401).json({
                    result: 'error',
                    reason: 'no_permission',
                });
                return;
            }

            let tickets = [];
            try {
                for (const ticket_id of req.body.ticket_ids) {
                    // Check that the customer trying to pay is
                    // the owner of the tickets as we don't want
                    // to allow other users to buy others tickets
                    if (customer.tickets.indexOf(ticket_id) == -1) {
                        throw Error('Ticket does not belong to customer');
                    }

                    let ticket = await Ticket.findById(
                        mongoose.Types.ObjectId(ticket_id)
                    );

                    // Don't allow tickets which have already
                    // been paid for to be paid for again
                    if (ticket.paid)
                        return res.status(400).json({
                            result: 'error',
                            reason: 'ticket_already_paid',
                        });

                    tickets.push(ticket);
                }
            } catch (e) {
                return res
                    .status(400)
                    .json({ result: 'error', reason: 'bad_ticket' });
            }

            // Create line items which is used in stripe checkout
            let line_items = [];
            for (const ticket of tickets) {
                line_items.push({
                    name: 'Tickets to see Screening', // TODO: Fetch screening for a given ticket
                    description: ticket.seats.toString(), // TODO: More useful description
                    amount: ticket.price * 100,
                    currency: 'gbp',
                    quantity: 1,
                });
            }

            try {
                // Create the stripe session which can be used
                // to redirect the customer to the checkout

                const session = await stripe.checkout.sessions.create({
                    success_url: `${process.env.BASE_URL_APP}/tickets/${req.body.ticket_ids[0]}`,
                    cancel_url: `${process.env.BASE_URL_APP}/booking/pay/${req.body.ticket_ids[0]}`,
                    customer: customer.stripeID,
                    payment_method_types: ['card'],
                    payment_intent_data: { setup_future_usage: 'on_session' },
                    line_items: line_items,
                    metadata: {
                        json: JSON.stringify({
                            ticket_ids: req.body.ticket_ids,
                        }),
                    },
                });

                return res.status(201).json({
                    result: 'ok',
                    reason: 'session_created',
                    session: session.id,
                });
            } catch (err) {
                return res
                    .status(500)
                    .json({ result: 'error', reason: 'internal_error' });
            }
        }
    );
};
