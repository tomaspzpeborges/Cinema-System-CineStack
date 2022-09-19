'use strict';

const mongoose = require('mongoose');
const Customer = mongoose.model('Customer');
const Ticket = mongoose.model('Ticket');

const jwt = require('jsonwebtoken');
const passport = require('passport');

module.exports = function ({ app, transporter, logger }) {
    app.get(
        '/api/v1/customer/profile',
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

            //needs to be a customer
            if (!(req.user instanceof Customer)) {
                res.status(401).json({
                    result: 'error',
                    reason: 'user does not have permission',
                });
                return;
            }

            let customer;

            //if we get to this point, we may return the profile

            //finding customer
            try {
                customer = await Customer.findById(req.user._id);
            } catch (e) {
                logger.info(e);
                res.status(403).json({
                    result: 'error',
                    reason: 'db error when trying to find customer',
                });
                return;
            }
            if (customer == null) {
                res.status(404).json({
                    result: 'error',
                    reason: 'could not find customer',
                });
                return;
            }

            res.status(200).json({
                result: 'ok',
                customer: {
                    // filter what is returned
                    name: customer.name,
                    dob: customer.dob,
                    email: customer.email,
                },
            });
            return;
        }
    );

    app.put(
        '/api/v1/customer/profile',
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

            //needs to be a customer
            if (!(req.user instanceof Customer)) {
                res.status(401).json({
                    result: 'error',
                    reason: 'user does not have permission',
                });
                return;
            }

            const customerData = req.body.customerData || null;

            if (!customerData) {
                res.status(400).json({
                    result: 'error',
                    reason: 'missing_fields',
                });
                return;
            }
            if (
                customerData.hasOwnProperty('passResetToken') ||
                customerData.hasOwnProperty('verificationToken') ||
                customerData.hasOwnProperty('paymentMethods') ||
                customerData.hasOwnProperty('tickets')
            ) {
                res.status(401).json({
                    result: 'error',
                    reason:
                        'user does not have permission to change some fields',
                });
                return;
            }

            // >>> assuming that tickets are already crreated beforehand and that we only need to store id's here

            //if we get to this point, we may update the requested profile
            await Customer.updateOne({ _id: req.user._id }, customerData);

            res.status(200).json({
                result: 'ok',
            });
            return;
        }
    );

    app.delete(
        '/api/v1/customer/profile',
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

            //needs to be a customer
            if (!(req.user instanceof Customer)) {
                res.status(401).json({
                    result: 'error',
                    reason: 'user does not have permission',
                });
                return;
            }

            try {
                let customer = await Customer.findById(req.user._id);

                //deleting all tickets associated with this customer
                await Ticket.deleteMany({ _id: { $in: customer.tickets } });

                await Customer.deleteOne({ _id: req.user._id });
            } catch (e) {
                logger.info(e);
                res.status(403).json({
                    result: 'error',
                    reason: 'db error when deleting',
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
