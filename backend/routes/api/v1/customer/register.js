const mongoose = require('mongoose');
const Customer = mongoose.model('Customer');

module.exports = function ({ app, transporter }) {
    app.post('/api/v1/customer/register', async function (req, res) {
        if (
            !('name' in req.body) ||
            !('email' in req.body) ||
            !('password' in req.body) ||
            !('dob' in req.body)
        ) {
            return res.status(400).json({
                result: 'error',
                reason: 'missing_fields',
            });
        }

        // create model
        let newCustomer;
        try {
            // create customer
            newCustomer = new Customer({
                name: req.body.name,
                email: req.body.email.toLowerCase(),
                password: req.body.password,
                dob: new Date(req.body.dob),
            });

            newCustomer = await newCustomer.save();
        } catch (e) {
            return res.status(400).json({
                result: 'error',
                reason: e.errors,
            });
        }

        // Send email
        // TODO: use better formatting
        const link = `${process.env.BASE_URL_APP}/auth/verify/${newCustomer.id}/${newCustomer.verificationToken}`;
        if (transporter) {
            await transporter.sendMail({
                from: 'CineStack Bot <no-reply@segfault.zone>',
                to: newCustomer.email,
                subject: 'Email Verification',
                text: `Click here to verify your account: ${link}`,
                html: `Click <a href=${link}>here</a> to verify your account.`,
            });
        }

        res.status(201).json({
            result: 'ok',
            reason: 'account_created',
        });
    });
};
