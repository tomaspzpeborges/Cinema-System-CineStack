async function seed({ logger, mongoose }) {
    const Movie = mongoose.model('Movie');
    const Customer = mongoose.model('Customer');
    const Ticket = mongoose.model('Ticket');

    const movies = await Movie.find({}).populate('screenings');
    const customers = await Customer.find({}).populate('tickets');

    // get occupied seats per screening
    let occupied = {};
    for (let customer of customers) {
        logger.debug('Getting occupied list for customer ' + customer.email);
        for (let ticket of customer.tickets) {
            let array;
            if (!(ticket.screening in occupied)) {
                array = [];
                occupied[ticket.screening] = array;
            } else {
                array = occupied[ticket.screening];
            }
            for (let seat of ticket.seats) {
                array.push(seat);
            }
        }
    }

    //https://stackoverflow.com/a/11935263
    function randomSubset(arr, size) {
        let shuffled = arr.slice(0),
            i = arr.length,
            temp,
            index;
        while (i--) {
            index = Math.floor((i + 1) * Math.random());
            temp = shuffled[index];
            shuffled[index] = shuffled[i];
            shuffled[i] = temp;
        }
        return shuffled.slice(0, size);
    }

    function incrementChar(str, n) {
        return String.fromCharCode(str.charCodeAt(0) + n);
    }

    for (let customer of customers) {
        // random sample of movies
        let movieCount = Math.floor(Math.random() * movies.length);
        movieCount = Math.max(movieCount, Math.ceil(movies.length / 2));
        if (movieCount == 0) continue;
        //const movieSubset = randomSubset(movies, movieCount);
        const movieSubset = movies;
        for (let movie of movieSubset) {
            // pick a screening
            const index = Math.floor(Math.random() * movie.screenings.length);
            const screening = movie.screenings[index];
            const screeningOccupied = occupied[screening.id] || [];
            // pick first available seat
            let row, col, seat;
            let found = false;
            for (row = 'A'; row != 'N'; row = incrementChar(row, 1)) {
                for (col = 1; col <= 15; col++) {
                    seat =
                        row +
                        col +
                        ['C', 'A', 'S'][Math.floor(Math.random() * 3)];
                    if (!screeningOccupied.includes(seat)) {
                        found = true;
                        break;
                    }
                }
            }
            if (!found) {
                logger.warn(
                    `Cannot find available seat for screening ${screening.id}`
                );
                continue;
            }
            const ticket = new Ticket({
                screening,
                seats: [seat],
                price: 10,
                paid: true,
            });
            await ticket.save();
            customer.tickets.push(ticket);
            const datetime = screening.datetime.toLocaleDateString();
            logger.info(
                `Created ticket @ ${seat} viewing '${movie.title}' @ ${datetime}`
            );
        }
        await customer.save();
        logger.info(`Saved on customer ${customer.email}`);
    }
}

if (require.main === module) require('./runner.js')(seed);

module.exports = seed;
