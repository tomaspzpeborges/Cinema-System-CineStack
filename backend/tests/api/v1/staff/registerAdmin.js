'use strict';

// Eslint globals
/* global before, describe, it, after */

let app;

/*
 * Test Dependencies
 */

const mongoose = require('mongoose');
let Staff;

let chai = require('chai');
let chaiHttp = require('chai-http');
const { expect } = require('chai');

chai.use(chaiHttp);

/*
    Test Cases
*/

describe('/api/v1/staff/registerAdmin endpoint', () => {
    before(async function () {
        // set hook timeout
        this.timeout(10000);

        // setup server
        app = await require('../../../../app');

        // setup models
        Staff = mongoose.model('Staff');
    });

    it('should create admin staff account', async () => {
        let res = await chai
            .request(app)
            .post('/api/v1/staff/registerAdmin')
            .redirects(0);

        expect(res.body).to.include({
            result: 'ok',
            reason: 'admin_created',
        });
        expect(res).to.have.status(201);

        let adminAccount = await Staff.findOne({ username: 'staff_0' });
        expect(adminAccount).to.not.be.null;
    });

    after(async () => {
        // Empty staff data
        await Staff.deleteMany({});
    });
});
