/*jslint node:true */
/*global describe,it,expect,beforeEach*/

var convert = require('../lib');
var testItems = require('./test-items');

describe('Testing js2xml.js:', function () {
    'use strict';
    
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
        
        describe('using default options', function () {
            
            var options = {};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.json2xml(JSON.stringify(test.js), options)).toEqual(test.xml);
                });
            });
            
        });
        
        describe('submitting json as javascript object', function () {
            
            var options = {};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.json2xml(test.js, options)).toEqual(test.xml);
                });
            });
            
        });
        
        describe('using buffer', function () {
            
            var options = {};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.json2xml(new Buffer(JSON.stringify(test.js)), options)).toEqual(test.xml);
                });
            });
            
        });
        
    });
    
});