'use strict';

// Eslint globals
/* global before, describe, it, after */

let app, testManager, testEmployee, testManagerToken;

/*
 * Test Dependencies
 */

const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');
let Staff;

let chai = require('chai');
let chaiHttp = require('chai-http');
const { expect } = require('chai');

chai.use(chaiHttp);

/*
    Test Data
*/

let testManagerData = {
    name: 'Staff 1',
    type: 0,
    username: 'staff_1',
    password: 'staff1_pass', //triggers the setter for hashpass (?)
};

let testEmployeeData = {
    name: 'Staff 2',
    type: 1,
    username: 'staff_2',
    password: 'staff2_pass', //triggers the setter for hashpass (?)
};

let passResetToken = null;

/*
    Test Cases
*/

describe('api/v1/staff/passreset endpoint', () => {
    before(async function () {
        // set hook timeout
        this.timeout(10000);

        // setup server
        app = await require('../../../../app');

        // setup models
        Staff = mongoose.model('Staff');

        testManager = new Staff(testManagerData);
        await testManager.save();

        testEmployee = new Staff(testEmployeeData);
        await testEmployee.save();

        testManagerToken = jwt.sign(
            JSON.stringify({
                id: testManager.id,
                type: 'staff',
            }),
            process.env.JWT_SECRET
        );
    });

    it('should set passReset token for a given staff member if authd as manager', async () => {

        let res = await chai
            .request(app)
            .post(`/api/v1/staff/passreset/${testEmployee.id}`)
            .redirects(0)
            .set({ Authorization: `bearer ${testManagerToken}` })
            
        expect(res.status).to.equal(200);
        expect(res.body).to.include({
            result: 'ok',
        });
        passResetToken = res.body.passResetToken
         
    });

    it('should set password of staff member with the specified passResetToken set', async () => {
        let newPassword = 'passFromPassReset';

        let res = await chai
            .request(app)
            .post(`/api/v1/staff/setpass/${passResetToken}`)
            .redirects(0)
            .send({
                password: newPassword,
            });
        expect(res.status).to.equal(200);
        expect(res.body).to.include({
            result: 'ok',
        });

        testEmployee = await Staff.findById(
            mongoose.Types.ObjectId(testEmployee.id)
        );
        expect(testEmployee.authenticate(newPassword)).to.be.true;
    });


    after(async () => {
        // Empty staff data
        await Staff.deleteMany({});
    });
});
