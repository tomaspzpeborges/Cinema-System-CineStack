'use strict';

/*
    Module Dependencies
*/

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/*
    Screening Schema
*/

/**
 * @class ScreeningSchema
 * @memberof module:models
 * @param {ObjectID} movie - Movie of the screening
 * @param {Date} datetime - Date of the screening
 */
const ScreeningSchema = new Schema({
    movie: { type: mongoose.Types.ObjectId, ref: 'Movie', required: true },
    datetime: { type: Date, required: true },
});

mongoose.model('Screening', ScreeningSchema, 'screenings');
