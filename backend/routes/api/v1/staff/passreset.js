'use strict';

const mongoose = require('mongoose');
const Staff = mongoose.model('Staff');

const crypto = require('crypto');
const passport = require('passport');

module.exports = function ({ app, logger }) {

    app.post('/api/v1/staff/passreset/:id',passport.authenticate('jwt', { session: false }), async (req, res) => {
        //needs to be auth'd
        if(!req.isAuthenticated()){

            res.status(401).json({
                result: 'error',
                reason: 'could not verify auth token',
            });
            return;
        }

        //needs to be a staff member
        if( !(req.user instanceof Staff)){
            res.status(401).json({
                result: 'error',
                reason: 'user does not have permission',
            });
            return;
        }

        //needs to be manager 
        if( (req.user.type != 0) ) {

            res.status(401).json({
                result: 'error',
                reason: 'user does not have permission',
            });
            return;
        }

        const staffId = req.params.id || null;

        if ( !staffId) {
            res
                .status(400)
                .json({
                    result: 'error',
                    reason: 'missing_fields'
                });
            return;
        }
        var objectStaffId = mongoose.Types.ObjectId(staffId);

        let staff;

        try {
            staff = await Staff.findById(objectStaffId);
        
        } catch(e){
        
            logger.info(e);
            res
                .status(403)
                .json({
                    result: 'error',
                    reason: 'error when trying to find staff by id'
                });
            return;
        }
        
        if(staff == null) {
        
            res
                .status(404)
                .json({
                    result: 'error',
                    reason: 'staff member not found'
                });
            return;
        }
        
        staff.passResetToken = crypto.randomBytes(32).toString('hex');
        const link = `${process.env.BASE_URL_APP}/auth/reset/${staff.passResetToken}`;
        
        try {
            await staff.save();
        } catch (e) {
            logger.info(e);
            res
                .status(403)
                .json({
                    result: 'error',
                    reason: 'db_error when trying to save new password'
                });
            return;
        }

    
        res
        .status(200)
        .json({
            result: 'ok',
            passResetToken: staff.passResetToken,
            link: link,
        });

        return;
        
    });

    app.post('/api/v1/staff/setpass/:passResetToken', async function (req, res) {


        const passResetToken = req.params.passResetToken || null;
        const password = req.body.password || null

        if ( !passResetToken || !password) {
            res
                .status(400)
                .json({
                    result: 'error',
                    reason: 'missing_fields'
                });
            return;
        }

        let staff;

        try {
            staff = await Staff.findOne({passResetToken: passResetToken});
        
        } catch(e){
        
            logger.info(e);
            res
                .status(403)
                .json({
                    result: 'error',
                    reason: 'error when trying to find staff with given token'
                });
            return;
        }
        
        if(staff == null) {
        
            res
                .status(404)
                .json({
                    result: 'error',
                    reason: 'staff member not found'
                });
            return;
        }
        // set fields
        staff.password = password;
        staff.passResetToken = "";


        // save
        try {
            await staff.save();
        } catch (e) {
            logger.info(e);
            res.status(500).json({
                result: 'error',
                reason: 'db_error',
            });
        }

        res
        .status(200)
        .json({
            result: 'ok',
        });
        return;

    });


}