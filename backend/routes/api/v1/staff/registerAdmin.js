const mongoose = require('mongoose');
const Staff = mongoose.model('Staff');


module.exports = function ({ app, transporter, logger }) {

    app.post('/api/v1/staff/registerAdmin', async function (req, res) {

        let staff0;
        let staffData = {
            name: "Staff 0",
            type: 0,
            username: 'staff_0',
            password: 'staff0_pass', //triggers the setter for hashpass (?)
        };

        staff0 = new Staff(staffData);

        try {
            await staff0.save();
    
        } catch (e) {

            logger.info(e);
            res
                .status(500)
                .json({
                    result: 'error',
                    reason: 'db_error; account may be already created'
                });
            return;
        }

        res
            .status(201)
            .json({
                result: 'ok',
                reason: 'admin_created'
            });
    });
    
};
