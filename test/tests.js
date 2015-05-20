'use strict';

var g =  (process.env['COVERAGE'] == 1);

var libpath = g ? '../lib-cov/' : '../lib/';
//var something = require(libpath + '/something');
//var other = require(libpath + '/other');

var app = require(libpath + 'projection');
var assert = require("assert")

describe('Array', function(){
  describe('#indexOf()', function(){
    it('should return -1 when the value is not present', function(){
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
    })
  })
})