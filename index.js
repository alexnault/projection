'use strict';

var request = require('request'),
  cheerio = require('cheerio');

var Projection = function() {
  this.GOOGLE_ENDPOINT = "http://www.google.com/movies";
};

// Find showtimes of nearby theaters
Projection.prototype.findTheaters = function(near, callback) {
  // TODO
};

// q=movie+name
// Find a movie showtimes in nearby theaters
Projection.prototype.findMovie = function(callback) {
  // TODO
};

var p = new Projection();
p.findTheaters("Sherbrooke", function(err, theaters) {
	console.log(theaters);
});

//module.exports = Projection;