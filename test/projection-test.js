'use strict';

var assert = require('assert')
var projection = require('../lib/projection');

var p; // Projection

// Expected JSON format
// [
// 	{ name: "...", movies: [ {}, {} ]},
// 	{ name: "...", movies: [ {}, {} ]}
// ]

describe('Projection', function(){
	beforeEach(function(){
	  p = projection();
	})

	describe('new Projection()', function(){
    it('should have the corresponding endpoint', function(){
    	assert.equal(p.GOOGLE_ENDPOINT, 'http://www.google.com/movies');
    })
  })

  describe('#findTheaters()', function(){
    it('should find theaters by town', function(done){
			p.findTheaters('Montreal', {}, function(err, theaters) {
				//console.log(theaters);

				assert.equal(err, null);
				assert(theaters.length > 0);
				assert(theaters[0].name);

				done();
			});
    })

    it('should find theaters by zipcode', function(done){
    	p.findTheaters('Montreal', {}, function(err, theaters) {
				assert.equal(err, null);
				done();
			});
    })

    it('should find theaters by lat/long', function(done){
    	p.findTheaters('Montreal', {}, function(err, theaters) {
				assert.equal(err, null);
				done();
			});
    })

    it('should return requestjs error', function(done){
    	p.GOOGLE_ENDPOINT = 'abc'; // Override endpoint
    	p.findTheaters('Montreal', {}, function(err, theaters) {
				assert.notEqual(err, null);
				done();
			});
    })

    it('should return a 404 error', function(done){
    	p.GOOGLE_ENDPOINT = 'http://httpstat.us/404' // Override endpoint
    	p.findTheaters('Montreal', {}, function(err, theaters) {
				assert.equal(err, 404);
				done();
			});
    })

    it('should return theaters more quickly the second time', function(done){
      var start = new Date().getTime();

      p.findTheaters('Montreal', {}, function(err, theaters) {
        var t1 = new Date().getTime() - start;
        start = new Date().getTime();
        p.findTheaters('Montreal', {}, function(err, theaters) {
          var t2 = new Date().getTime() - start;
          assert(t1 >= t2); // ~500ms to ~10ms
          assert(t2 < 100); // Expect cache to take lesser than 100ms
          done();
        });
      });
    })
  })

// Expected JSON format
// title: "Avengers"
// theaters: [
// 	{ name: "...", showtimes: [7:00, 8:00] },
// 	{ name: "...", showtimes: [7:00, 8:00] }
// ]

  describe('#findMovie()', function(){
    it('should find a movie\'s showtimes', function(done){
    	p.findMovie('Sherbrooke', 'Mad Max', {}, function(err, movie){
    		done();
    	});
    })

    it('should return requestjs error', function(done){
    	p.GOOGLE_ENDPOINT = 'abc'; // Override endpoint
    	p.findMovie('Montreal', 'Mad Max', {}, function(err, theaters) {
				assert.notEqual(err, null);
				done();
			});
    })

    it('should return a 404 error', function(done){
    	p.GOOGLE_ENDPOINT = 'http://httpstat.us/404' // Override endpoint
    	p.findMovie('Montreal', 'Mad Max', {}, function(err, theaters) {
				assert.equal(err, 404);
				done();
			});
    })

    it('should return a movie more quickly the second time', function(done){
      var start = new Date().getTime();

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