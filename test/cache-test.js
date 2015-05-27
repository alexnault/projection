'use strict';

var assert = require('assert');
var Cache = require('../lib/cache');

var c; // Cache

describe('Cache', function(){
  beforeEach(function(){
    c = new Cache();
  })

  describe('new Cache()', function(){
    it('should have the default values', function(){
      c = new Cache();
      assert.deepEqual(c._hash, {});
      assert.equal(c._ttl, 60000);
    })

    it('should have the defined values', function(){
      c = new Cache(10 * 60 * 1000); // 10 minutes
      assert.deepEqual(c._hash, {});
      assert.equal(c._ttl, 600000);
    })
  })

  describe('.get()', function(){
    it('should get a value using a key', function(){
      var expected = 123;
      c._hash['key'] = { v: expected };
      assert.equal(c.get('key'), expected);
    })

    it('should get undefined from a non-existing key', function(){
      assert.equal(c.get('unknown-key'), undefined);
    })
  })

  describe('.set()', function(){
    it('should set a value to a key', function(){
      var expected = 456;
      c.set('key', expected);
      assert.equal(c._hash['key'].v, expected);
    })

    it('should overwrite a value to a key', function(){
      var v1 = 789;
      var v2 = 123;
      c.set('key', v1);
      c.set('key', v2);
      assert.equal(c._hash['key'].v, v2);
    })

    it('should set the value so it is deleted after its ttl ended', function(done){
      var ttl = 50;
      c = new Cache(ttl);
      c.set('key', 123);
      assert.equal(c._hash['key'].v, 123);
      
      setTimeout(function() {
        assert.equal(c._hash['key'], undefined);
        done();
      }, ttl)
    })
  })

  describe('.del()', function(){
    it('should remove the value of the key', function(){
      c._hash['key'] = { v: 123 };
      assert.equal(c._hash['key'].v, 123);
      c.del('key');
      assert.equal(c._hash['key'], undefined);
    })
  })

  describe('.clear()', function(){
    it('should empty the cache', function(){
      c._hash['k1'] = { v: 123 };
      c._hash['k2'] = { v: 456 };
      assert.equal(c._hash['k1'].v, 123);
      assert.equal(c._hash['k2'].v, 456);
      c.clear();
      assert.equal(c._hash['k1'], undefined);
      assert.equal(c._hash['k2'], undefined);
    })
  })

})