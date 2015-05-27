'use strict'

function Cache(ttl) {
  this._hash = {};
  this._ttl = (ttl) ? ttl : 1000 * 60; // Default to 1 min
};

// Public
Cache.prototype.get = function(key) {
  //console.log(this._cache[key])
  return (this._hash[key]) ? this._hash[key].v : undefined;
};

// Public
Cache.prototype.set = function(key, value) {
  // console.log('Added to cache');
  var self = this;

  var timeout = setTimeout(function() {
    //console.log('timeout reached');
    delete self._hash[key];
  }, this._ttl);

  this._hash[key] = { v: value, t: timeout };
};

// Public
Cache.prototype.del = function(key) {
  //console.log('Delete ' + key);
  clearTimeout(this._hash[key].t);
  delete this._hash[key];
};

// Public
Cache.prototype.clear = function() {
  //console.log('Cache cleared');
  for (var key in this._hash) {
    clearTimeout(this._hash[key].t);
  }
  this._hash = {};
};

module.exports = Cache;