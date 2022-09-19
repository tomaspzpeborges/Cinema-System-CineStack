async function seed ({ logger, mongoose }) {
    const Customer  = mongoose.model('Customer');
    const Staff     = mongoose.model('Staff');
    const Movie     = mongoose.model('Movie');
    const Screening = mongoose.model('Screening');
    const Ticket    = mongoose.model('Ticket');

    // remove all 
    try {
        logger.info('Cleaning Customer collection...');
        await Customer.deleteMany({});
        logger.info('Cleaning Staff collection...');
        await Staff.deleteMany({});
        logger.info('Cleaning Movie collection...');
        await Movie.deleteMany({});
        logger.info('Cleaning Screening collection...');
        await Screening.deleteMany({});
        logger.info('Cleaning Ticket collection...');
        await Ticket.deleteMany({});
        logger.info('Done.');
    } catch (e) {
        logger.error(e);
    }

    process.exit();
};

if (require.main === module)
    require('./runner.js')(seed);

module.exports = seed;
