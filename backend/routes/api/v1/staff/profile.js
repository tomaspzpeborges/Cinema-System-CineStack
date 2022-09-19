'use strict';

const mongoose = require('mongoose');
const Staff = mongoose.model('Staff');

const crypto = require('crypto');
const passport = require('passport');

module.exports = function ({ app, logger }) {
    //gets all staff members
    app.get('/api/v1/staff/staffs', async function (req, res) {
        Staff.find({}, { name: 1, type: 1 }, function (err, docs) {
            if (err) {
                res.status(400).json({
                    result: 'error',
                });
                return;
            } else {
                res.status(200).json({
                    result: 'ok',
                    docs,
                });
                return;
            }
        });
    });

    app.get(
        '/api/v1/staff/profile/:id',
        passport.authenticate('jwt', { session: false }),
        async (req, res) => {
            //needs to be auth'd
            if (!req.isAuthenticated()) {
                res.status(401).json({
                    result: 'error',
                    reason: 'could not verify auth token',
                });
                return;
            }

            //needs to be a staff member
            if (!(req.user instanceof Staff)) {
                res.status(401).json({
                    result: 'error',
                    reason: 'user does not have permission',
                });
                return;
            }

            const staffId = req.params.id || null;
            var objectStaffId = mongoose.Types.ObjectId(staffId);

            if (!staffId) {
                res.status(400).json({
                    result: 'error',
                    reason: 'missing_fields',
                });
                return;
            }

            //needs to be manager or just be accessing own profile
            if (req.user.type != 0 && req.user.id != objectStaffId) {
                res.status(401).json({
                    result: 'error',
                    reason: 'user does not have permission',
                });
                return;
            }

            let staff;

            //if we get to this point, we may return the profile

            //finding requested staff member
            try {
                staff = await Staff.findById(objectStaffId);
            } catch (e) {
                logger.info(e);
                res.status(403).json({
                    result: 'error',
                    reason: 'db error when trying to find staff member',
                });
                return;
            }
            if (staff == null) {
                res.status(404).json({
                    result: 'error',
                    reason: 'could not find requested staff member',
                });
                return;
            }

            res.status(200).json({
                result: 'ok',
                staff,
            });
            return;
        }
    );

    app.post(
        '/api/v1/staff/profile',
        passport.authenticate('jwt', { session: false }),
        async (req, res) => {
            //needs to be auth'd
            if (!req.isAuthenticated()) {
                res.status(401).json({
                    result: 'error',
                    reason: 'could not verify auth token',
                });
                return;
            }

            //needs to be a staff member
            if (!(req.user instanceof Staff)) {
                res.status(401).json({
                    result: 'error',
                    reason: 'user does not have permission',
                });
                return;
            }

            //needs to be manager
            if (req.user.type != 0) {
                res.status(401).json({
                    result: 'error',
                    reason: 'user does not have permission',
                });
                return;
            }

            const staffData = req.body.staffData || null;

            if (!staffData) {
                res.status(400).json({
                    result: 'error',
                    reason: 'missing_fields',
                });
                return;
            }

            const name = staffData.name || null;
            const type = staffData.type;
            const username = staffData.username || null;
            const passResetToken = crypto.randomBytes(32).toString('hex');

            if (!name || type === undefined || !username) {
                res.status(400).json({
                    result: 'error',
                    reason: 'missing_fields',
                });
                return;
            }

            // create staff member
            let staff = new Staff({
                name: name,
                type: type,
                username: username,
                password: "not_set",
                passResetToken: passResetToken
            });

            try {
                await staff.save();
            } catch (e) {
                logger.info(e);
                res.status(500).json({
                    result: 'error',
                    reason: 'db error',
                });
                return;
            }

            res.status(200).json({
                result: staff._id,
                passResetToken: passResetToken
            });
            return;
        }
    );

    app.put(
        '/api/v1/staff/profile/:id',
        passport.authenticate('jwt', { session: false }),
        async (req, res) => {
            //needs to be auth'd
            if (!req.isAuthenticated()) {
                res.status(401).json({
                    result: 'error',
                    reason: 'could not verify auth token',
                });
                return;
            }

            //needs to be a staff member
            if (!(req.user instanceof Staff)) {
                res.status(401).json({
                    result: 'error',
                    reason: 'user does not have permission',
                });
                return;
            }

            const staffData = req.body.staffData || null;
            const staffId = req.params.id || null;

            if (!staffId || !staffData) {
                res.status(400).json({
                    result: 'error',
                    reason: 'missing_fields',
                });
                return;
            }

            var objectStaffId = mongoose.Types.ObjectId(staffId);

            //needs to be manager or accessing own account
            if (req.user.type != 0 && req.user.id != objectStaffId) {
                res.status(401).json({
                    result: 'error',
                    reason: 'user does not have permission',
                });
                return;
            }

            //any staff member can only change their own password
            if (
                Object.prototype.hasOwnProperty.call(staffData, 'password') &&
                req.user.id != objectStaffId
            ) {
                res.status(401).json({
                    result: 'error',
                    reason:
                        'any staff member can only change their own password',
                });
                return;
            }

            //passResetToken cannot be changed manually
            if (
                Object.prototype.hasOwnProperty.call(
                    staffData,
                    'passResetToken'
                )
            ) {
                res.status(401).json({
                    result: 'error',
                    reason: 'now allowed to change passResetToken manually',
                });
                return;
            }

            let staff;
            //finding requested staff member
            try {
                staff = await Staff.findById(objectStaffId);
            } catch (e) {
                logger.info(e);
                res.status(403).json({
                    result: 'error',
                    reason: 'db error when trying to find staff member',
                });
                return;
            }
            if (staff == null) {
                res.status(404).json({
                    result: 'error',
                    reason: 'could not find requested staff member',
                });
                return;
            }

            //if we get to this point, we may update the requested profile
            await Staff.updateOne({ _id: objectStaffId }, staffData);

            res.status(200).json({
                result: 'ok',
            });

            return;
        }
    );

    app.delete(
        '/api/v1/staff/profile/:id',
        passport.authenticate('jwt', { session: false }),
        async (req, res) => {
            //needs to be auth'd
            if (!req.isAuthenticated()) {
                res.status(401).json({
                    result: 'error',
                    reason: 'could not verify auth token',
                });
                return;
            }

            //needs to be a staff member
            if (!(req.user instanceof Staff)) {
                res.status(401).json({
                    result: 'error',
                    reason: 'user does not have permission',
                });
                return;
            }

            //needs to be manager
            if (req.user.type != 0) {
                res.status(401).json({
                    result: 'error',
                    reason: 'user does not have permission',
                });
                return;
            }

            const staffId = req.params.id || null;

            if (!staffId) {
                res.status(400).json({
                    result: 'error',
                    reason: 'missing_fields',
                });
                return;
            }

            var objectStaffId = mongoose.Types.ObjectId(staffId);

            try {
                await Staff.deleteOne({ _id: objectStaffId });
            } catch (e) {
                logger.info(e);
                res.status(403).json({
                    result: 'error',
                    reason: 'db error when trying to delete staff member',
                });
                return;
            }

            res.status(200).json({
                result: 'ok',
            });
            return;
        }
    );
};
