'use strict';
/*
    login.js
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
 * @namespace customerAuthRoutes
 */
module.exports = function ({ app, passport }) {
    /**
     * Route to handle signin form submissions.
     * @name POST_/api/v1/customer/login
     * @function
     * @memberof module:routes/api/v1/customers~customerRoutes
     * @inner
     */
    app.post('/api/v1/customer/login', (req, res, next) => {
        passport.authenticate(
            'customer',
            { session: false },
            (err, customer, info) => {
                if (err || !customer) {
                    return res.status(400).json({
                        message: info,
                        user: customer,
                    });
                }

                req.login(customer, { session: false }, (err) => {
                    if (err) {
                        res.send(err);
                    }

                    // Generate a signed Json web token with contents of user object and return it in the reponse
                    const token = jwt.sign(
                        JSON.stringify({
                            id: customer.id,
                            type: 'customer',
                        }),
                        process.env.JWT_SECRET
                    );

                    return res.json({
                        result: 'ok',
                        user: customer,
                        token,
                    });
                });
            }
        )(req, res, next);
    });
};
