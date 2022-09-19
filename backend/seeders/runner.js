'use strict';
/*
    base.js
    Team SEGFAULT (17)

    Base seeding file
*/

const fs = require('fs');
const path = require('path');

if (require.main === module) {
    console.log('The seed runner is not intended to be executed directly.');
    process.exit();
}

const basename = path.basename(process.cwd());
if (basename === 'seeding') {
    console.log('Usage: node seeding/<script>.js (must run from root dir)');
    process.exit();
}

require('dotenv').config({ path: '.env' });

const winston = require('winston');
// create logger without file logs
const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf((info) => `[${info.level}] ${info.message}`)
    ),
    level: process.env.LOG_LEVEL || 'info',
    transports: [new winston.transports.Console({ level: 'debug' })],
});

if (
    process.env.NODE_ENV !== 'DEVELOPMENT' &&
    !process.argv.includes('--force')
) {
    logger.warn('NODE_ENV != DEVELOPMENT! Refusing to run...');
    process.exit();
}

const mongoose = require('mongoose');

const port = process.env.PORT;

global.appRoot = path.resolve(__dirname, '..');

/*
    Setup MongoDB mongoose models (require every model .js file in ./models)
*/

const modelDir = path.join(global.appRoot, 'models');
fs.readdirSync(modelDir).forEach((file) => require(path.join(modelDir, file)));
logger.debug('Successfully loaded DB models!');

module.exports = async function (seeders) {
    if (!(seeders instanceof Array)) {
        seeders = [seeders];
    }
    mongoose.connection
        .on('error', (err) => {
            logger.error(err);
            reject(err);
        })
        .once('open', async () => {
            for (let seeder of seeders) {
                await seeder({ logger, mongoose });
            }
            logger.info('Done executing seeders. Exiting...');
            process.exit();
        });
    logger.info('Establishing connection to Mongo instance...');
    mongoose.connect(process.env.DBURL, {
        keepAlive: 1,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
};
