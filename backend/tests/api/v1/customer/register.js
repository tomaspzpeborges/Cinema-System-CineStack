'use strict';

// Eslint globals
/* global before, describe, it, after */

let app;

/*
 * Test Dependencies
 */

require('dotenv').config({ path: '.env' });

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const mongoose = require('mongoose');
let Customer;

let chai = require('chai');
let chaiHttp = require('chai-http');
const { expect } = require('chai');

chai.use(chaiHttp);

/*
    Test cases
*/

describe('/api/v1/customer/register endpoint', () => {
    before(async function () {
        // set hook timeout
        this.timeout(10000);

        // setup server
        app = await require('../../../../app');

        // setup models
        Customer = mongoose.model('Customer');
    });

    it('should reject empty email', async () => {
        let res = await chai
            .request(app)
            .post('/api/v1/customer/register')
            .redirects(0)
            .send({ password: 'Dkdfje£3f@' });

        expect(res.body).to.include({
            result: 'error',
            reason: 'missing_fields',
        });
        expect(res).to.have.status(400);
    });

    it('should reject empty password', async () => {
        let res = await chai
            .request(app)
            .post('/api/v1/customer/register')
            .redirects(0)
            .send({ email: 'some.unused.email@gmail.com' });

        expect(res.body).to.include({
            result: 'error',
            reason: 'missing_fields',
        });
        expect(res).to.have.status(400);
    });

    it('should reject bad password', async () => {
        let res = await chai
            .request(app)
            .post('/api/v1/customer/register')
            .redirects(0)
            .send({
                email: 'some.other.unused.email@gmail.com',
                password: 'aaa',
            });

        expect(res.body).to.include({
            result: 'error',
        });
        expect(res).to.have.status(400);
    });

    it('should accept valid data', async function () {
        // Extend timeout for test
        this.timeout(10000);

        let testData = {
            name: 'Unused 1',
            email: 'another.unused.email@gmail.com',
            password: 'Dkdfje£3f@',
            dob: '2002-03-25',
        };

        let res = await chai
            .request(app)
            .post('/api/v1/customer/register')
            .redirects(0)
            .send(testData);

        expect(res.body, 'Incorrect body received').to.include({
            result: 'ok',
            reason: 'account_created',
        });
        expect(res, 'Non 201 status').to.have.status(201);
        let customer = await Customer.findOneAndDelete({
            email: testData.email,
        });
        expect(customer, 'Customer not found in database').to.be.instanceOf(
            Customer
        );
        expect(
            customer.authenticate(testData.password),
            'Passwords did not match'
        ).to.be.true;
        const stripeCustomer = await stripe.customers.retrieve(
            customer.stripeID
        );
        expect(stripeCustomer.email).to.equal(customer.email);
    });

    after(async () => {
        // Empty customer data
        await Customer.deleteMany({});
    });
});
