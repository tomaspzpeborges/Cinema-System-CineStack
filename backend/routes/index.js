'use strict';
/*
    routes/index.js
    Team SEGFAULT (17)
*/

/*
    Module Dependencies
*/

const fs = require('fs');
const path = require('path');

/*
    Import all routes for express app
*/

function bootstrapRoutes(dir, params) {
    let files = fs.readdirSync(dir);
    files.forEach((file) => {
        let curURI = path.join(dir, file);
        if (fs.statSync(curURI).isDirectory()) {
            bootstrapRoutes(curURI, params); // scan subdirectory
        } else {
            // do not rerun current file
            if (curURI.includes('index.js')) return;

            // do not include disabled files
            if (curURI.includes('js.disabled')) return;

            // try importing the route, otherwise log the error
            try {
                require(curURI)(params);
            } catch (e) {
                params.logger.warn(
                    `Error importing route ${curURI}!\nError: ${e}`
                );
            }
        }
    });
}

module.exports = function (params) {
    bootstrapRoutes(path.join(global.appRoot, 'routes'), params);
};
