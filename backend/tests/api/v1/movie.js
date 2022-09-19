'use strict';

// Eslint globals
/* global before, describe, it, after */

let app, testStaffToken, testCustomerToken;

/*
 * Test Dependencies
 */

const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');
let Customer;
let Staff;
let Movie;

let chai = require('chai');
let chaiHttp = require('chai-http');
const { expect } = require('chai');

chai.use(chaiHttp);

/*
    Test data
*/

let testStaffData = {
    name: 'Staff 1',
    type: 0,
    username: 'staff_1',
    password: 'staff1_pass', //triggers the setter for hashpass (?)
};

let testCustomerData = {
    name: 'Customer 1',
    email: 'testdata@test.com',
    password: 'testData_pass', // Triggers the setter for the hashpass
    dob: Date.now(),
    passResetToken: '123',
    verificationToken: 'verify123',
    stripeID: '1234567',
    tickets: [],
};

let testMovieData = {
    title: 'Tenet',
    certificate: '18',
    promoMaterial: {
        landscapeBanner: 'https://i.redd.it/ttvbi0ngwa851.jpg',
        portraitBanner:
            'https://images-na.ssl-images-amazon.com/images/I/91oMmAPaaeL._AC_SL1500_.jpg',
        trailer: 'https://www.youtube.com/watch?v=L3pk_TBkihU',
    },
    blurb:
        ' Armed with only one word, Tenet, and fighting for the survival of the entire world, a Protagonist journeys through a twilight world of international espionage on a mission that will unfold in something beyond real time. ',
    director: 'Wes Anderson',
    leadActors: ['Elizabeth Debicki', 'Robert Pattinson', 'John Washington'],
    seatPricing: {
        basePrice: 8,
        vipPrice: 18,
        childDiscount: 50,
        seniorDiscount: 20,
    },
    screenings: [],
};

let testMovieUpdateData = {
    title: 'The Dark Knight',
    blurb: "it's awesome",
    certificate: 'ZZZ',
    director: 'Cristopher Nolan',
    leadActors: ['Christian Bale', 'Heath Ledger'],
    screenings: [],
    promoMaterial: {
        landscapeBanner: 'landscapeBanner2',
        portraitBanner: 'portraitBanner2',
        trailer: 'trailer2',
    },
    seatPricing: {
        basePrice: 4,
        vipPrice: 5,
        childDiscount: 50,
        seniorDiscount: 20,
    },
};

describe('api/v1/movie endpoint', () => {
    before(async function () {
        // Set hook timeout
        this.timeout(10000);

        // Setup server
        app = await require('../../../app');

        // Setup models
        Customer = mongoose.model('Customer');
        Staff = mongoose.model('Staff');
        Movie = mongoose.model('Movie');

        // Clean database
        await Customer.deleteMany({});
        await Staff.deleteMany({});
        await Movie.deleteMany({});

        let testStaff = new Staff(testStaffData);
        await testStaff.save();

        testStaffToken = jwt.sign(
            JSON.stringify({
                id: testStaff.id,
                type: 'staff',
            }),
            process.env.JWT_SECRET
        );

        let testCustomer = new Customer(testCustomerData);
        await testCustomer.save();

        testCustomerToken = jwt.sign(
            JSON.stringify({
                id: testCustomer.id,
                type: 'customer',
            }),
            process.env.JWT_SECRET
        );
    });

    it('should create a movie if authenticated as an employee', async () => {
        let res = await chai
            .request(app)
            .post(`/api/v1/movie`)
            .redirects(0)
            .set({ Authorization: `bearer ${testStaffToken}` })
            .send({
                movieData: testMovieData,
            });

        expect(res.status).to.equal(200);
        expect(res.body.result).to.be.a('string');

        let movie = await Movie.findByIdAndDelete(
            mongoose.Types.ObjectId(res.body.result)
        );

        expect(movie).to.not.be.null;
        expect(movie).to.be.instanceOf(Movie);
    });

    it('should not create a movie if the user is not authorised', async () => {
        let res = await chai
            .request(app)
            .post(`/api/v1/movie`)
            .redirects(0)
            .set({ Authorization: `bearer ${testCustomerToken}` })
            .send({
                movieData: testMovieData,
            });

        expect(res.status).to.equal(401);
    });

    it('should update movie with the specified id', async () => {
        let testMovie = new Movie(testMovieData);
        await testMovie.save();

        let res = await chai
            .request(app)
            .put(`/api/v1/movie/${testMovie.id}`)
            .redirects(0)
            .set({ Authorization: `bearer ${testStaffToken}` })
            .send({
                movieData: testMovieUpdateData,
            });

        expect(res.status).to.equal(200);
        expect(res.body).to.include({
            result: 'ok',
        });

        let testMovieUpdated = Movie.findByIdAndDelete(
            mongoose.Types.ObjectId(testMovie.id)
        );

        expect(testMovieUpdated).to.not.be.null;
    });

    it('should return the correct movie based on id', async () => {
        let testMovie = new Movie(testMovieData);
        await testMovie.save();

        let res = await chai
            .request(app)
            .get(`/api/v1/movie/${testMovie.id}`)
            .redirects(0);

        expect(res.status).to.equal(200);
        expect(res.body).to.include({
            result: 'ok',
        });

        expect(res.body.movie.title).to.equal(testMovieData.title);

        // Cleanup
        await Movie.findByIdAndDelete(mongoose.Types.ObjectId(testMovie.id));
    });

    it('should delete movie with the specified id', async () => {
        let testMovie = new Movie(testMovieData);
        await testMovie.save();

        let res = await chai
            .request(app)
            .delete(`/api/v1/movie/${testMovie.id}`)
            .redirects(0)
            .set({ Authorization: `bearer ${testStaffToken}` });

        expect(res.status).to.equal(200);
        expect(res.body).to.include({
            result: 'ok',
        });

        testMovie = await Movie.findById(mongoose.Types.ObjectId(testMovie.id));

        expect(testMovie).to.be.null;
    });

    after(async () => {
        // Empty data
        await Customer.deleteMany({});
        await Staff.deleteMany({});
        await Movie.deleteMany({});
    });
});
