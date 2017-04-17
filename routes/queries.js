import express from 'express';
var app = express();
import Promise from 'bluebird';

var dbObj = require("../db");

let pgp = dbObj.pgp;
let db = dbObj.connection;

app.get('/mvs', function(req, res, next) {
    db.one(`SELECT array_agg(row_to_json(t)) AS rows FROM (
            SELECT * FROM minnsdu
          ) t;`)
        .then(function(data) {
            res.status(200)
                .send({
                    status: 'success',
                    data: data.rows,
                    message: 'Retrieved ALL users'
                });
        })
        .catch(function(err) {
            console.log(err);
            return next(err);
        });
});

app.delete('/mvs/:id', function(req, res, next) {
    let id = req.params.id;
    console.log("deleteing", id);
    // db.one(`SELECT array_agg(row_to_json(t)) AS rows FROM (
    //         SELECT * FROM minnsdu
    //       ) t;`)
    //     .then(function(data) {
    //         res.status(200)
    //             .send({
    //                 status: 'success',
    //                 data: data.rows,
    //                 message: 'Retrieved ALL users'
    //             });
    //     })
    //     .catch(function(err) {
    //         console.log(err);
    //         return next(err);
    //     });
});

module.exports = app;