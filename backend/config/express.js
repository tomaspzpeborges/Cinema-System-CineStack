'use strict';
/*
    express.js
    Team SEGFAULT (17)
*/

/*
    Module dependencies
*/

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

module.exports = function (app, passport, logger) {
    // static files'
    if (process.env.NODE_ENV != 'PRODUCTION')
        app.use(
            '/assets',
            express.static(global.appRoot + '/public', {
                etag: false, // XXX: caching disabled for now
                maxAge: '1000',
            })
        );

    app.use(
        express.json({
            verify: (req, res, buf) => {
                req.rawBody = buf;
            },
        })
    );
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // cookie-parser middlewar
    app.use(cookieParser());

    // use passport
    app.use(passport.initialize());

    // debug logging
    app.use((req, res, next) => {
        if (req.path.indexOf('/assets') == 0) return next();

        let timeTaken = 0;
        let warnTimeout = null;
        if (process.env.NODE_ENV == 'DEVELOPMENT') {
            warnTimeout = setInterval(() => {
                if (res.writableEnded) return clearInterval(warnTimeout);
                timeTaken += 3000;
                logger.warn(
                    `${req.method} ${req.path} still awaiting response: ${timeTaken} ms`
                );

                if (timeTaken >= 60000) {
                    logger.warn(
                        `${req.method} ${req.path} has taken too long! Killing...`
                    );
                    if (!res.writableEnded) res.sendStatus(500);
                    clearInterval(warnTimeout);
                }
            }, 3000);
        }
        //app.use((req, res) => {
        //    res.sendStatus(404);
        //});
        res.on('finish', () => {
            if (warnTimeout) clearInterval(warnTimeout);
            logger.debug(`${req.method} ${req.path} ${res.statusCode}
            \tRequest Body: ${JSON.stringify(req.body)}\t
            \tRequest QueryParams: ${JSON.stringify(req.query)}`);
        });
        next();
    });
};
