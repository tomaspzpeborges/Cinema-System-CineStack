async function seed ({ logger, mongoose }) {
    const Staff = mongoose.model('Staff');

    const admin = new Staff({
        name: 'Admin',
        type: 0, // manager
        username: 'admin',
        password: 'adminpass'
    });
    try {
        await admin.save();
        logger.info('Created test staff user with username \'admin\'');
    } catch (e) {
        if (e instanceof mongoose.Error.ValidationError) {
            logger.error('The admin user already exists. Exiting...');
        } else {
            logger.error(e);
        }
    }
}

if (require.main === module)
    require('./runner.js')(seed);

module.exports = seed;
