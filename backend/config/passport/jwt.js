'use strict';
/*
    passport/jwt.js
    Team SEGFAULT (17)
*/

/*
    Module Dependencies
*/

const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const mongoose = require('mongoose');
const Customer = mongoose.model('Customer');
const Staff = mongoose.model('Staff');

/*
    Strategy
*/

const jwtStrategy = new JWTStrategy(
    {
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
    },
    function (jwtPayload, cb) {
        //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
        return jwtPayload.type == 'customer'
            ? Customer.findById(jwtPayload.id)
                  .then((user) => cb(null, user))
                  .catch((err) => cb(err))
            : Staff.findById(jwtPayload.id)
                  .then((user) => cb(null, user))
                  .catch((err) => cb(err));
    }
);

module.exports = jwtStrategy;
