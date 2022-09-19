'use strict';
/*
    verify.js
    Team SEGFAULT (17)
*/

/*
    Module Dependencies
*/

const mongoose = require('mongoose');
const Customer = mongoose.model('Customer');

/*
    Endpoints
*/

module.exports = function ({ app }) {
    app.get('/api/v1/customer/verify/:id/:token', async function (req, res) {
        const { id, token } = req.params;

        let customer;
        try {
            customer = await Customer.findById(mongoose.Types.ObjectId(id));
        } catch (err) {
            res.sendStatus(400);
        }

        if (!customer) return res.sendStatus(400);
        if (customer.verificationToken !== token) return res.sendStatus(400);

        customer.verificationToken = '';
        await customer.save();
        res.sendStatus(200);
    });
};
