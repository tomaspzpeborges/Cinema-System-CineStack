'use strict';
/*
    passport/index.js
    Team SEGFAULT (17)
*/

/*
    Module Dependencies
*/

const mongoose = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;
const jwtStrategy = require('./jwt');
const Customer = mongoose.model('Customer');
const Staff = mongoose.model('Staff');

/*
    Strategy
*/

const customerLoginStrategy = new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password',
    },
    function (email, password, done) {
        // Attempt to find a customer with specified email
        Customer.findOne(
            { email: email.toLowerCase() },
            function (err, customer) {
                if (err) return done(err);

                if (!customer) return done(null, false, 'Invalid Credentials');
                if (customer.verificationToken)
                    return done(null, false, 'Account Pending Verification');
                if (!customer.authenticate(password))
                    return done(null, false, 'Invalid Credentials');

                return done(null, customer);
            }
        );
    }
);

const staffLoginStrategy = new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password',
    },
    function (username, password, done) {
        // attempt to find staff with specified username
        Staff.findOne({ username: username }, function (err, staff) {
            if (err) return done(err);

            if (!staff) return done(null, false, 'Invalid Credentials');
            if (!staff.authenticate(password))
                return done(null, false, 'Invalid Credentials');

            return done(null, staff);
        });
    }
);

module.exports = function (passport) {
    passport.use('customer', customerLoginStrategy);
    passport.use('staff', staffLoginStrategy);
    passport.use('jwt', jwtStrategy);
};
