'use strict';
/*
    env/index.js
    Team SEGFAULT (17)

    Configures environment variables
*/

const envFiles = {
    development: './.env',
    testing: './.env.test',
};

require('dotenv').config({ path: envFiles[process.env.NODE_ENV] });
