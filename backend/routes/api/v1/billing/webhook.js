'use strict';

/*
    billing/webhook.js
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

/*
    Endpoints
*/

module.exports = function ({ app, transporter, logger }) {
    // Stripe webhook, not intended for direct usage
    app.post('/api/v1/billing/webhook', async function (req, res) {
        const payload = req.rawBody;
        const sig = req.headers['stripe-signature'];

        let event;

        try {
            event = stripe.webhooks.constructEvent(
                payload,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.log(err);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;

                let attachments = [];

                if (!session.metadata.json) return res.sendStatus(200);
                let metadata = JSON.parse(session.metadata.json);

                // Iterate tickets and mark as paid
                for (const ticket_id of metadata.ticket_ids) {
                    let ticket = await Ticket.findById(
                        mongoose.Types.ObjectId(ticket_id)
                    );

                    if (!ticket) continue;

                    ticket.paid = true;
                    await ticket.save();

                    attachments.push({
                        filename: `ticket_${ticket._id}.pdf`,
                        content: await ticket.getPDF(),
                    });
                }

                const customer = await Customer.findOne({
                    tickets: mongoose.Types.ObjectId(metadata.ticket_ids[0]),
                });

                if (transporter) {
                    try {
                        await transporter.sendMail({
                            from: 'CineStack No Reply <no-reply@segfault.zone>',
                            to: customer.email,
                            subject: 'Order Confirmation',
                            text: `Hello ${customer.name}\nYour order was placed successfully!\nPlease find your tickets attached.`,
                            attachments,
                        });
                    } catch (err) {
                        logger.error(err);
                    }
                }

                logger.info(
                    `Payment fulfilled for ${
                        metadata.ticket_ids.length
                    } ticket${
                        metadata.ticket_ids.length > 1 ? 's' : ''
                    } with checkout session '${session.id}'`
                );
                break;
            }
            default:
                logger.debug(`Unhandled webhook event: '${event.type}'`);
                break;
        }

        return res.sendStatus(200);
    });
};
