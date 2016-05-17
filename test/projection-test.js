'use strict';

var projection = require('../lib/projection'),
  assert = require('assert');

var p; // Projection

describe('Projection', function() {
  beforeEach(function() {
    p = projection();
  })

  it('should have the corresponding endpoint', function() {
    assert.equal(p.GOOGLE_ENDPOINT, 'http://www.google.com/movies');
  })

  describe('.findTheaters()', function(){
    it('should find theaters by town', function(done) {
      p.findTheaters('Montreal', {}, function(err, theaters) {
        assert.equal(err, null);
        assert(theaters.length > 0);
        assert(theaters[0].name);
        assert(theaters[1].movies[0].imdbId.substring(0, 2), 'tt');
        // TODO test returned content
        done();
      });
    })

    it('should find theaters by lat/long', function(done) {
      p.findTheaters('45.3838273,-71.8958539', {}, function(err, theaters) {
        assert.equal(err, null);
        assert(theaters.length > 0);
        assert(theaters[0].name);
        // TODO test returned content
        done();
      });
    })

    // it('should find theaters by zipcode', function(done) {
    //   p.findTheaters('Montreal', {}, function(err, theaters) {
    //     assert.equal(err, null);
    //     done();
    //   });
    // })

    it('should return requestjs error', function(done) {
      p.GOOGLE_ENDPOINT = 'abc';
      p.findTheaters('Montreal', {}, function(err, theaters) {
        assert.notEqual(err, null);
        done();
      });
    })

    it('should return a 404 error', function(done) {
      p.GOOGLE_ENDPOINT = 'http://httpstat.us/404';
      p.findTheaters('Montreal', {}, function(err, theaters) {
        assert.equal(err, 404);
        done();
      });
    })

    it('should return an error if no theaters are found', function(done) {
      p.findTheaters('Innexistant Place', {}, function(err, theaters) {
        assert.notEqual(err, null);
        done();
      });
    })

    it('should return theaters more quickly the second time', function(done) {
      var start = new Date().getTime();
      p.findTheaters('Montreal', {}, function(err, theaters) {
        var t1 = new Date().getTime() - start;
        start = new Date().getTime();
        p.findTheaters('Montreal', {}, function(err, theaters) {
          var t2 = new Date().getTime() - start;
          assert(t1 >= t2); // ~500ms to ~10ms
          assert(t2 < 50); // Expect cache to take lesser than 50ms
          done();
        });
      });
    })
  })

  describe('.findMovie()', function() {
    it('should find a movie\'s showtimes by town', function(done){
      p.findMovie('Sherbrooke', 'Captain America: Civil War', {}, function(err, movie){
        assert.equal(err, null);
        assert(movie);
        assert(movie.theaters.length > 0);
        assert(movie.theaters[0].name);
        // TODO test returned content
        done();
      });
    })

    it('should find a movie\'s showtimes by lat/long', function(done){
      p.findMovie('45.3838273,-71.8958539', 'Captain America: Civil War', {}, function(err, movie){
        assert.equal(err, null);
        assert(movie);
        assert(movie.theaters.length > 0);
        assert(movie.theaters[0].name);
        // TODO test returned content
        done();
      });
    })

    // it('should find a movie\'s showtimes by zipcode', function(done){
    //   p.findMovie('Sherbrooke', 'Mad Max', {}, function(err, movie){
    //     // TODO test returned content
    //     done();
    //   });
    // })

    it('should return requestjs error', function(done) {
      p.GOOGLE_ENDPOINT = 'abc';
      p.findMovie('Montreal', 'Mad Max', {}, function(err, theaters) {
        assert.notEqual(err, null);
        done();
      });
    })

    it('should return a 404 error', function(done) {
      p.GOOGLE_ENDPOINT = 'http://httpstat.us/404';
      p.findMovie('Montreal', 'Mad Max', {}, function(err, theaters) {
        assert.equal(err, 404);
        done();
      });
    })

    it('should return an error if the movie is not found', function(done) {
      p.findMovie('Montreal', 'Random movie name that does not exist', {}, function(err, theaters) {
        assert.notEqual(err, null);
        done();
      });
    })

    it('should return a movie more quickly the second time', function(done) {
      var start = new Date().getTime();
      p.findMovie('Montreal', 'Captain America: Civil War', {}, function(err, theaters) {
        var t1 = new Date().getTime() - start;
        start = new Date().getTime();
        p.findMovie('Montreal', 'Captain America: Civil War', {}, function(err, theaters) {
          var t2 = new Date().getTime() - start;
          assert(t1 >= t2); // ~500ms to ~10ms
          assert(t2 < 100); // Expect cache to take lesser than 100ms
          done();
        });
      });
    })
  })

})
