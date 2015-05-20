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

  var url = this.GOOGLE_ENDPOINT + "?near=" + near;

  request(url, function (error, response, body) {
	  if (error) {
	  	callback(error);
	  	return;
	  }

	  if (response.statusCode !== 200) {
	  	callback(response.statusCode);
	  	return;
	  }

		var $ = cheerio.load(body);

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

module.exports = Projection;