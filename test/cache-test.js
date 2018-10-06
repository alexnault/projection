const assert = require('assert');
const Cache = require('../lib/cache');

let c; // Cache

describe('Cache', () => {
  beforeEach(() => {
    c = new Cache();
  });

  describe('new Cache()', () => {
    it('should have the default values', () => {
      c = new Cache();
      assert.deepEqual(c._hash, {});
      assert.equal(c._ttl, 60000);
    });

    it('should have the defined values', () => {
      c = new Cache(10 * 60 * 1000); // 10 minutes
      assert.deepEqual(c._hash, {});
      assert.equal(c._ttl, 600000);
    });
  });

  describe('.get()', () => {
    it('should get a value using a key', () => {
      const expected = 123;
      c._hash.key = { v: expected };
      assert.equal(c.get('key'), expected);
    });

    it('should get undefined from a non-existing key', () => {
      assert.equal(c.get('unknown-key'), undefined);
    });
  });

  describe('.set()', () => {
    it('should set a value to a key', () => {
      const expected = 456;
      c.set('key', expected);
      assert.equal(c._hash.key.v, expected);
    });

    it('should overwrite a value to a key', () => {
      const v1 = 789;
      const v2 = 123;
      c.set('key', v1);
      c.set('key', v2);
      assert.equal(c._hash.key.v, v2);
    });

    it('should set the value so it is deleted after its ttl ended', (done) => {
      const ttl = 50;
      c = new Cache(ttl);
      c.set('key', 123);
      assert.equal(c._hash.key.v, 123);

      setTimeout(() => {
        assert.equal(c._hash.key, undefined);
        done();
      }, ttl);
    });
  });

  describe('.del()', () => {
    it('should remove the value of the key', () => {
      c._hash.key = { v: 123 };
      assert.equal(c._hash.key.v, 123);
      c.del('key');
      assert.equal(c._hash.key, undefined);
    });
  });

  describe('.clear()', () => {
    it('should empty the cache', () => {
      c._hash.k1 = { v: 123 };
      c._hash.k2 = { v: 456 };
      assert.equal(c._hash.k1.v, 123);
      assert.equal(c._hash.k2.v, 456);
      c.clear();
      assert.equal(c._hash.k1, undefined);
      assert.equal(c._hash.k2, undefined);
    });
  });
});
