'use strict';

// Eslint globals
/* global before, describe, it, after */

let app, testManager, testEmployee, testManagerToken, testEmployeeToken;

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
    password: 'staff1_pass',
};

let testEmployeeData = {
    name: 'Staff 2',
    type: 1,
    username: 'staff_2',
    password: 'staff2_pass',
};

let testEmployeeUpdateData = {
    name: 'Staff 4',
    type: 1,
    username: 'staff_4',
};

let testEmployeeData2 = {
    name: 'Staff 3',
    type: 1,
    username: 'staff_3',
    password: 'staff3_pass',
};

/*
    Test cases
*/

describe('api/v1/staff/profile endpoint', () => {
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

        testEmployeeToken = jwt.sign(
            JSON.stringify({
                id: testEmployee.id,
                type: 'staff',
            }),
            process.env.JWT_SECRET
        );
    });

    it('should get details of a staff member if authenticated as a manager', async () => {
        let res = await chai
            .request(app)
            .get(`/api/v1/staff/profile/${testEmployee.id}`)
            .redirects(0)
            .set({ Authorization: `bearer ${testManagerToken}` });
        expect(res.status).to.equal(200);
        expect(res.body).to.include({
            result: 'ok',
        });
    });

    it('should allow employees to fetch their own profile', async () => {
        let res = await chai
            .request(app)
            .get(`/api/v1/staff/profile/${testEmployee.id}`)
            .redirects(0)
            .set({ Authorization: `bearer ${testEmployeeToken}` });
        expect(res.status).to.equal(200);
        expect(res.body).to.include({
            result: 'ok',
        });
    });

    it('should not allow employees to access other profiles', async () => {
        let res = await chai
            .request(app)
            .get(`/api/v1/staff/profile/${testManager.id}`)
            .redirects(0)
            .set({ Authorization: `bearer ${testEmployeeToken}` });
        expect(res.status).to.equal(401);
        expect(res.body).to.include({
            result: 'error',
        });
    });

    it('should create a staff member if authd as manager ', async () => {
        let res = await chai
            .request(app)
            .post(`/api/v1/staff/profile`)
            .redirects(0)
            .set({ Authorization: `bearer ${testManagerToken}` })
            .send({
                staffData: testEmployeeData2,
            });
        expect(res.status).to.equal(200);
        expect(res.body.result).to.be.a('string');
        let newEmployee = await Staff.findByIdAndDelete(
            mongoose.Types.ObjectId(res.body.result)
        );
        expect(newEmployee).to.not.be.null;
        expect(newEmployee).to.be.instanceOf(Staff);
    });

    it('should update staff member with the specified id, if authd as manager', async () => {
        let res = await chai
            .request(app)
            .put(`/api/v1/staff/profile/${testEmployee.id}`)
            .redirects(0)
            .set({ Authorization: `bearer ${testManagerToken}` })
            .send({
                staffData: testEmployeeUpdateData,
            });
        expect(res.status).to.equal(200);
        expect(res.body).to.include({
            result: 'ok',
        });

        let updatedStaff = await Staff.findById(
            mongoose.Types.ObjectId(testEmployee.id)
        );

        let comparisonData = testEmployeeUpdateData;
        delete comparisonData.password;
        expect(updatedStaff).to.include(comparisonData);
    });

    it('should delete staff with the specified id, if authd as manager', async () => {
        let res = await chai
            .request(app)
            .delete(`/api/v1/staff/profile/${testEmployee.id}`)
            .redirects(0)
            .set({ Authorization: `bearer ${testManagerToken}` });
        expect(res.status).to.equal(200);
        expect(res.body).to.include({
            result: 'ok',
        });

        let employee = await Staff.findByIdAndDelete(
            mongoose.Types.ObjectId(testEmployee.id)
        );
        expect(employee, 'Employee was still found').to.be.null;
    });

    after(async () => {
        // Empty staff data
        await Staff.deleteMany({});
    });
});
