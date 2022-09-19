'use strict';

const mongoose = require('mongoose');
const Customer = mongoose.model('Customer');
const crypto = require('crypto');

module.exports = function ({ app, transporter, logger }) {
    app.post('/api/v1/customer/passreset', async function (req, res) {
        // validate email (ensure exists)
        const email = req.body.email;
        if (!email)
            return res.status(400).json({
                result: 'error',
                reason: 'missing_fields',
            });

        // fetch customer document
        let customer = await Customer.findOne({ email: email });
        if (!customer)
            // avoid user enumeration, just send 200
            return res.status(200).json({ result: 'ok' });

        // create reset token
        customer.passResetToken = crypto.randomBytes(32).toString('hex');

        try {
            await customer.save();
        } catch (e) {
            logger.warn(e);
            res.status(500).json({
                result: 'error',
                reason: 'db_error',
            });
            return;
        }

        // Send email
        const link = `${process.env.BASE_URL_APP}/auth/reset/${customer.passResetToken}`;
        if (transporter) {
            await transporter.sendMail({
                from: 'CineStack No Reply <no-reply@segfault.zone>',
                to: email,
                subject: 'Password Reset',
                text: `Click here to reset your password: ${link}`,
                html: `Click <a href=${link}>here</a> to reset your password.`,
            });
        }

        res.status(200).json({
            result: 'ok',
        });
    });

    app.post('/api/v1/customer/passreset/:id', async function (req, res) {
        // validate fields
        const newPassword = req.body.password;
        const passResetToken = req.params.id;
        if (!newPassword)
            return res.status(400).json({
                result: 'error',
                reason: 'missing_fields',
            });

        // fetch customer
        let customer = await Customer.findOne({
            passResetToken: passResetToken,
        });
        if (!customer)
            return res.status(404).json({
                result: 'error',
                reason: 'token_invalid',
            });

        // set fields
        customer.password = newPassword;
        customer.passResetToken = '';

        // save
        try {
            await customer.save();
        } catch (e) {
            logger.info(e);
            res.status(500).json({
                result: 'error',
                reason: 'db_error',
            });
        }

        res.status(200).json({
            result: 'ok',
        });
    });
};
