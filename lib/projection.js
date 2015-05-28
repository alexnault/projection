'use strict';

var _ = require('underscore'),
  request = require('request'),
  cheerio = require('cheerio'),
  qs = require('querystring'),
  iconv = require('iconv-lite'),
  charset = require('charset'),
  Cache = require('./cache');

function Projection() {
    if (!(this instanceof Projection))
        return new Projection()

    this.GOOGLE_ENDPOINT = 'http://www.google.com/movies';
    this._cache = new Cache(); // TODO problem with timeouts not dying at end of program
}

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

  requestGET(url, function(err, $) {
    if (err) {
      callback(err);
      return;
    }

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
        var showtimes = [];
        m.find('.times > span').each(function() {
          showtimes.push($(this).text().trim());
        });
        showtimes = formatShowtimes(showtimes);

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
  });

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

  requestGET(url, function(err, $) {
    if (err) {
      callback(err);
      return;
    }

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

    var showtimes = [];
    m.find('.times > span').each(function() {
      showtimes.push($(this).text().trim());
    });
    showtimes = formatShowtimes(showtimes);

    $('.showtimes .theater').each(function(i, t) {
      t = $(t);

      var showtimes = [];
      m.find('.times > span').each(function() {
        showtimes.push($(this).text().trim());
      });

      var theater = {
        name: t.find('.name').text(),
        address: t.find('.address').text(),
        showtimes: formatShowtimes(showtimes)
      };

      movie.theaters.push(theater);
    });

    self._cache.set(url, movie);
    callback(null, movie);
  })

};

// Private
function requestGET(url, callback) {
  request({uri: url, method: 'GET', encoding: null}, function (err, res, body) {
    if (err) {
      callback(err);
      return;
    }
    if (res.statusCode !== 200) {
      callback(res.statusCode);
      returnl
    }

    var encoding = charset(res.headers, body);
    var $ = cheerio.load(iconv.decode(new Buffer(body), encoding));

    callback(null, $);
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
function formatInfos(infos) {
  var cursor = 0,
    duration = null,
    rating   = null,
    genre    = null;

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
  var today = new Date();
  var d = today; // TODO Consider today, tomorrow, etc.

  var middle = -1;
  for (var i = 0; i < showtimes.length; i++) {
    if (showtimes[i + 1]) {
      var curr = parseInt(showtimes[i].split(':')[0]);
      var next = parseInt(showtimes[i + 1].split(':')[0]);
      if (curr > next) {
        middle = i;
        //console.log(showtimes[i] + ' ' + showtimes[i + 1] + ' ' + middle);
        break;
      }
    }
  }

  return showtimes.map(function(s, i) {
    var hm = s.split(':');
    var date = new Date(d.getTime());

    var pm = true;
    if (i <= middle)
      pm = false;

    if (pm)
      date.setHours(parseInt(hm[0]) + 12);
    else
      date.setHours(hm[0]);

    date.setMinutes(hm[1]);
    date.setSeconds(0);

    return date;
  });
};

// var p = Projection(10);
// p.findTheaters('Montreal', { hl:'ru'}, function(err, theaters) {
//  console.log(theaters[9].movies[3]);
// });
// p.findMovie('Sherbrooke', 'Mad Max', { hl:'ru'}, function(err, movie) {
//  console.log(movie.theaters[0]);
// });

module.exports = Projection;