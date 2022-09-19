const NUM_STAFF = 3;

async function seed ({ logger, mongoose }) {
    const Staff = mongoose.model('Staff');

    for (let i = 0; i < NUM_STAFF; i++) {
        const staff = new Staff({
            name: `Staff ${i}`,
            type: 1, // staff
            username: `staff_${i}`,
            password: `staffpass${i}`
        });
        try {
            await staff.save();
            logger.info(`Created test staff user with username '${staff.username}'`);
        } catch (e) {
            if (e instanceof mongoose.Error.ValidationError) {
                logger.error(`The staff user '${staff.username}' already exists. Skipping...`);
            } else {
                logger.error(e);
            }
        }
    }
};

if (require.main === module)
    require('./runner.js')(seed);

module.exports = seed;
