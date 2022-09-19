'use strict';

// Eslint globals
/* global before, describe, it, after */

let app;

/*
 * Test Dependencies
 */

const crypto = require('crypto');

const mongoose = require('mongoose');
let Customer;

let chai = require('chai');
let chaiHttp = require('chai-http');
const { expect } = require('chai');

chai.use(chaiHttp);

/*
    Test Cases
*/

describe('/api/v1/customer/passreset endpoint', () => {
    before(async function () {
        // set hook timeout
        this.timeout(10000);

        // setup server
        app = await require('../../../../app');

        // setup models
        Customer = mongoose.model('Customer');
    });

    it('should create a passResetToken for a given customer', async function () {
        // Increase test timeout
        this.timeout(10000);

        // Setup mock customer
        let customerTestData = {
            name: 'Customer 1',
            email: 'testdata@test.com',
            password: 'testData_pass', // Triggers the setter for the hashpass
            dob: Date.now(),
            passResetToken: null,
            verificationToken: 'verify123',
            stripeID: '1234567',
            tickets: [],
        };

        let testCustomer = new Customer(customerTestData);
        await testCustomer.save();

        let res = await chai
            .request(app)
            .post('/api/v1/customer/passreset')
            .redirects(0) // don't follow redirect
            .send({ email: customerTestData.email });

        expect(res, 'Response status was not 200').to.have.status(200);
        expect(res.body, 'Response body did not include "ok"').to.include({
            result: 'ok',
        });

        testCustomer = await Customer.findOneAndDelete({
            _id: testCustomer._id,
        });
        expect(testCustomer, "Customer wasn't found").to.be.instanceOf(
            Customer
        );
        expect(testCustomer.passResetToken, 'passResetToken was null').not.to.be
            .null;
    });

    it('should allow a customer to reset their password given a correct reset token', async () => {
        // Setup mock customer
        let testCustomerData = {
            name: 'Customer 1',
            email: 'testdata@test.com',
            password: 'testData_pass', // Triggers the setter for the hashpass
            dob: Date.now(),
            passResetToken: crypto.randomBytes(32).toString('hex'),
            verificationToken: 'verify123',
            stripeID: '1234567',
            tickets: [],
        };

        let newPassword = 'new_pass';

        let testCustomer = new Customer(testCustomerData);
        await testCustomer.save();

        // post the password reset with the token from the prev test
        let res = await chai
            .request(app)
            .post(
                `/api/v1/customer/passreset/${testCustomerData.passResetToken}`
            )
            .send({ password: newPassword });

        expect(res).to.have.status(200);
        expect(res.body).to.include({
            result: 'ok',
        });

        let updatedTestCustomer = await Customer.findByIdAndDelete(
            mongoose.Types.ObjectId(testCustomer.id)
        );

        expect(updatedTestCustomer, 'Customer not found').to.be.instanceOf(
            Customer
        );
        expect(
            updatedTestCustomer.authenticate(newPassword),
            'Password was incorrect'
        ).to.be.true;
    });

    after(async () => {
        // Empty customer data
        await Customer.deleteMany({});
    });
});
