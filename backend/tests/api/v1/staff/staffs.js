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

let testStaffData2 = {
    name: 'Staff 2',
    type: 1,
    username: 'staff_2',
    password: 'staff2_pass', //triggers the setter for hashpass (?)
};

/*
    Test Cases
*/

describe('/api/v1/staff/staffs endpoint', () => {
    before(async function () {
        // set hook timeout
        this.timeout(10000);

        // setup server
        app = await require('../../../../app');

        // setup models
        Staff = mongoose.model('Staff');

        let testStaff = new Staff(testStaffData);
        await testStaff.save();

        let testStaff2 = new Staff(testStaffData2);
        await testStaff2.save();
    });

    it('should return all staff members in the DB', async () => {
        let res = await chai
            .request(app)
            .get('/api/v1/staff/staffs')
            .redirects(0);

        expect(res.status).to.equal(200);
        expect(res.body).to.include({
            result: 'ok',
        });
        expect(res.body.docs).not.to.be.null;
        expect(res.body.docs.length).to.equal(2);
    });

    after(async () => {
        // Empty staff data
        await Staff.deleteMany({});
    });
});
