'use strict';

// Eslint globals
/* global before, describe, it, after */

let app;

/*
 * Test Dependencies
 */

const mongoose = require('mongoose');
let Customer;

let chai = require('chai');
let chaiHttp = require('chai-http');
const { expect } = require('chai');

chai.use(chaiHttp);

describe('/api/v1/customer/login endpoint', () => {
    before(async function () {
        // set hook timeout
        this.timeout(10000);

        // setup server
        app = await require('../../../../app');

        // setup models
        Customer = mongoose.model('Customer');

        // Empty database
        await Customer.deleteMany({});
    });

    it('should accept valid credentials for a customer', async () => {
        // Setup mock customer
        let customerTestData = {
            name: 'login.js test data',
            email: 'testdata@test.com',
            password: 'testData_pass', // Triggers the setter for the hashpass
            dob: Date.now(),
            passResetToken: '123',
            tickets: [],
        };

        let customer = new Customer(customerTestData);
        await customer.save();
        // Manually verify the account
        customer.verificationToken = '';
        await customer.save();

        let res = await chai
            .request(app)
            .post('/api/v1/customer/login')
            .redirects(0) // don't follow redirect
            .send({
                email: customerTestData.email,
                password: customerTestData.password,
            });

        expect(res).to.have.status(200);
        expect(res.body).to.include({
            result: 'ok',
        });

        await Customer.findByIdAndDelete(mongoose.Types.ObjectId(customer.id));
    });

    after(async () => {
        // Empty customer data
        await Customer.deleteMany({});
    });
});
