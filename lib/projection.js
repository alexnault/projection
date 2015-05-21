'use strict';

var request = require('request'),
  cheerio = require('cheerio'),
  qs = require('query-string'),
  _ = require('underscore');

var Projection = function() {
  this.GOOGLE_ENDPOINT = 'http://www.google.com/movies';
};

// Find showtimes of nearby theaters
Projection.prototype.findTheaters = function(near, options, callback) {
	
  var url = this.GOOGLE_ENDPOINT + toQS(options, near);
	//console.log(url)
  request(url, function (err, res, body) {
	  err = errorCheck(err, res);
	  if (err) {
	  	callback(err);
	  	return;
	  }

		var $ = cheerio.load(body);

		// List of theaters returned
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

				var infos = formatInfos(m.find('.info').text().split(' - '));
				var showtimes = formatShowtimes(m.find('.times').text().split(' '));

				var trailer = null;
				if (m.find('.info a').attr('href') && (m.find('.info a').attr('href').match(/(youtube|vimeo|daily)/))) {
					trailer = m.find('.info a').attr('href').replace('/url?q=', '').trim();
				}

				//console.log(infos);
				var movie = {
					title: m.find('.name').text(),
					duration: infos.duration,
					rating: infos.rating,
					genre: infos.genre,
					trailer: trailer,
					showtimes: showtimes
				};

				theater.movies.push(movie);
			});			

			theaters.push(theater);
		});

		callback(null, theaters);
	})

};

// Find a movie showtimes in nearby theaters
Projection.prototype.findMovie = function(near, movie, options, callback) {
  var url = this.GOOGLE_ENDPOINT + toQS(options, near, movie);
  //console.log(url);
  request(url, function (err, res, body) {
	  err = errorCheck(err, res);
	  if (err) {
	  	callback(err);
	  	return;
	  }

		var $ = cheerio.load(body);

		var m = $('.movie');

		var content = m.find('.desc .info').not('.info.links').html().split('<br>');
		
		var infos = formatInfos(content[0].split(' - '));

		var persons = $('<div>' + content[1] + '</div>');//.text();

		var director = persons.find('span[itemprop="director"]').text().trim();

		var cast = [];
		persons.find('span[itemprop="actors"]').each(function(gg, a) {
			cast.push($(a).text().trim());
		});

		var trailer = null;
		if (m.find('.info a').attr('href') && (m.find('.info a').attr('href').match(/(youtube|vimeo|daily)/))) {
			trailer = m.find('.info a').attr('href').replace('/url?q=', '').trim();
		}

		var desc = m.find('span[itemprop="description"]').text() + m.find('#SynopsisSecond0').clone().children().remove().end().text().trim();

		var movie = {
			title: m.find('.desc h2').text(),
			desc: desc,
			director: director,
			cast: cast,
			duration: infos.duration,
			rating: infos.rating,
			genre: infos.genre,
			trailer: trailer,
			theaters: []
		};

		$('.showtimes .theater').each(function(i, t) {
			t = $(t);

			var theater = {
				name: t.find('.name').text(),
				address: t.find('.address').text(),
				showtimes: formatShowtimes(t.find('.times').text().split(' '))
			};

			movie.theaters.push(theater);
		});

		callback(null, movie);
	})

};

var toQS = function(options, near, movie){
	var args = _.pick(options, 'hl', 'date');
  if (near)  args.near = near;
  if (movie) args.movie = movie;
  return '?' + qs.stringify(args);
};

var errorCheck = function(error, response){
	if (error) {
  	return error;
  }
  if (response.statusCode !== 200) {
  	return response.statusCode;
  }
	return null;
};

var formatInfos = function(infos) {
	var cursor = 0,
		duration = null,
		rating 	 = null,
		genre 	 = null;

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

	return {
		duration: duration,
		rating: rating,
		genre: genre
	};
};

var formatShowtimes = function(showtimes) {
	// TODO what to do with dubbed?
	return showtimes.map(function(s) {
		return s.trim(); // TODO new Date (w/ am/pm)
		//return new Date(s);
	});
};

var p = new Projection();
// p.findTheaters('Sherbrooke', {}, function(err, theaters) {
// 	console.log(theaters[2].movies[0]);
// });
p.findMovie('Sherbrooke', 'Mad Max', { hl:'fr'}, function(err, movie) {
	console.log(movie);
});

module.exports = Projection;