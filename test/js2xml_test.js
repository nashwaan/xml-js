/*jslint node:true */
/*global describe,it,expect,beforeEach*/

var js2xml = require('../lib/js2xml');
var tests = require('./test-items');

describe('Testing js2xml.js:', function () {
    'use strict';
    
    //var books = require('fs').readFileSync('test/fixtures/books.xml');
    
    var options = {};
    
    tests.pop();
    //tests = [tests[5]];
    
    beforeEach(function () {
        
    });
    
    //console.log(js2xml({"elements":[{"type":"element","name":"a","attributes":{},"elements":[{"type":"element","name":"b","attributes":{}}]}]}, options));
    //expect(js2xml(test.js, options)).toEqual(test.xml);
    
    describe('Using default options (result with 4 spaces indentation):', function () {
        
        tests.forEach(function (test) {
            it(test.desc, function () {
                expect(js2xml(test.js, options)).toEqual(test.xml);
            });
        });
        
    });
    
});