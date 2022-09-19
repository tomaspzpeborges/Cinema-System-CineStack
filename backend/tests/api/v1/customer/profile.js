'use strict';

// Eslint globals
/* global before, describe, it, after */

let app, token, testCustomer;

/*
 * Test Dependencies
 */

const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');
let Customer;

let chai = require('chai');
let chaiHttp = require('chai-http');
const { expect } = require('chai');

chai.use(chaiHttp);

/*
    Test Data
*/
let testCustomerData = {
    name: 'Customer 1',
    email: 'profile.js@test.com',
    password: 'testData_pass', // Triggers the setter for the hashpass
    dob: Date.now(),
    passResetToken: 'abcdefg',
    verificationToken: 'verify123',
    stripeID: '1234567',
    tickets: [],
};

let testCustomerDataUpdate = {
    name: 'Customer 2',
};

describe('/api/v1/customer/profile endpoint', () => {
    before(async function () {
        // set hook timeout
        this.timeout(10000);

        // setup server
        app = await require('../../../../app');

        // setup models
        Customer = mongoose.model('Customer');

        // Setup mock customer
        testCustomer = new Customer(testCustomerData);
        await testCustomer.save();

        token = jwt.sign(
            JSON.stringify({
                id: testCustomer.id,
                type: 'customer',
            }),
            process.env.JWT_SECRET
        );
    });

    it('should allow customer to get details of own profile', async () => {
        let res = await chai
            .request(app)
            .get(`/api/v1/customer/profile`)
            .redirects(0)
            .set({ Authorization: `bearer ${token}` });

        expect(res.status, 'Response status not 200').to.equal(200);
        expect(
            res.body,
            'Response body did not include "result: ok"'
        ).to.include({
            result: 'ok',
        });
    });

    it('should allow customer to update own profile', async () => {
        let res = await chai
            .request(app)
            .put(`/api/v1/customer/profile`)
            .redirects(0)
            .set({ Authorization: `bearer ${token}` })
            .send({
                customerData: testCustomerDataUpdate,
            });

        expect(res.status).to.equal(200);
        expect(res.body).to.include({
            result: 'ok',
        });

        testCustomer = await Customer.findById(
            mongoose.Types.ObjectId(testCustomer.id)
        );
        expect(testCustomer.name).to.equal(testCustomerDataUpdate.name);
    });

    it('should allow customer to delete own account', async () => {
        let res = await chai
            .request(app)
            .delete(`/api/v1/customer/profile`)
            .redirects(0)
            .set({ Authorization: `bearer ${token}` });

        expect(res.status).to.equal(200);
        expect(res.body).to.include({
            result: 'ok',
        });
        testCustomer = await Customer.findById(
            mongoose.Types.ObjectId(testCustomer.id)
        );
        expect(testCustomer).to.be.null;
    });

    after(async () => {
        // Empty customer data
        await Customer.deleteMany({});
    });
});
