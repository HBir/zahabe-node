import express from 'express';
var app = express();
import Promise from 'bluebird';
// var sqlite3  = require("sqlite3");
import db from 'sqlite';

var dbObj = require("../db");



/* GET home page. */
app.get('/', function(req, res, next) {

    getAllMVs(function(mvs) {
        var rng = new RNG(getDate());
        let daily = rng.nextRange(1, mvs.length)
        console.log(mvs[daily])
        res.render('index', {
            title: 'Minns vi den gången Zahabe',
            MVs: mvs,
            daily: mvs[daily]
        });
    });

});

app.get('/api/mvs', function(req, res, next) {
    getAllMVs(function(mvs) {
        res.send(mvs);
    })
});

app.post('/api/mvs', function(req, res, next) {
    console.log(req.body.mv);
    console.log(req.connection.remoteAddres);
    console.log(req.ip);
    try {
        Promise.all([
            db.run(`INSERT INTO MinnsDu (Text, SkrivenAv)
                    VALUES ($mv, $ip)`, { $mv: req.body.mv, $ip: req.ip }),
            db.run(`UPDATE MinnsDu
                    SET MVOrder = last_insert_rowid()
                    WHERE ID = last_insert_rowid()`),

        ]).then(function(result) {
            res.send({ status: "success" });
        });
    } catch (err) {
        res.send({ status: "error" })
    }
});

module.exports = app;

Promise.resolve()
    .then(() => db.open('./db/zahabe.sqlite', { Promise }))
    .catch(err => console.error(err.stack));
// .finally(() => app.listen(port));

function getAllMVs(callback) {
    Promise.all([
        db.all(`SELECT Text, ID, Story, (select count(*) from MinnsDu b  where a.id >= b.id) as cnt
            FROM MinnsDu a LEFT JOIN Stories ON a.ID = Stories.MVID ORDER BY MVOrder desc`)
    ]).then(function([mvs]) {
        callback(mvs);
    });
}

function getDate() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + month + day;
}

function RNG(seed) {
    // LCG using GCC's constants
    this.m = 0x80000000; // 2**31;
    this.a = 1103515245;
    this.c = 12345;

    this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));
}
RNG.prototype.nextInt = function() {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state;
}
RNG.prototype.nextFloat = function() {
    // returns in range [0,1]
    return this.nextInt() / (this.m - 1);
}
RNG.prototype.nextRange = function(start, end) {
    // returns in range [start, end): including start, excluding end
    // can't modulu nextInt because of weak randomness in lower bits
    var rangeSize = end - start;
    var randomUnder1 = this.nextInt() / this.m;
    return start + Math.floor(randomUnder1 * rangeSize);
}
RNG.prototype.choice = function(array) {
    return array[this.nextRange(0, array.length)];
}