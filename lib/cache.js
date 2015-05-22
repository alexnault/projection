'use strict'

function Cache(capacity) {
  this.capacity = capacity;
  this._cache = [];
};

// Public
Cache.prototype.get = function(key) {
  //console.log(this._cache[key])
  return this._cache[key];
};

// Public
Cache.prototype.set = function(key, value) {
  //console.log('Added to cache');
  this._cache[key] = value;
};

module.exports = Cache;