const request = require('request'); // TODO use 'http' instead of request?
const cheerio = require('cheerio');
const qs = require('querystring');
const iconv = require('iconv-lite');
const Cache = require('./cache');

function Projection() {
  if (!(this instanceof Projection)) { return new Projection(); }

  this.GOOGLE_ENDPOINT = 'http://www.google.com/movies';
  this._cache = new Cache(); // TODO problem with timeouts not dying at end of program
}

// Public
// Find showtimes of nearby theaters
Projection.prototype.findTheaters = function (near, options, callback) {
  const self = this;

  const url = this.GOOGLE_ENDPOINT + toQS(options, near);

  const cached = self._cache.get(url);
  if (cached) {
    callback(null, cached);
    return;
  }

  requestGET(url, (err, $) => {
    if (err) {
      callback(err);
      return;
    }

    if (!$('.theater').length) {
      callback('Cannot find theaters');
      return;
    }

    // List of theaters returned
    const theaters = [];

    $('.theater').each((i, t) => {
      t = $(t);

      const theater = {
        name: t.find('.desc .name').text(),
        address: t.find('.desc .info').text().split(' - ')[0].trim(),
        phone: t.find('.desc .info').text().split(' - ')[1].trim(),
        note: t.find('.desc .closure').text(), // status
        movies: [],
      };

      // Google movie info format : Duration - Rating - Genre - Trailer - IMDB
      t.find('.showtimes .movie').each((j, m) => {
        m = $(m);

        const infos = formatInfos(m.find('.info').text().split(' - '));
        let showtimes = [];
        m.find('.times > span').each(function () {
          showtimes.push($(this).text().trim());
        });
        showtimes = formatShowtimes(showtimes);

        let trailer = null;
        if (m.find('.info a').attr('href') && (m.find('.info a').attr('href').match(/(youtube|vimeo|daily)/))) {
          trailer = m.find('.info a').attr('href').replace('/url?q=', '').trim();
        }

        let imdbId = null;
        if (m.find('.info a[href*=imdb]') && m.find('.info a[href*=imdb]').attr('href')) {
          const match = m.find('.info a[href*=imdb]').attr('href').match(/title\/(.*)\//);
          if (match) { imdbId = match[1]; }
        }

        // console.log(infos);
        const movie = {
          title: m.find('.name').text(),
          imdbId,
          duration: infos.duration,
          rating: infos.rating,
          genre: infos.genre,
          trailer,
          showtimes,
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
Projection.prototype.findMovie = function (near, movie, options, callback) {
  const self = this;

  const url = self.GOOGLE_ENDPOINT + toQS(options, near, movie);

  const cached = self._cache.get(url);
  if (cached) {
    callback(null, cached);
    return;
  }

  requestGET(url, (err, $) => {
    if (err) {
      callback(err);
      return;
    }

    if (!$('.movie').length) {
      callback('Cannot find movie');
      return;
    }

    const m = $('.movie');

    const content = m.find('.desc .info').not('.info.links').html().split('<br>');

    const infos = formatInfos(content[0].split(' - '));

    const persons = $(`<div>${content[1]}</div>`);
    const director = persons.find('span[itemprop="director"]').text().trim();
    const cast = [];
    persons.find('span[itemprop="actors"]').each((gg, a) => {
      cast.push($(a).text().trim());
    });

    let trailer = null;
    if (m.find('.info a').attr('href') && (m.find('.info a').attr('href').match(/(youtube|vimeo|daily)/))) {
      trailer = m.find('.info a').attr('href').replace('/url?q=', '').trim();
    }

    let imdbId = null;
    if (m.find('.info a').attr('href')) {
      const match = m.find('.info a[href*=imdb]').attr('href').match(/title\/(.*)\//);
      if (match) { imdbId = match[1]; }
    }

    const desc = m.find('span[itemprop="description"]').text() + m.find('#SynopsisSecond0').clone().children().remove()
      .end()
      .text()
      .trim();

    const movie = {
      title: m.find('.desc h2').text(),
      desc,
      director,
      cast,
      imdbId,
      duration: infos.duration,
      rating: infos.rating,
      genre: infos.genre,
      trailer,
      theaters: [],
    };

    m.find('.showtimes .theater').each((i, t) => {
      t = $(t);

      const showtimes = [];
      t.find('.times > span').each(function () {
        showtimes.push($(this).text().trim());
      });

      const theater = {
        name: t.find('.name').text(),
        address: t.find('.address').text(),
        showtimes: formatShowtimes(showtimes),
      };

      movie.theaters.push(theater);
    });

    self._cache.set(url, movie);
    callback(null, movie);
  });
};

// Private
function requestGET(url, callback) {
  request.get({ url, encoding: null }, (err, res, body) => {
    if (err) {
      callback(err);
      return;
    }
    if (res.statusCode !== 200) {
      callback(res.statusCode);
      return;
    }

    const regex = /(?:charset|encoding)\s*=\s*['"]? *([\w\-]+)/i;
    const encoding = regex.exec(res.headers['content-type'])[1];

    const $ = cheerio.load(iconv.decode(new Buffer(body), encoding));

    callback(null, $);
  });
}

// Private
function toQS(options, near, movie) {
  const args = {};

  if (options.date) args.date = options.date;
  if (options.lang) args.hl = options.lang;
  if (near) args.near = near;
  if (movie) args.movie = movie;

  return `?${qs.stringify(args)}`;
}

// Private
function formatInfos(infos) {
  let cursor = 0;


  let duration = null;


  let rating = null;


  let genre = null;

  if (infos[cursor].match(/(1|2|hr|min)/)) {
    duration = infos[cursor].trim();
    cursor++;
  }

  if (infos[cursor].match(/(G|\+|13|16|18)/)) {
    rating = infos[cursor].trim();
    cursor++;
  }

  if (infos[cursor].match(/(^\D*$)/)) {
    genre = infos[cursor].trim();
    cursor++;
  }

  return {
    duration,
    rating,
    genre,
  };
}

// Private
function formatShowtimes(showtimes) {
  const today = new Date();
  const d = today; // TODO Consider today, tomorrow, etc.

  let middle = -1;
  for (let i = 0; i < showtimes.length; i++) {
    if (showtimes[i + 1]) {
      const curr = parseInt(showtimes[i].split(':')[0]);
      const next = parseInt(showtimes[i + 1].split(':')[0]);
      if (curr > next) {
        middle = i;
        // console.log(showtimes[i] + ' ' + showtimes[i + 1] + ' ' + middle);
        break;
      }
    }
  }

  return showtimes.map((s, i) => {
    const hm = s.split(':');
    const date = new Date(d.getTime());

    let pm = true;
    if (i <= middle) { pm = false; }

    if (pm) { date.setHours(parseInt(hm[0]) + 12); } else { date.setHours(hm[0]); }

    date.setMinutes(hm[1]);
    date.setSeconds(0);

    return date;
  });
}

// var p = Projection(10);
// p.findTheaters('Sherbrooke', { lang:'en'}, function(err, theaters) {
//  console.log(theaters[0].movies[0]);
// });
// p.findMovie('Sherbrooke', 'Ted 2', { lang:'en'}, function(err, movie) {
//   console.log(movie);
// });

module.exports = Projection;
