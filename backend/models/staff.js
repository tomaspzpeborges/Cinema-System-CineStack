'use strict';
/*
    Module Dependencies
*/

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const Schema = mongoose.Schema;

/*
    Staff Schema
*/

/**
 * @typedef {Number} StaffType
 */

/**
 * Enum for staff types
 * @readonly
 * @enum {StaffType}
 */

// eslint-disable-next-line no-unused-vars
const StaffTypes = {
    manager: 0,
    employee: 1,
};

/** Staff Schema
 * @class StaffSchema
 * @memberof module:models
 * @param {String} name - Staff Member's name.
 * @param {StaffType} type - Staff Member's type
 * @param {String} username - Staff Member's username
 * @param {String} hashpass - Staff Member's hashed password.
 * @param {String} passResetToken - Customer's password reset Token.
 */
const StaffSchema = new Schema({
    name: String,
    type: Number,
    username: String,
    hashpass: String,
    passResetToken: String,
});

/*
    Virtuals
*/

/** Hashes passwords passed to the 'password' field. Virtual method.
 * @method StaffSchema#password
 * @memberof module:models
 * @param {String} password - Password to hash.
 */
StaffSchema.virtual('password')
    .set(function (password) {
        this.hashpass = bcrypt.hashSync(password, 10);
    })
    .get(function () {
        return this.hashpass;
    });

/*
    Validation
*/

StaffSchema.path('name').validate((name) => {
    return name.length;
}, 'Name cannot be empty');

StaffSchema.path('username').validate(function (username) {
    return new Promise((resolve) => {
        const Staff = mongoose.model('Staff');

        // only validate on new user
        if (!this.isNew) return resolve(true);

        // true if no error and staff list empty
        Staff.find({ username: username }).exec((err, staff) =>
            resolve(!err && !staff.length)
        );
        return;
    });
}, 'A registered account using the username `{VALUE}` already exists');

StaffSchema.path('username').validate((username) => {
    return username.length;
}, 'Username cannot be empty');

StaffSchema.path('hashpass').validate((hashpass) => {
    return hashpass.length;
}, 'Password cannot be empty');


/*
    Methods
*/

/** Staff Schema authentication method
 * @method StaffSchema#authenticate
 * @memberof module:models
 * @param {String} password - Password to check against hashed password.
 */
StaffSchema.methods.authenticate = function (password) {
    return bcrypt.compareSync(password, this.hashpass);
};

mongoose.model('Staff', StaffSchema, 'staff');
