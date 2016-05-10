/*jslint node:true */
/*global describe,it,expect,beforeEach,afterEach*/

var convert = require('../lib');
var testItems = require('./test-items');

describe('Testing xml2js.js:', function () {
    'use strict';
    
    //var books = require('fs').readFileSync('test/fixtures/books.xml');
    
    describe('No options supplied (fallback to defaults):', function () {
        
        var options;
        testItems({singleLine: true}).forEach(function (test) {
            it(test.desc, function () {
                console.log(options);
                expect(convert.xml2js(test.xml, options)).toEqual(test.js);
            });
        });
        
    });
    
    describe('Options set to default values explicitly:', function () {
        
        var options = {compact: false, emptyChildren: false, addParent: false, trim: false, sanitize: false};
        testItems({singleLine: true}).forEach(function (test) {
            it(test.desc, function () {
                console.log(options);
                expect(convert.xml2js(test.xml, options)).toEqual(test.js);
            });
        });
        
    });
    
    describe('Options set to compact js object:', function () {
        
        var options = {compact: true};
        testItems({singleLine: true, compact: true}).forEach(function (test) {
            it(test.desc, function () {
                console.log(options);
                expect(convert.xml2js(test.xml, options)).toEqual(test.js);
            });
        });
        
    });
    
    describe('Trim text:', function () {
        
        var options = {trim: true};
        
        it('trim text of element', function () {
            console.log(options);
            expect(convert.xml2js('<a> hi \n </a>', options)).toEqual({"elements":[{"type":"element","name":"a","attributes":{},"elements":[{"type":"text","text":"hi"}]}]});
        });
        
        it('trim text of attribute', function () {
            console.log(options);
            expect(convert.xml2js('<a x=" y \n " />', options)).toEqual({"elements":[{"type":"element","name":"a","attributes":{x:"y"}}]});
        });
        
        it('trim text of comment', function () {
            console.log(options);
            expect(convert.xml2js('<!-- hi \n  -->', options)).toEqual({"elements":[{"type":"comment","comment":"hi"}]});
        });
        
    });
    
});