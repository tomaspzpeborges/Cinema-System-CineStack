'use strict';
/*
    models/customer.js
    Team SEGFAULT (17)
*/

/*
    Module Dependencies
*/

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Schema = mongoose.Schema;

/*
    Customer Schema
*/

/** Customer Schema
 * @class CustomerSchema
 * @memberof module:models
 * @param {String} name - Customer's name.
 * @param {String} email - Customer's email address.
 * @param {String} hashpass - Customer's hashed password.
 * @param {Date} dob - Customer's DOB
 * @param {String} passResetToken - Customer's password reset Token.
 * @param {String} verificationToken - Customer's token used to verify the account, empty if confirmed
 * @param {String} stripeID - Customer's payment methods
 * @param {Array} [tickets=[]] - Customer's tickets
 */
const CustomerSchema = new Schema({
    name: String,
    email: String,
    hashpass: String,
    dob: Date,
    passResetToken: String,
    verificationToken: String,
    stripeID: String,
    tickets: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Ticket',
        },
    ],
});

/*
    Virtuals
*/

/** Hashes passwords passed to the 'password' field. Virtual method.
 * @method CustomerSchema#password
 * @memberof module:models
 * @param {String} password - Password to hash.
 */
CustomerSchema.virtual('password')
    .set(function (password) {
        this.hashpass = bcrypt.hashSync(password, 10);
        // TODO: (should) not persisted
        // double check
        this._password = password;
    })
    .get(function () {
        return this.hashpass;
    });

/*
    Validation
*/

CustomerSchema.path('name').validate((name) => {
    return name.length;
}, 'Name cannot be empty');

CustomerSchema.path('email').validate(function (email) {
    // eslint-disable-next-line no-useless-escape
    let regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    email = email.toLowerCase();
    return regex.test(email);
}, 'Email is empty or invalid');

CustomerSchema.path('email').validate(function (email) {
    return new Promise((resolve) => {
        const Customer = mongoose.model('Customer');

        // only validate on new user
        if (!this.isNew) return resolve(true);

        // true if no error and customers list empty
        Customer.find({ email: email }).exec((err, customers) => {
            resolve(!err && !customers.length);
        });

        return;
    });
}, 'A registered account using `{VALUE}` already exists');

// eslint-disable-next-line no-unused-vars
CustomerSchema.path('hashpass').validate(function (password) {
    if (this._password && this._password.length < 6) {
        this.invalidate('password', 'Password must be at least 6 characters');
    }

    if (this.isNew && !this._password) {
        this.invalidate('password', 'Password is required');
    }
}, null); // return null to use invalidate

CustomerSchema.pre('save', async function () {
    // Customer first time setup
    if (this.isNew) {
        // Post validation generate a verification token
        this.verificationToken = crypto.randomBytes(32).toString('hex');

        if (!this.stripeID) {
            // Generate Stripe customer
            const customer = await stripe.customers.create({
                email: this.email,
                name: this.name,
            });
            this.stripeID = customer.id;
        }
    }
});

/*
    Methods
*/

/** Customer Schema authentication method
 * @method CustomerSchema#authenticate
 * @memberof module:models
 * @param {String} password - Password to check against hashed password.
 */
CustomerSchema.methods.authenticate = function (password) {
    return bcrypt.compareSync(password, this.hashpass);
};

/**
 * Customer Schema addTicket method
 * @method CustomerSchema#addTicket
 * @memberof module:models
 * @param {ObjectId} ticket_id - Ticket to add to customer
 */
CustomerSchema.methods.addTicket = async function (ticket_id) {
    this.tickets.push(ticket_id);
    await this.save();
};

const Customer = mongoose.model('Customer', CustomerSchema, 'customers');

module.exports = Customer;
