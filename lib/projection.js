'use strict';

var request = require('request'),
  cheerio = require('cheerio');

var Projection = function() {
  this.GOOGLE_ENDPOINT = 'http://www.google.com/movies';
};

// Find showtimes of nearby theaters
Projection.prototype.findTheaters = function(near, callback) {
  var err,
  	result = {};

  var url = this.GOOGLE_ENDPOINT + '?near=' + near;

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
		var theaters = [];

		$('.theater').each(function(i, t) {
			t = $(t);

			var theater = {
				name: t.find('.desc .name').text(),
				address: t.find('.desc .info').text().split(' - ')[0].trim(),
				phone: t.find('.desc .info').text().split(' - ')[1].trim(),
				note: t.find('.desc .closure').text(), //status
				movies: []
			};

			// Google movie info format : Duration - Rating - Genre - Trailer - IMDB
			t.find('.showtimes .movie').each(function(j, m) {
				m = $(m);
				var infos = m.find('.info').text().split(' - ');
				
				var cursor = 0,
					duration = null,
					rating 	 = null,
					genre 	 = null,
					trailer  = null;

				if (infos[cursor].match(/(1|2|hr|min)/)){
					duration = infos[cursor].trim();
					cursor++;
				}

				if (infos[cursor].match(/(G|\+|13|16|18)/)){
					rating = infos[cursor].trim();
					cursor++;
				}

				if (infos[cursor].match(/(^\D*$)/)){
					genre = infos[cursor].trim();
					cursor++;
				}

				if (m.find('.info a').attr('href') && (m.find('.info a').attr('href').match(/(youtube|vimeo|daily)/))) {
					trailer = m.find('.info a').attr('href').replace('/url?q=', '').trim();
				}


				var showtimes = m.find('.times').text().split(' ');
				showtimes = showtimes.map(function(s) {
					return s.trim(); // TODO new Date (w/ am/pm)
					//return new Date(s);
				});

				//console.log(infos);
				var movie = {
					title: m.find('.name').text(),
					duration: duration,
					rating: rating,
					genre: genre,
					trailer: trailer,
					showtimes: showtimes
				};

				theater.movies.push(movie);
			});			

			theaters.push(theater);
		});

		callback(err, theaters);
	})

};

// q=movie+name
// Find a movie showtimes in nearby theaters
Projection.prototype.findMovie = function(callback) {
  // TODO
};

// var p = new Projection();
// p.findTheaters('Montreal', function(err, theaters) {
// 	console.log(theaters[2].movies[0	]);
// });

module.exports = Projection;