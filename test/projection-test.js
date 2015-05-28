'use strict';

var projection = require('../lib/projection'),
  assert = require('assert'),
  sinon = require('sinon'),
  request = require('request'),
  fs = require('fs'),
  path = require('path');

var p; // Projection
var theatersBody;
var movieBody;
var res;

describe('Projection', function() {
  before(function(done) {
    var filePath = path.join(__dirname, 'stubs/theaters.html');
    fs.readFile(filePath, { encoding: 'utf-8' }, function(err, data){
      theatersBody = data;
      done();
    });
  });

  before(function(done) {
    var filePath = path.join(__dirname, 'stubs/movie.html');
    fs.readFile(filePath, { encoding: 'utf-8' }, function(err, data){
      movieBody = data;
      done();
    });
  });

  beforeEach(function() {
    p = projection();
    res = {
      statusCode: 200,
      headers: { 'content-type' : 'text/html; charset=windows-1251' }
    };
  })

  it('should have the corresponding endpoint', function() {
    assert.equal(p.GOOGLE_ENDPOINT, 'http://www.google.com/movies');
  })

  describe('.findTheaters()', function(){
    afterEach(function(){
      request.get.restore();
    })

    it('should find theaters by town', function(done) {
      sinon.stub(request, 'get').yields(null, res, theatersBody);
      p.findTheaters('Montreal', {}, function(err, theaters) {
        assert.equal(err, null);
        assert(theaters.length > 0);
        assert(theaters[0].name);
        // TODO test returned content
        done();
      });
    })

    // it('should find theaters by zipcode', function(done) {
    //   sinon.stub(request, 'get').yields(null, res, null);
    //   p.findTheaters('Montreal', {}, function(err, theaters) {
    //     assert.equal(err, null);
    //     done();
    //   });
    // })

    // it('should find theaters by lat/long', function(done) {
    //   sinon.stub(request, 'get').yields(null, res, null);
    //   p.findTheaters('Montreal', {}, function(err, theaters) {
    //     assert.equal(err, null);
    //     done();
    //   });
    // })

    it('should return requestjs error', function(done) {
      sinon.stub(request, 'get').yields('Fatal error', res, null);
      p.findTheaters('Montreal', {}, function(err, theaters) {
        assert.notEqual(err, null);
        done();
      });
    })

    it('should return a 404 error', function(done) {
      res.statusCode = 404;
      sinon.stub(request, 'get').yields(null, res, null);
      p.findTheaters('Montreal', {}, function(err, theaters) {
        assert.equal(err, 404);
        done();
      });
    })

    it('should return theaters more quickly the second time', function(done) {
      var start = new Date().getTime();
      sinon.stub(request, 'get').yields(null, res, theatersBody);
      p.findTheaters('Montreal', {}, function(err, theaters) {
        var t1 = new Date().getTime() - start;
        start = new Date().getTime();
        p.findTheaters('Montreal', {}, function(err, theaters) {
          var t2 = new Date().getTime() - start;
          assert(t1 >= t2);
          assert(t2 < 50); // Expect cache to take lesser than 50ms
          done();
        });
      });
    })
  })

  describe('.findMovie()', function() {
    afterEach(function(){
      request.get.restore();
    })

    it('should find a movie\'s showtimes', function(done){
      sinon.stub(request, 'get').yields(null, res, movieBody);
      p.findMovie('Sherbrooke', 'Mad Max', {}, function(err, movie){
        // TODO test returned content
        done();
      });
    })

    it('should return requestjs error', function(done) {
      sinon.stub(request, 'get').yields('Fatal error', res, null);
      p.findMovie('Montreal', 'Mad Max', {}, function(err, theaters) {
        assert.notEqual(err, null);
        done();
      });
    })

    it('should return a 404 error', function(done) {
      res.statusCode = 404;
      sinon.stub(request, 'get').yields(null, res, null);
      p.findMovie('Montreal', 'Mad Max', {}, function(err, theaters) {
        assert.equal(err, 404);
        done();
      });
    })

    it('should return a movie more quickly the second time', function(done) {
      var start = new Date().getTime();
      sinon.stub(request, 'get').yields(null, res, movieBody);
      p.findMovie('Montreal', 'Mad Max', {}, function(err, theaters) {
        var t1 = new Date().getTime() - start;
        start = new Date().getTime();
        p.findMovie('Montreal', 'Mad Max', {}, function(err, theaters) {
          var t2 = new Date().getTime() - start;
          assert(t1 >= t2); // ~500ms to ~10ms
          assert(t2 < 100); // Expect cache to take lesser than 100ms
          done();
        });
      });
    })
  })

})