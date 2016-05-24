/*jslint node:true */
/*global describe,it,expect,beforeEach*/

var convert = require('../lib');
var testItems = require('./test-items');

describe('Testing js2xml.js:', function () {
    'use strict';
    
    //var books = require('fs').readFileSync('test/fixtures/books.xml');
    
    var options;
    
    //testItems.pop();
    //tests = [tests[5]];
    
    beforeEach(function () {
        
    });
    
    //console.log(js2xml({"elements":[{"type":"element","name":"a","attributes":{},"elements":[{"type":"element","name":"b","attributes":{}}]}]}, options));
    //expect(js2xml(test.js2, options)).toEqual(test.xml);
    
    describe('No options supplied (fallback to defaults):', function () {
        
        var options = {};
        testItems(options).forEach(function (test) {
            it(test.desc, function () {
                expect(convert.js2xml(test.js, options)).toEqual(test.xml);
            });
        });
        
    });
    
    describe('options = {spaces: 0}', function () {
        
        describe('Options set to default values explicitly:', function () {
            
            var options = {spaces: 0, ignoreText: false, ignoreComment: false, ignoreCdata: false, fullTagEmptyElement: false};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.js2xml(test.js, options)).toEqual(test.xml);
                });
            });
            
        });
        
        describe('options = {spaces: 0}', function () {
            
            var options = {spaces: 0};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.js2xml(test.js, options)).toEqual(test.xml);
                });
            });
            
        });
        
        describe('options = {spaces: 0, ignoreText: true}', function () {
            
            var options = {spaces: 0, ignoreText: true};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.js2xml(test.js, options)).toEqual(test.xml);
                });
            });
            
        });
        
        describe('options = {spaces: 0, ignoreComment: true}', function () {
            
            var options = {spaces: 0, ignoreComment: true};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.js2xml(test.js, options)).toEqual(test.xml);
                });
            });
            
        });
        
        describe('options = {spaces: 0, ignoreCdata: true}', function () {
            
            var options = {spaces: 0, ignoreCdata: true};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.js2xml(test.js, options)).toEqual(test.xml);
                });
            });
            
        });
        
        describe('options = {spaces: 0, fullTagEmptyElement: true}', function () {
            
            var options = {spaces: 0, fullTagEmptyElement: true};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.js2xml(test.js, options)).toEqual(test.xml);
                });
            });
            
        });
        
    });
    
    describe('json2xml:', function () {
        
        var options = {};
        testItems(options).forEach(function (test) {
            it(test.desc, function () {
                expect(convert.json2xml(JSON.stringify(test.js), options)).toEqual(test.xml);
            });
        });
        
    });
    
});