const NOW              = new Date();
const TWO_WEEKS_BEHIND = new Date(Date.now() - 12096e5);
const TWO_WEEKS_AHEAD  = new Date(Date.now() + 12096e5);

const NUM_EXPIRED_SCREENINGS  = 5;
const NUM_UPCOMING_SCREENINGS = 3;

const MINIMUM_HOUR = 9;
const MAXIMUM_HOUR = 21;

const SEPARATION_HOURS = 3;

async function seed ({ logger, mongoose }) {
    const Movie = mongoose.model('Movie');
    const Screening = mongoose.model('Screening');

    function randomInt(min, max){
        return Math.floor(Math.random()*(max-min+1)+min)
    }

    function randomDate(from, to) {
        // generate random day
        const fday = Math.floor(from.getTime() / (1000 * 60 * 60 * 24));
        const tday = Math.floor(to.getTime() / (1000 * 60 * 60 * 24));
        const rday = fday === tday ? fday : randomInt(fday + 1, tday);
        const rdate = new Date(from.getTime());
        rdate.setTime(rday * (1000 * 60 * 60 * 24));
        // generate random hour of day
        const rhour = randomInt(MINIMUM_HOUR, MAXIMUM_HOUR);
        rdate.setHours(rhour);
        rdate.setMinutes(0);
        rdate.setSeconds(0);
        return rdate;
    }

    function sparseDates(from, to, count) {
        let dates = [];
        more:
        for (let i = 0; i < count; i++) {
            generate:
            for (let n = 0; n < 100; n++) {
                const date = randomDate(from, to);
                // check that this date is at least SEPARATION_HOURS from other dates
                for (let j = 0; j < dates.length; j++) {
                    const diff = Math.abs(date.getTime() - dates[j].getTime());
                    const hours = diff / (60 * 60 * 1000);
                    if (hours < SEPARATION_HOURS) {
                        continue generate;
                    }
                }
                dates.push(date);
                continue more;
            }
            break; // failed to generate sparse enough date 100 times, give up
        }
        return dates;
    }

    async function generateScreenings(movie) {
        let dates = [];
        dates = dates.concat( sparseDates(TWO_WEEKS_BEHIND, NOW, NUM_EXPIRED_SCREENINGS) );
        dates = dates.concat( sparseDates(NOW, TWO_WEEKS_AHEAD, NUM_UPCOMING_SCREENINGS) );

        let screenings = [];
        for (let date of dates) {
            const screening = new Screening({
                movie: movie,
                datetime: date
            });
            await screening.save();
            screenings.push(screening);
        }
        return screenings;
    }

    async function createMovie(values) {
        let movie = new Movie(values);
        try {
            movie = await movie.save();
            logger.info(`Created movie with title '${movie.title}'`);
        } catch (e) {
            logger.error(e);
            return;
        }
        movie.screenings = await generateScreenings(movie);
        try {
            movie = await movie.save();
            logger.info(`Generated ${movie.screenings.length} screenings for '${movie.title}'`);
        } catch (e) {
            logger.error(e);
            return;
        }
    }

    await createMovie({
        title: 'Godzilla vs. Kong',
        blurb: 'Kong and his protectors undertake a perilous journey to find his true home. Along for the ride is Jia, an orphaned girl who has a unique and powerful bond with the mighty beast. However, they soon find themselves in the path of an enraged Godzilla as he cuts a swath of destruction across the globe. The initial confrontation between the two titans -- instigated by unseen forces -- is only the beginning of the mystery that lies deep within the core of the planet.',
        certificate: '13',
        director: 'Adam Wingard',
        leadActors: [
            'Millie Bobby Brown',
            'Alexander Skarsgård',
            'Rebecca Hall',
            'Julian Dennison'
        ],
        promoMaterial: {
            landscapeBanner: 'https://www.slashfilm.com/wp/wp-content/images/godzillavskong-kong-strangeland-poster-frontpage.jpg',
            portraitBanner: 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSNPj2bgqy8zGbvRUZPOpXvF58dwGwGk_1-GX1P_m7yHnj-8Ebd',
            trailer: 'https://www.youtube.com/watch?v=odM92ap8_c0'
        },
        seatPricing: {
            basePrice: 10,
            vipPrice: 30,
            seniorDiscount: 10,
            childDiscount: 10
        }
    });

    await createMovie({
        title: 'The Mauritanian',
        blurb: 'A defense attorney, her associate and a military prosecutor uncover a far-reaching conspiracy while investigating the case of a suspected 9/11 terrorist imprisoned at Guantanamo Bay, Cuba, for six years.',
        certificate: '15',
        director: 'Kevin Macdonald',
        leadActors: [
            'Jodie Foster',
            'Tahar Rehim',
            'Shailene Woodley',
            'Benedict Cumberbatch'
        ],
        promoMaterial: {
            landscapeBanner: 'https://otakukart.com/wp-content/uploads/2021/02/The-mauritanian-release-date.png',
            portraitBanner: 'https://m.media-amazon.com/images/M/MV5BODJlMzdlYzItMzRkNi00NTE0LTliZjQtMTllNzkxNDVhNjkxXkEyXkFqcGdeQXVyNjY1MTg4Mzc@._V1_.jpg',
            trailer: 'https://www.youtube.com/watch?v=7tmxxzZXLEM'
        },
        seatPricing: {
            basePrice: 10,
            vipPrice: 30,
            seniorDiscount: 10,
            childDiscount: 10
        }
    });

    await createMovie({
        title: 'Chaos Walking',
        blurb: 'In Prentisstown, Todd has been brought up to believe that the Spackle released a germ that killed all the women and unleashed Noise on the remaining men. After discovering a patch of silence out in the swamp, his surrogate parents immediately tell him that he has to run, leaving him with only a map of New World, a message, and many unanswered questions. He soon discovers the source of the silence: a girl, named Viola.',
        certificate: '13',
        director: 'Doug Liman',
        leadActors: [
            'Tom Holland',
            'Daisy Ridley',
            'Mads Mikkelsen',
            'Nick Jonas'
        ],
        promoMaterial: {
            landscapeBanner: 'https://www.nme.com/wp-content/uploads/2021/03/Chaos-Walking.jpg',
            portraitBanner: 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcSdqdoMwmrgWTtNO3qw-rDWudofBZbBjmRu2jgnA6YTMbf3xYvR',
            trailer: 'https://www.youtube.com/watch?v=nRf4ZgzHoVw'
        },
        seatPricing: {
            basePrice: 10,
            vipPrice: 30,
            seniorDiscount: 10,
            childDiscount: 10
        }
    });
};

if (require.main === module)
    require('./runner.js')(seed);

module.exports = seed;
