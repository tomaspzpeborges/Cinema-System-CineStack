const scripts = [
    'admin.js',
    'staff.js',
    'customer.js',
    'movie.js',
    'ticket.js'
];

let seeders = [];
for (let script of scripts) {
    seeders.push( require(`./${script}`) );
}

require('./runner')(seeders, require.main === module);

module.exports = seeders;
