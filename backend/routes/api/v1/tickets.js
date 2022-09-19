'use strict';
/*
    tickets.js
    Team SEGFAULT (17)
*/

/*
    Module Dependencies
*/

const mongoose = require('mongoose');
const Customer = mongoose.model('Customer');
const Staff = mongoose.model('Staff');
const Ticket = mongoose.model('Ticket');
const Screening = mongoose.model('Screening');
const Movie = mongoose.model('Movie');

/*
    Utils
*/

const hoursDiff = (time1, time2) => (time1 - time2) / 3.6e6;
const extractSeatData = (seatStr) => ({
    row: seatStr[0],
    column: seatStr.substring(1, seatStr.length - 1),
    type: seatStr[seatStr.length - 1],
});

/*
    Endpoints
*/

/**
 * Express routes to mount users endpoints on.
 * @type {object}
 * @const
 * @namespace ticketRoutes
 */
module.exports = function ({ app, transporter, passport, logger }) {
    // modified handler for prelim auth checks
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
     * Gets  pdf for specified ticket on ID, will return 403 if customer is requesting ticket
     * that they don't own
     * @name GET_/api/v1/tickets/:id/pdf
     * @function
     * @memberof module:routes/api/v1/tickets~ticketRoutes
     * @inner
     */
    handler('get', '/api/v1/tickets/:id/pdf', [], async (req, res) => {
        if (
            req.user instanceof Customer &&
            !req.user.tickets.includes(req.params.id)
        )
            return res.sendStatus(403); // Prevent requests where the ticket does not belong to the owner

        // get ticket
        var objectTicketId = mongoose.Types.ObjectId(req.params.id);
        let ticket = await Ticket.findById(objectTicketId);

        //if (!ticket.paid) return res.sendStatus(402);

        try {
            let pdfBytes = await ticket.getPDF();

            res.writeHead(200, {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=ticket_${ticket._id}.pdf`,
                'Content-Length': pdfBytes.length,
            });
            var pdfBuffer = Buffer.from(pdfBytes.buffer, 'binary');
            res.end(pdfBuffer);
        } catch (e) {
            console.log(e);
            res.sendStatus(500);
        }

        return;
    });

    /**
     * Emails PDf of ticket with provided ID to provided email address
     * Will return 403 if customer is requesting ticket that they don't own
     * @name GET_/api/v1/tickets/:id/email
     * @function
     * @memberof module:routes/api/v1/tickets~ticketRoutes
     * @inner
     */
    handler('post', '/api/v1/tickets/:id/email', [], async (req, res) => {
        if (
            req.user instanceof Customer &&
            !req.user.tickets.includes(req.params.id)
        )
            return res.sendStatus(403); // Prevent requests where the ticket does not belong to the owner

        if (!req.body.email) return res.sendStatus(400);

        // get ticket
        var objectTicketId = mongoose.Types.ObjectId(req.params.id);
        let ticket = await Ticket.findById(objectTicketId);

        if (!ticket.paid) return res.sendStatus(402);

        await ticket
            .populate({
                path: 'screening',
                populate: { path: 'movie' },
            })
            .execPopulate();

        let attachments = [];
        attachments.push({
            filename: `ticket_${ticket._id}.pdf`,
            content: await ticket.getPDF(),
        });

        if (transporter) {
            try {
                await transporter.sendMail({
                    from: 'CineStack No Reply <no-reply@segfault.zone>',
                    to: req.body.email,
                    subject: `Your tickets for ${ticket.screening.movie.title}`,
                    text: `Hello Customer!\nYour order was placed successfully!\nPlease find your tickets attached.`,
                    attachments,
                });
                res.sendStatus(200);
            } catch (err) {
                logger.error(err);
                res.sendStatus(500);
            }
        } else {
            logger.error('Mail transporter unavailable');
            res.sendStatus(500);
        }

        return;
    });

    /**
     * Gets tickets, behaviour changes for staff / customer
     * For customers:
     *  - list of customer's tickets from 24 hours ago - future
     * For staff:
     *  - list of all tickets
     * @name GET_/api/v1/tickets
     * @function
     * @memberof module:routes/api/v1/tickets~ticketRoutes
     * @inner
     */
    handler('get', '/api/v1/tickets', [], async (req, res) => {
        if (req.user instanceof Customer) {
            // populate subdocuments
            await req.user
                .populate({
                    path: 'tickets',
                    populate: {
                        path: 'screening',
                        populate: { path: 'movie' },
                    },
                })
                .execPopulate();

            // check which tickets are <= 24 hours
            let tix = [];
            for (let ticket of req.user.tickets)
                if (hoursDiff(ticket.screening.datetime, new Date()) >= -24)
                    if (
                        ticket.paid ||
                        hoursDiff(new Date(), ticket.createdAt) < 1 / 6
                    )
                        // return paid tickets or unpaid tickets @ 10 mins old or less
                        tix.push(ticket);

            // send data back
            return res.json({
                data: tix,
            });
        } else if (req.user instanceof Staff) {
            // here haf it all staff user
            let tix = await Ticket.find({}).populate({
                path: 'screening',
                populate: { path: 'movie' },
            });
            return res.json({
                data: tix,
            });
        }

        res.sendStatus(500);
    });

    /**
     * Gets seats occupied for a screening as array of seats
     * @name GET_/api/v1/tickets/screening/:id
     * @function
     * @memberof module:routes/api/v1/tickets~ticketRoutes
     * @inner
     */
    app.get('/api/v1/tickets/screening/:id', async (req, res) => {
        try {
            let tix = await Ticket.find({ screening: req.params.id });
            let seats = [];
            for (let ticket of tix)
                if (
                    ticket.paid ||
                    hoursDiff(new Date(), ticket.createdAt) < 1 / 6
                )
                    for (let seat of ticket.seats)
                        seats.push(seat.substring(0, seat.length - 1)); // remove type designation
            res.json({ data: seats });
        } catch (e) {
            console.log(e);
            res.sendStatus(500);
        }
    });

    /**
     * Gets specific ticket on ID, will return 403 if customer is requesting ticket
     * that they don't own
     * @name GET_/api/v1/tickets/:id
     * @function
     * @memberof module:routes/api/v1/tickets~ticketRoutes
     * @inner
     */
    handler('get', '/api/v1/tickets/:id', [], async (req, res) => {
        if (
            req.user instanceof Customer &&
            !req.user.tickets.includes(req.params.id)
        )
            return res.sendStatus(403); // prevent sus requests

        // get ticket, return
        let ticket = await Ticket.findById(req.params.id);
        await ticket
            .populate({
                path: 'screening',
                populate: { path: 'movie' },
            })
            .execPopulate();
        res.json({ data: ticket });
    });

    /**
     * Creates a new ticket, will add to customer's owned tickets if it belongs to the customer
     * Returns id of the new ticket
     * @name POST_/api/v1/tickets
     * @function
     * @memberof module:routes/api/v1/tickets~ticketRoutes
     * @inner
     */
    handler('post', '/api/v1/tickets', [], async (req, res) => {
        // build obj
        let ticket = new Ticket({
            screening: req.body.screening,
            seats: req.body.seats,
        });

        // check we have seats
        if (!ticket.seats || ticket.seats == []) return res.sendStatus(400);

        // check valid screening
        let screening = await Screening.findById(ticket.screening);
        if (!screening) return res.sendStatus(400);

        // calculate price
        let movie = await Movie.findById(screening.movie);
        let pricing = movie.seatPricing;
        let total = 0.0;

        let seats = ticket.seats.map(extractSeatData);
        for (let seat of seats) {
            let cPrice = 0.0;
            if (seat.row >= 'A' && seat.row <= 'C') cPrice = pricing.vipPrice;
            else cPrice = pricing.basePrice;

            if (seat.type == 'C')
                cPrice = cPrice * (1 - pricing.childDiscount / 100);
            if (seat.type == 'S')
                cPrice = cPrice * (1 - pricing.seniorDiscount / 100);

            total += cPrice;
        }

        ticket.price = total;

        // save ticket
        let savedTicket = await ticket.save();

        // if customer, we attach ticket to them
        if (req.user instanceof Customer) {
            await req.user.addTicket(savedTicket.id);
        }

        return res.json({ data: savedTicket._id.toString() });
    });

    /**
     * Deletes a ticket if unpaid, manager only
     * @name DELETE_/api/v1/tickets
     * @function
     * @memberof module:routes/api/v1/tickets~ticketRoutes
     * @inner
     */
    handler('delete', '/api/v1/tickets/:id', [], async (req, res) => {
        // not staff or not manager
        if (!(req.user instanceof Staff) || req.user.type != 0)
            return res.sendStatus(403);

        let result = await Ticket.deleteOne()
            .where('_id')
            .equals(req.params.id)
            .where('paid')
            .equals(false)
            .exec();

        if (result.deletedCount == 0) return res.sendStatus(400);

        return res.sendStatus(200);
    });
};
