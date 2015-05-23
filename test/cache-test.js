'use strict';

var assert = require('assert');
//var sinon = require('sinon');
var Cache = require('../lib/cache');

var c; // Cache

describe('Cache', function(){
  beforeEach(function(){
    c = new Cache();
  })

  describe('new Cache()', function(){
    it('should have the appropriate values', function(){
      c = new Cache(10);
      assert.equal(c._hash.length, 0);
      assert.equal(c.capacity, 10);
    })
  })

  describe('#get()', function(){
    it('should get a value using a key', function(){
      var expected = 123;

      c._hash['key'] = expected;

      assert.equal(c.get('key'), expected);
    })

    it('should get undefined from a non-existing key', function(){
      assert.equal(c.get('unknown-key'), undefined);
    })
  })

  describe('#set()', function(){
    it('should set a value to a key', function(){
      var expected = 456;

      c.set('key', expected);

      assert.equal(c._hash['key'], expected);
    })

    it('should overwrite a value to a key', function(){
      var v1 = 789;
      var v2 = 123;

      c.set('key', v1);
      c.set('key', v2);

      assert.equal(c._hash['key'], v2);
    })
  })
})

