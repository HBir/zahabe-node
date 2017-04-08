let db = {};

console.log("hehehey");
let promise = require('bluebird');
let connectionString = process.env.DB_DATABASE_URL ||
    'postgres://jyvvhsducxvnjv:31632077757e9989f04b8a5fcfec53e63a20e8958f93bd5c2bac2dd6ca9b749b@ec2-54-217-222-254.eu-west-1.compute.amazonaws.com:5432/d63as1gbbvhhmt';
let options = {
    // Initialization Options
    promiseLib: promise,
    capSQL: true
};

db.pgp = require('pg-promise')(options);


//let connectionString = 'postgres://postgres:postgres@localhost:5432/Anima';
db.connection = db.pgp(connectionString);

module.exports = db;