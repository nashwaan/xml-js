/*jslint node:true */
/*global describe,it,expect,beforeEach*/

var xml2js = require('../lib/xml2js');
var xml2json = require('../lib/xml2json');
var tests = require('./test-items');

describe('Testing xml2js.js:', function () {
    'use strict';
    
    //var books = require('fs').readFileSync('test/fixtures/books.xml');
    
    var options = {};

    tests.pop();

    beforeEach(function () {

    });
    
    describe('Using default options (result as nested arrays):', function () {
        
        tests.forEach(function (test) {
            it(test.desc, function () {
                expect(xml2js(test.xml, options)).toEqual(test.js);
            });
        });
        
    });
        
});