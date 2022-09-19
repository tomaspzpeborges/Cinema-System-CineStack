'use strict';
/*
    app.js
    Team SEGFAULT (17)

    Server backend entry point
*/

/*
    Module dependencies
*/

require('./config/env');

const logger = require('./config/winston');
logger.info('Server is starting...');

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const passport = require('passport');
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const port = process.env.PORT;
const app = express();
app.use(cors());

/*
    Setup global approot
*/

global.appRoot = path.resolve(__dirname);

/*
    Setup MongoDB mongoose models (require every model .js file in ./models)
*/

const modelDir = path.join(global.appRoot, 'models');
fs.readdirSync(modelDir).forEach((file) => require(path.join(modelDir, file)));
logger.debug('Successfully loaded DB models!');

/*
    Setup passport.js configurations
*/

require('./config/passport')(passport);
logger.info('Successfully setup authentication flows!');

/*
    Setup express and import routes
*/

/*
    Initialize nodemailer
 */
let transporter;
if (process.env.NODEMAILER_ENABLED === 'true') {
    transporter = nodemailer.createTransport({
        host: process.env.NODEMAILER_HOST,
        port: process.env.NODEMAILER_PORT,
        secure: process.env.NODEMAILER_SECURE === 'true' ? true : false,
        auth: {
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASS,
        },
    });
} else {
    transporter = null;
}

require('./config/express')(app, passport, logger);
require('./routes')({ app, passport, transporter, logger });
logger.info('Successfully loaded app + routes!');

/*
    Start server
*/

app.locals.basedir = path.join(__dirname, 'views');

module.exports = new Promise((resolve, reject) => {
    mongoose.connection
        .on('error', (err) => {
            logger.error(err);
            reject(err);
        }) // log error
        .once('open', () => {
            // start server on dbconn open
            app.listen(port);
            logger.info(`Server started on port: ${port}`);
            resolve(app);
        });
    mongoose.connect(process.env.DBURL, {
        keepAlive: 1,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});
