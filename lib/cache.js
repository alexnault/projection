'use strict'

function Cache(capacity) {
  this.capacity = capacity;
  this._hash = [];
  this._ttl = 3000; // 3 seconds

  //this._intervalId = setInterval(this.clear(), this._ttl); 
};

// Public
Cache.prototype.get = function(key) {
  //console.log(this._cache[key])
  return this._hash[key];
};

// Public
Cache.prototype.set = function(key, value) {
  //console.log('Added to cache');
  this._hash[key] = value;
};

// Cache.prototype.clear = function() {
//   console.log('Cache cleared');
//   this._hash = [];
// };

module.exports = Cache;