import express from 'express';
var app = express();
import Promise from 'bluebird';
let exec = require('child_process').exec;

var dbObj = require("../db");

let pgp = dbObj.pgp;
let db = dbObj.connection;



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

function getAllMVs(callback) {
    db.any(`
            SELECT Text, ID, Story, (select count(*) from MinnsDu b  where a.id >= b.id) as cnt
            FROM MinnsDu a LEFT JOIN Stories ON a.ID = Stories.MVID 
            ORDER BY MVOrder desc`)
        .then(function(data) {
            callback(data)
        })
        .catch(function(err) {
            console.log(err);
            return next(err);
        });
}

app.get('/api/mvs', function(req, res, next) {
    getAllMVs(function(mvs) {
        res.send(mvs);
    })
});


app.get('/api/my-mvs', function(req, res, next) {
    db.any(`
            SELECT Text, ID, Story, skrivenAv, (select count(*) from MinnsDu b  where a.id >= b.id) as cnt
            FROM MinnsDu a LEFT JOIN Stories ON a.ID = Stories.MVID
			WHERE skrivenav = $1
            ORDER BY MVOrder desc
            `, [req.connection.remoteAddres || req.ip])
        .then(function(data) {
            res.send(data);
        })
        .catch(function(err) {
            console.log(err);
            return next(err);
        });
});

app.get('/api/search', function(req, res, next) {
    console.log(req.query);
    db.any(`
            SELECT Text, ID, Story, skrivenAv, (select count(*) from MinnsDu b  where a.id >= b.id) as cnt
            FROM MinnsDu a LEFT JOIN Stories ON a.ID = Stories.MVID
			WHERE text LIKE $1
            ORDER BY MVOrder desc

            `, ["%" + req.query.input + "%"])
        .then(function(data) {
            res.send(data);
        })
        .catch(function(err) {
            console.log(err);
            return next(err);
        });
});

app.delete('/api/mvs', function(req, res, next) {
    let findId = new RegExp("delete+\\s([0-9]*)", 'i');
    let idMatch = findId.exec(req.body.input);
    let id;
    console.log(req.body.input);
    console.log(idMatch);
    if (idMatch) {
        console.log(idMatch);
        id = idMatch[1];
    }
    console.log(id);
    res.send(id);
});

app.post('/api/mvs', function(req, res, next) {
    console.log(req.body.mv);
    console.log(req.connection.remoteAddres);
    console.log(req.ip);

    db.one(`INSERT INTO MinnsDu (Text, SkrivenAv)
                VALUES ($1, $2)
                RETURNING id`, [req.body.mv, req.connection.remoteAddres || req.ip])
        .then(function(data) {
            console.log(data.id);
            db.none(`UPDATE MinnsDu
                       SET MVOrder = $1
                       WHERE ID = $1`, [data.id])
                .then(function(data) {
                    res.send({ status: "success" });
                })
                .catch(function(err) {
                    console.log(err);
                    return next(err);
                });
        })
        .catch(function(err) {
            console.log(err);
            return next(err);
        });
});

app.delete('/api/mvs/:id', function(req, res, next) {
    let id = req.params.id;
    console.log("deleteing", id);
    db.none(`delete from MinnsDu 
            where id = (
                select id from 
                (select id from MinnsDu order by MVOrder limit 1 OFFSET  $1) as t
            )`, [id-1])
        .then(function(data) {
            res.status(200)
                .send({
                    status: 'success',
                    message: 'Deleted '+id
                });
        })
        .catch(function(err) {
            console.log(err);
            return next(err);
        });
});

module.exports = app;




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