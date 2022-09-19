'use strict';

// Eslint globals
/* global before, describe, it, after */

let app;

/*
    Test Dependencies
*/

require('dotenv').config({ path: '.env' });

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const mongoose = require('mongoose');
let Customer;
let Movie;
let Screening;
let Ticket;

let chai = require('chai');
let chaiHttp = require('chai-http');
const { expect } = require('chai');

chai.use(chaiHttp);

/*
    Test data
*/

const testCustomerData = {
    name: 'Customer 1',
    email: 'customer.1@example.com',
    password: 'testData_pass',
    dob: Date.now(),
};

let testMovieData = {
    title: 'Tenet',
    certificate: 18,
    promoMaterial: {
        landscapeBanner: 'https://i.redd.it/ttvbi0ngwa851.jpg',
        portraitBanner:
            'https://images-na.ssl-images-amazon.com/images/I/91oMmAPaaeL._AC_SL1500_.jpg',
        trailer: 'https://www.youtube.com/watch?v=L3pk_TBkihU',
    },
    blurb:
        ' Armed with only one word, Tenet, and fighting for the survival of the entire world, a Protagonist journeys through a twilight world of international espionage on a mission that will unfold in something beyond real time. ',
    director: 'Wes Anderson',
    leadActors: ['Elizabeth Debicki', 'Robert Pattinson', 'John Washington'],
    seatPricing: {
        basePrice: 8,
        vipPrice: 18,
        childDiscount: 50,
        seniorDiscount: 20,
    },
    screenings: [],
};

/*
    Tests
*/

describe('/api/v1/billing/webhook endpoint', () => {
    before(async function () {
        // set hook timeout
        this.timeout(10000);

        // setup server
        app = await require('../../../../app');

        // setup models
        Customer = mongoose.model('Customer');
        Movie = mongoose.model('Movie');
        Screening = mongoose.model('Screening');
        Ticket = mongoose.model('Ticket');

        // Empty database
        await Customer.deleteMany({});
        await Ticket.deleteMany({});
    });

    it('should accept a valid request', async function () {
        // Extend timeout for this test
        this.timeout(10000);

        // Create documents used int test
        let customer = new Customer(testCustomerData);
        await customer.save();

        let movie = new Movie(testMovieData);
        await movie.save();

        let screening = new Screening({
            movie: movie._id,
            datetime: Date.now(),
        });
        await screening.save();

        let ticket = new Ticket({
            screening: screening._id,
            seats: ['testSeat', 'testSeat2'],
            price: 1000,
        });
        await ticket.save();

        await customer.addTicket(ticket._id);

        // Create mock session
        const session = await stripe.checkout.sessions.create({
            success_url: 'https://example.com/success',
            cancel_url: 'https://example.com/failure',
            customer: customer.stripeID,
            payment_method_types: ['card'],
            payment_intent_data: { setup_future_usage: 'on_session' },
            line_items: [
                {
                    name: 'Tickets to see Screening', // TODO: Fetch screening for a given ticket
                    description: ticket.seats.toString(), // TODO: More useful description
                    amount: ticket.price,
                    currency: 'gbp',
                    quantity: 1,
                },
            ],
            metadata: {
                json: JSON.stringify({
                    ticket_ids: [ticket.id],
                }),
            },
        });

        // Generate payload
        const payload = {
            type: 'checkout.session.completed',
            data: {
                object: session,
            },
        };

        const payloadString = JSON.stringify(payload, null, 2);

        // Sign payload
        const header = stripe.webhooks.generateTestHeaderString({
            payload: payloadString,
            secret: process.env.STRIPE_WEBHOOK_SECRET,
        });

        // Construct mock event
        const event = stripe.webhooks.constructEvent(
            payloadString,
            header,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        // Send mock event to API
        let res = await chai
            .request(app)
            .post('/api/v1/billing/webhook')
            .redirects(0)
            .set({ 'stripe-signature': header })
            .set('content-type', 'application/json')
            .send(JSON.stringify(event, null, 2));

        expect(res).to.have.status(200);

        ticket = await Ticket.findOne(ticket._id);
        expect(ticket.paid).to.be.true;

        // Cleanup
        await Customer.deleteMany({});
        await Movie.deleteMany({});
        await Screening.deleteMany({});
        await Ticket.deleteMany({});
    });

    after(async () => {
        // Database cleanup
        await Customer.deleteMany({});
        await Movie.deleteMany({});
        await Screening.deleteMany({});
        await Ticket.deleteMany({});
    });
});
