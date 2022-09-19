The seeder scripts are here to add some initial data to the database to make
testing easier.

All seeder scripts should be executed from the project root directory, like:

```
node seeders/<script>.js
```

This is to give it easy access to the same `.env` file used to run the backend.
Note that these scripts will not run unless `NODE_ENV` is set to `DEVELOPMENT`.

```
-------------------------------------------------------------------------------
| **Script**  | **Description**                                               |
-------------------------------------------------------------------------------
| seed.js     | Execute all seeder scripts (despite clean)                    |
------------------------------------------------------------------------------
| admin.js    | Create an admin staff user (management)                       |
-------------------------------------------------------------------------------
| staff.js    | Create some staff users (pos)                                 |
-------------------------------------------------------------------------------
| customer.js | Create some customers (app)                                   |
-------------------------------------------------------------------------------
| movies.js   | Create some sample movies and random screenings               |
-------------------------------------------------------------------------------
| clean.js    | Clean database (delete everything)                            |
-------------------------------------------------------------------------------
```
