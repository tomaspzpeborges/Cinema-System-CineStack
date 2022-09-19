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
    Test data
*/

let testStaffData = {
    name: 'Staff 1',
    type: 0,
    username: 'staff_1',
    password: 'staff1_pass', //triggers the setter for hashpass (?)
};

/* 
    Test Cases
*/

describe('/api/v1/staff/login endpoint', () => {
    before(async function () {
        // set hook timeout
        this.timeout(10000);

        // setup server
        app = await require('../../../../app');

        // setup models
        Staff = mongoose.model('Staff');

        let testStaff = new Staff(testStaffData);
        await testStaff.save();
    });

    it('should accept valid credentials for a staff member', async () => {
        let res = await chai
            .request(app)
            .post('/api/v1/staff/login')
            .redirects(0) // don't follow redirect
            .send({
                username: testStaffData.username,
                password: testStaffData.password,
            });
        expect(res).to.have.status(200);
        expect(res.body).to.include({
            result: 'ok',
        });
    });

    after(async () => {
        // Empty staff data
        await Staff.deleteMany({});
    });
});
