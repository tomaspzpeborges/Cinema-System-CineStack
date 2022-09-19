'use strict';

/*
    Module Dependencies
*/

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

var PdfLib = require('pdf-lib');
var QRCode = require('qrcode');
var PDFDocument = PdfLib.PDFDocument;
const fetch = require('node-fetch');
/*
    Ticket Schema
*/

/**
 * @class TicketSchema
 * @memberof module:models
 * @param {ObjectId} screening - Screening of the ticket
 * @param {Array.<String>} seats - Seats reserved
 * @param {Number} price - Ticket price grand total
 * @param {Boolean} paid - Payment fulfilled?
 */
const TicketSchema = new Schema(
    {
        screening: {
            type: mongoose.Types.ObjectId,
            ref: 'Screening',
            required: true,
        },
        seats: { type: [String], required: true },
        price: { type: Number, required: true },
        paid: { type: Boolean, default: false },
    },
    { timestamps: true }
);

/*
    Methods
*/

/**
 * Ticket Schema getPdf method
 * @method TicketSchema#getPdf
 * @memberof module:models
 * @description Returns PDF in the form of a Uint8Array
 */
TicketSchema.methods.getPDF = async function () {
    await this.populate({
        path: 'screening',
        populate: { path: 'movie' },
    }).execPopulate();

    const pdfDoc = await PDFDocument.create();

    const page = pdfDoc.addPage();
    const { height } = page.getSize();

    let qr = await QRCode.toDataURL(`${this.screening.movie.title}`);
    const qrcImage = await pdfDoc.embedPng(qr);
    const qrcDims = qrcImage.scale(1.5);

    page.drawImage(qrcImage, {
        x: 320,
        y: 0.5 * height,
        width: qrcDims.width,
        height: qrcDims.height,
    });

    const pngUrl =
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Stack_Overflow_icon.svg/200px-Stack_Overflow_icon.svg.png';
    const pngImageBytes = await fetch(pngUrl).then((res) => res.arrayBuffer());
    const pngImage = await pdfDoc.embedPng(pngImageBytes);
    const pngDims = pngImage.scale(0.25);

    page.drawImage(pngImage, {
        x: 120,
        y: height - 0.1 * height - 10,
        width: pngDims.width,
        height: pngDims.height,
    });

    page.drawText('CINESTACK', {
        x: 20,
        y: height - 0.1 * height,
        size: 18,
    });
    page.drawText(`Ticket: ${this._id}`, {
        x: 320,
        y: height - 0.1 * height,
        size: 16,
    });

    page.drawText(`Film: ${this.screening.movie.title}`, {
        x: 20,
        y: height - 0.1 * height - 60,
        size: 16,
    });
    page.drawText(`Time: ${this.screening.datetime}`, {
        x: 20,
        y: height - 0.1 * height - 100,
        size: 16,
    });
    page.drawText(`Seats: ${this.seats}`, {
        x: 20,
        y: height - 0.1 * height - 140,
        size: 16,
    });
    page.drawText(`Price: £${this.price}`, {
        x: 20,
        y: height - 0.1 * height - 180,
        size: 16,
    });

    // Serialize the PDFDocument to bytes (a Uint8Array)
    return await pdfDoc.save();
};

mongoose.model('Ticket', TicketSchema, 'tickets');
