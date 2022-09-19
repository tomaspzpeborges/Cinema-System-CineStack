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

/*
    Test Data
*/

let testCustomerData = {
    name: 'Customer 1',
    email: 'testdata@test.com',
    password: 'testData_pass', // Triggers the setter for hashpass
    dob: Date.now(),
    passResetToken: '123',
    verificationToken: 'verify123',
    stripeID: '1234567',
    tickets: [],
};

/*
    Test cases
*/

describe('/api/v1/customer/verify Endpoint', () => {
    before(async function () {
        // Set hook timeout
        this.timeout(10000);

        // Setup server
        app = await require('../../../../app');

        // Setup models
        Customer = mongoose.model('Customer');

        // Clean database
        await Customer.deleteMany({});
    });

    it('should reject for bad customer', async () => {
        let res = await chai
            .request(app)
            .get('/api/v1/customer/verify/000000/token')
            .redirects(0);

        expect(res.status).to.equal(400);
    });

    it('should reject bad token for customer', async () => {
        let testCustomer = new Customer(testCustomerData);
        await testCustomer.save();

        let res = await chai
            .request(app)
            .get(`/api/v1/customer/verify/${testCustomer.id}/bad_token`)
            .redirects(0);

        expect(res.status).to.equal(400);

        await Customer.findByIdAndDelete(
            mongoose.Types.ObjectId(testCustomer.id)
        );
    });

    it('should accept correct token for customer', async () => {
        let testCustomer = new Customer(testCustomerData);
        await testCustomer.save();

        let res = await chai
            .request(app)
            .get(
                `/api/v1/customer/verify/${testCustomer.id}/${testCustomer.verificationToken}`
            )
            .redirects(0);
        expect(res.status).to.equal(200);

        // Cleanup
        Customer.findByIdAndDelete(mongoose.Types.ObjectId(testCustomer.id));
    });

    after(async () => {
        // Remove all
        await Customer.deleteMany({});
    });
});
