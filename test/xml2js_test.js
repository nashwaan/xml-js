/*jslint node:true */
/*global describe,it,expect,beforeEach*/

var convert = require('../lib');
var testItems = require('./test-items');

describe('Testing xml2js.js:', function () {
    'use strict';
    
    //var books = require('fs').readFileSync('test/fixtures/books.xml');
    
    var options = {};

    testItems.pop();
    testItems.pop();

    beforeEach(function () {

    });
    
    describe('Using default options (result as nested arrays):', function () {
        
        testItems.forEach(function (test) {
            it(test.desc, function () {
                expect(convert.xml2js(test.xml, options)).toEqual(test.js);
            });
        });
        
    });
        
});