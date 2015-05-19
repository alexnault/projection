'use strict';

var request = require('request'),
  cheerio = require('cheerio');

var Projection = function() {
  this.GOOGLE_ENDPOINT = "http://www.google.com/movies";
};

// Find showtimes of nearby theaters
Projection.prototype.findTheaters = function(near, callback) {
  var err,
  	result = {};

  request(this.GOOGLE_ENDPOINT, function (error, response, body) {
	  if (error) {
	  	callback(error);
	  	return;
	  }

	  if (response.statusCode !== 200) {
	  	callback(response.statusCode);
	  	return;
	  }

		var $ = cheerio.load(body);

		// div class = "theater"

		var theaters = $(".theater").text();

		//result = $(".theater").find(".desc .name").text();

		var theaters = [];

		$(".theater").each(function(i, value) {
			var theater = {
				name: $(this).find(".desc .name").text(),
				address: $(this).find(".desc .info").text().trim('-')[0],
				phone: $(this).find(".desc .info").text().trim(' - ')[1]
			};

			theaters.push(theater);
		  //theaters.push(value.text());
		});

		result = theaters;

		callback(err, result);
	})

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