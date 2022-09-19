'use strict';

// Eslint globals
/* global before, describe, it, after */

let app;

/*
 * Test Dependencies
 */

const mongoose = require('mongoose');
let Movie;

let chai = require('chai');
let chaiHttp = require('chai-http');
const { expect } = require('chai');

chai.use(chaiHttp);

/*
    Test data
*/

let testMovieData = {
    title: 'Tenet',
    certificate: 18,
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

let testMovieData2 = {
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

/*
    Test Cases
*/

describe('api/v1/movie/movies endpoint', () => {
    before(async function () {
        // Set hook timeout
        this.timeout(10000);

        // Setup server
        app = await require('../../../../app');

        // Setup models
        Movie = mongoose.model('Movie');
    });

    it('should return all the movies in the Movie DB', async () => {
        let testMovie = new Movie(testMovieData);
        await testMovie.save();

        let testMovie2 = new Movie(testMovieData2);
        await testMovie2.save();

        let res = await chai
            .request(app)
            .get('/api/v1/movie/movies')
            .redirects(0);

        expect(res.status).to.equal(200);
        expect(res.body).to.include({
            result: 'ok',
        });

        expect(res.body.docs).to.not.be.null;
        expect(res.body.docs.length).to.equal(2);

        // Cleanup
        await Movie.findByIdAndDelete(mongoose.Types.ObjectId(testMovie.id));
        await Movie.findByIdAndDelete(mongoose.Types.ObjectId(testMovie2.id));
    });

    after(async () => {
        // Empty data
        await Movie.deleteMany({});
    });
});
