*This project is obsolete since Google doesn't support the pages this projet relyied on anymore.*

# Projection
Movie showtimes around the globe.

[![Build Status](https://img.shields.io/travis/anault/projection.svg?style=flat-square)](https://travis-ci.org/anault/projection)
[![Coverage Status](https://img.shields.io/coveralls/anault/projection.svg?style=flat-square)](https://coveralls.io/r/anault/projection)

[![NPM](https://nodei.co/npm/projection.png)](https://nodei.co/npm/projection/)

## Installation
```bash
yarn install projection --save
```

## Example
```javascript
var projection = require('projection');
var p = projection();

p.findTheaters('Montreal', {}, function(err, theaters) {
  console.log(theaters);
});

p.findMovie('Montreal', 'Mad Max', {}, function(err, movie) {
  console.log(movie);
});
```

## How to use
#### projection.findTheaters(near, options, callback);
- **near** - Either a city or a lat/long. ex.: 'Montreal' or '45.3838,-71.8958'
- **options**
  - **lang** - Select langage (default = 'en')
  - **date** - Select date (0, 1, 2, etc.) (default = 0 ie. today)
- **callback** - Function using the results

Returns an array of theaters (and their showtimes) following this structure:
```javascript
{  
  name: 'Cineplex Odeon Forum Cinemas',
  address: '2313 Sainte-Catherine Street West, Montreal, QC, Canada',
  phone: '(514) 904-1274',
  note: '',
  movies: [  
    {  
      title: 'Insurgent 3D',
      duration: '1hr 59min',
      rating: 'Rated G',
      genre: 'Action/Adventure/Romance',
      trailer: 'http://www.youtube.com/watch...',
      showtimes:[ '18:00', '20:15' ]
    },
    // Other movies in this theater...
  ]
}
```
#### projection.findMovie(near, movie, options, callback);
- **near** - Either a city or a lat/long. ex.: 'Montreal' or '45.3838,-71.8958'
- **movie** - A movie name. ex.: 'Mad Max'
- **options**
  - **lang** - Select langage (default = 'en')
  - **date** - Select date (0, 1, 2, etc.) (default = 0 ie. today)
- **callback** - Function using the results

Returns the movie and its showtimes in the nearest theaters following this structure:
```javascript
{  
  title: 'Mad Max: Fury Road',
  desc: 'Haunted by his turbulent past, Mad Max believes[...]',
  director: 'George Miller',
  cast: [ 'Charlize Theron', 'Tom Hardy' ],
  duration: '2hr 0min',
  rating: 'Rated 13+',
  genre: 'Action/Adventure/Scifi/Fantasy',
  trailer: 'http://www.youtube.com/watch[...]',
  theaters: [  
    {  
      name: 'Scotiabank Theatre Montreal',
      address: '977 rue Sainte-Catherine Ouest, Montreal, QC, Canada',
      showtimes: [ '19:50', '22:15' ]
    },
    // Other theaters with this movie...
  ]
}
```

## Features
- Multi-lang support
- Caching of repeated calls
- More to come...

## Wanna help?
Any contribution is welcomed!
