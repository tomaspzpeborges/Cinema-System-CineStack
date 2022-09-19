'use strict';
/*
    models/movie.js
    Team SEGFAULT (17)
*/

/*
    Module Dependencies
*/

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/*
    Movie Schema
*/

/**
 * @typedef {Object} PromotionalMaterial
 * @property {String} landscapeBanner - Promotional material's landscape banner
 * @property {String} portraitBanner - Promotional material's portrait banner
 * @property {String} trailer - Promotional material's trailer
 */

/**
 * @typedef {Object} SeatPricing
 * @property {Number} basePrice - Base price of a seat
 * @property {Number} vipPrice - Price of a VIP seat
 * @property {Number} [childDiscout] - Children's discount
 * @property {Number} seniorDiscount - Senior's discount
 */

/** Movie Schema
 * @class MovieSchema
 * @memberof module:models
 * @param {String} title - Movie's title
 * @param {String} blurb - Movie's blurb
 * @param {String} certificate - Movie's certificate
 * @param {String} director - Movie's director
 * @param {Array.<String>} leadActors - Movie's lead actors
 * @param {Array.<ObjectId>} screenings - Movie's screenings#
 * @param {PromotionalMaterial} promoMaterial - Movie's promotional material
 * @param {SeatPricing} seatPricing - Movie's seat pricing
 */
const MovieSchema = new Schema({
    title: String,
    blurb: String,
    certificate: String,
    director: String,
    leadActors: Array,
    screenings: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Screening',
        },
    ],
    promoMaterial: Object,
    seatPricing: Object,
});

/*
    Validation
*/

MovieSchema.path('title').validate((title) => {
    return title.length;
}, 'Title cannot be empty');

MovieSchema.path('title').validate(async (title) => {
    const Movie = mongoose.model('Movie');

    const results = await Movie.find({ title });

    return results.length == 0;
}, 'Title must be unique');

MovieSchema.path('blurb').validate((name) => {
    return name.length;
}, 'Blurb cannot be empty');

MovieSchema.path('certificate').validate((certificate) => {
    return certificate.length;
}, 'Certificate cannot be empty');

MovieSchema.path('director').validate((director) => {
    return director.length;
}, 'Director cannot be empty');

MovieSchema.path('leadActors').validate((leadActors) => {
    return leadActors.length;
}, 'Movie must have at least one actor');

MovieSchema.path('promoMaterial').validate((promoMaterial) => {
    return promoMaterial;
}, 'Promotional material cannot be empty');

MovieSchema.path('promoMaterial').validate((promoMaterial) => {
    return promoMaterial.landscapeBanner?.length;
}, 'Promotional material must contain a landscape banner');

MovieSchema.path('promoMaterial').validate((promoMaterial) => {
    return promoMaterial.portraitBanner?.length;
}, 'Promotional material must contain a portrait banner');

MovieSchema.path('promoMaterial').validate((promoMaterial) => {
    return promoMaterial.trailer?.length;
}, 'Promotional material must contain a trailer');

MovieSchema.path('seatPricing').validate((seatPricing) => {
    return seatPricing;
}, 'Seat pricing cannot be empty');

MovieSchema.path('seatPricing').validate((seatPricing) => {
    return typeof seatPricing.basePrice === 'number';
}, 'Seat pricing must include a base price');

MovieSchema.path('seatPricing').validate((seatPricing) => {
    return typeof seatPricing.vipPrice === 'number';
}, 'Seat Pricing must include a VIP price');

MovieSchema.path('seatPricing').validate((seatPricing) => {
    return typeof seatPricing.seniorDiscount === 'number';
}, 'Seat Pricing must include a senior discount');

MovieSchema.path('seatPricing').validate((seatPricing) => {
    return typeof seatPricing.childDiscount === 'number';
}, 'Seat Pricing must include a child discount');

mongoose.model('Movie', MovieSchema, 'movies');
