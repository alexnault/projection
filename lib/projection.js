'use strict';

var _ = require('underscore'),
  request = require('request'),
  cheerio = require('cheerio'),
  qs = require('query-string'),
  iconv = require('iconv-lite'),
  charset = require('charset'),
  Cache = require('./cache');

// var Projection = function()	
function Projection() {
  this.GOOGLE_ENDPOINT = 'http://www.google.com/movies';
  this._cache = new Cache(10);
};

// Public
// Find showtimes of nearby theaters
Projection.prototype.findTheaters = function(near, options, callback) {
	var self = this;

  var url = this.GOOGLE_ENDPOINT + toQS(options, near);

  var cached = self._cache.get(url);
  if (cached) {
		callback(null, cached);
  	return;
  }

  request({uri: url, method: 'GET', encoding: null}, function (err, res, body) {
	  err = errorCheck(err, res);
	  if (err) {
	  	callback(err);
	  	return;
	  }

	  var encoding = charset(res.headers, body);
		var $ = cheerio.load(iconv.decode(new Buffer(body), encoding));

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

		self._cache.set(url, theaters);
		callback(null, theaters);
	})

};

// Public
// Find a movie showtimes in nearby theaters
Projection.prototype.findMovie = function(near, movie, options, callback) {
  var self = this;

  var url = self.GOOGLE_ENDPOINT + toQS(options, near, movie);

  var cached = self._cache.get(url);
  if (cached) {
		callback(null, cached);
  	return;
  }

  request({uri: url, method: 'GET', encoding: null}, function (err, res, body) {
	  err = errorCheck(err, res);
	  if (err) {
	  	callback(err);
	  	return;
	  }

	  var encoding = charset(res.headers, body);
		var $ = cheerio.load(iconv.decode(new Buffer(body), encoding));

		var m = $('.movie');

		var content = m.find('.desc .info').not('.info.links').html().split('<br>');
		
		var infos = formatInfos(content[0].split(' - '));

		var persons = $('<div>' + content[1] + '</div>');
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

		self._cache.set(url, movie);
		callback(null, movie);
	})

};

// Private
function toQS(options, near, movie){
	var args = _.pick(options, 'hl', 'date');
  if (near)  args.near = near;
  if (movie) args.movie = movie;
  return '?' + qs.stringify(args);
};

// Private
function errorCheck(error, response){
	if (error) {
  	return error;
  }
  if (response.statusCode !== 200) {
  	return response.statusCode;
  }
	return null;
};

// Private
function formatInfos(infos) {
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

// Private
function formatShowtimes(showtimes) {
	// TODO what to do with dubbed?
	return showtimes.map(function(s) {
		return s.trim(); // TODO new Date (w/ am/pm)
		//return new Date(s);
	});
};

// var p = new Projection();
// p.findTheaters('Sherbrooke', { hl:'ru'}, function(err, theaters) {
// 	console.log(theaters[2].movies[0]);
// });
// p.findMovie('Sherbrooke', 'Mad Max', { hl:'ru'}, function(err, movie) {
// 	console.log(movie);
// });

module.exports = Projection;