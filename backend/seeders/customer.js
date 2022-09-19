const NUM_CUSTOMERS = 3;

async function seed({ logger, mongoose }) {
    const Customer = mongoose.model('Customer');

    const forenames = [
        'Elroy',
        'Ozhan',
        'Tanner',
        'Burak',
        'Chung',
        'Flint',
        'Jojo',
        'Caralee',
        'Elize',
        'Nandhana',
        'Rudy',
        'Vicky',
    ];
    const surnames = [
        'Baker',
        'Watson',
        'Young',
        'Black',
        'Grant',
        'Bell',
        'Simpson',
        'Wood',
    ];

    function randomChoice(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    for (let i = 0; i < NUM_CUSTOMERS; i++) {
        const forename = randomChoice(forenames);
        const surname = randomChoice(surnames);
        const suffix = Math.floor(Math.random() * 999);
        const email = `${forename.toLowerCase()}.${surname.toLowerCase()}.fake-email${suffix}@gmail.com`;
        const customer = new Customer({
            name: `${forename} ${suffix}`,
            email: email,
            password: `pass123`,
        });
        try {
            await customer.save();
            customer.verificationToken = '';
            await customer.save();
            logger.info(`Created test customer user with email '${email}'`);
        } catch (e) {
            if (e instanceof mongoose.Error.ValidationError) {
                logger.error(
                    `The customer user '${email}' already exists. Skipping...`
                );
            } else {
                logger.error(e);
            }
        }
    }
}

if (require.main === module) require('./runner.js')(seed);

module.exports = seed;
