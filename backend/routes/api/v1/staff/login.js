'use strict';
/*
    signin.js
    Team SEGFAULT (17)
*/

/*
    Module Dependencies
*/

const jwt = require('jsonwebtoken');

/*
    Endpoints
*/

/**
 * Express routes to mount users endpoints on.
 * @type {object}
 * @const
 * @namespace staffAuthRoutes
 */
module.exports = function ({ app, passport }) {
    /**
     * Route to handle login form submissions.
     * @name POST_/api/v1/staff/login
     * @function
     * @memberof module:routes/api/v1/staff~staffRoutes
     * @inner
     */
    
    app.post('/api/v1/staff/login', (req, res, next) => {
        passport.authenticate(
            'staff',
            { session: false },
            (err, staff, info) => {
                if (err || !staff) {
                    return res.status(400).json({
                        message: info,
                        user: staff,
                    });
                }

                req.login(staff, { session: false }, (err) => {
                    if (err) {
                        res.send(err);
                    }

                    if (staff.passResetToken) {
                        return res.status(401).json({
                            result: "no_pass",
                            reason: "password not set"
                        });
                    }

                    // Generate a signed Json web token with contents of user object and return it in the reponse
                    const token = jwt.sign(
                        JSON.stringify({
                            id: staff.id,
                            type: 'staff',
                        }),
                        process.env.JWT_SECRET
                    );

                    return res.json({
                        result: 'ok',
                        user: staff,
                        token,
                    });
                });
            }
        )(req, res, next);
    });
};
