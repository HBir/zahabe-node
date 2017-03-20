var express = require('express');
var app = express();
var Promise = require("bluebird");
var sqlite3  = require("sqlite3");


/* GET home page. */
app.get('/', function(req, res, next) {
	
	getAllMVs(function(mvs) {
		console.log(mvs)
		res.render('index', { 
			title: 'Minns vi den gången Zahabe', 
			MVs: mvs
		});
	});

  
  
});

module.exports = app;


function getAllMVs(callback) {
	let db = new sqlite3.Database("zahabe.sqlite");
	let mvs;
	db.serialize(() => {
	    db.all("SELECT * FROM MinnsDu ORDER BY MVOrder desc", function(err, rows) {
	        mvs = rows;
	        callback(mvs);
	    });
	});

	db.close();
	
}