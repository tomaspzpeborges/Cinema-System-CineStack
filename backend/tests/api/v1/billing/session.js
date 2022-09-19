'use strict';

// Eslint globals
/* global before, describe, it, afterEach */

let app;

/*
    Test Dependencies
*/

require('dotenv').config({ path: '.env' });

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');
let Customer;
let Ticket;

let chai = require('chai');
let chaiHttp = require('chai-http');
const { expect } = require('chai');

chai.use(chaiHttp);

/*
    Test Data
*/

const testCustomerData = {
    name: 'Customer 1',
    email: 'profile.js@test.com',
    password: 'testData_pass',
    dob: Date.now(),
    passResetToken: 'abcdefg',
    tickets: [],
};

const testTicketData = {
    screening: mongoose.Types.ObjectId(),
    seats: ['1', '2'],
    price: 1000,
    paid: false,
};

/*
    Tests
*/

describe('/api/v1/billing/session endpoint', () => {
    before(async function () {
        // set hook timeout
        this.timeout(10000);

        // setup server
        app = await require('../../../../app');

        // setup models
        Customer = mongoose.model('Customer');
        Ticket = mongoose.model('Ticket');

        // Empty database
        await Customer.deleteMany({});
        await Ticket.deleteMany({});
    });

    it('should not allow non authenticated requests', async () => {
        let res = await chai
            .request(app)
            .post(`/api/v1/billing/session`)
            .redirects(0)
            .send({ ticket_ids: [] });

        expect(res).to.have.status(401);
    });

    it('should accept a valid request', async function () {
        // Increase test length as stripe can be slow
        this.timeout(5000);

        // Setup mock customer
        let testCustomer = new Customer(testCustomerData);
        await testCustomer.save();

        // Create JWT Token to authenticate with endpoint
        let token = jwt.sign(
            JSON.stringify({
                id: testCustomer.id,
                type: 'customer',
            }),
            process.env.JWT_SECRET
        );

        let testTicket = new Ticket(testTicketData);
        await testTicket.save();

        await testCustomer.addTicket(testTicket.id);

        let res = await chai
            .request(app)
            .post('/api/v1/billing/session')
            .redirects(0)
            .set({ Authorization: `bearer ${token}` })
            .send({ ticket_ids: [testTicket.id] });

        expect(res).to.have.status(201);
        expect(res.body.reason).to.equal('session_created');

        const session = await stripe.checkout.sessions.retrieve(
            res.body.session
        );

        expect(session.amount_total).to.equal(100000);

        expect(session.customer).to.equal(testCustomer.stripeID);
    });

    afterEach(async () => {
        // Database cleanup
        await Customer.deleteMany({});
        await Ticket.deleteMany({});
    });
});
