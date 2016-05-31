/*jslint node:true */
/*global describe,it,expect,beforeEach,afterEach*/

var convert = require('../lib');
var testItems = require('./test-items');

describe('Testing xml2js.js:', function () {
    'use strict';
    
    //var books = require('fs').readFileSync('test/fixtures/books.xml');
    
    /*describe('No options supplied (fallback to defaults):', function () {
        
        var options = {};
        testItems(options).forEach(function (test) {
            it(test.desc, function () {
                expect(convert.xml2js(test.xml, options)).toEqual(test.js);
            });
        });
        
    });*/
    
    describe('No options supplied (fallback to defaults):', function () {
        
        var options = {onlyItem: 6};
        testItems(options).forEach(function (test) {
            it(test.desc, function () {
                expect(convert.xml2js(test.xml, options)).toEqual(test.js);
            });
        });
        
    });
    
    describe('options = {compact: false}', function () {
        
        describe('Options set to default values explicitly:', function () {
            
            var options = {singleLine: false, compact: false, trim: false, sanitize: false, nativeType: false, emptyChildren: false, addParent: false};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });
            
        });
        
        describe('options = {compact: false}', function () {
            
            var options = {compact: false};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });
            
        });
        
        describe('options = {compact: false, trim: true}', function () {
            
            var options = {compact: false, trim: true};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });
            
        });
        
        describe('options = {compact: false, sanitize: true}', function () {
            
            var options = {compact: false, sanitize: true};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });
            
        });
        
        describe('options = {compact: false, nativeType: true}', function () {
            
            var options = {compact: false, nativeType: true};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });
            
        });
        
        describe('options = {compact: false, emptyChildren: true}', function () {
            
            var options = {compact: false, emptyChildren: true};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });
            
        });
        
        describe('options = {compact: false, addParent: true}', function () {
            
            var options = {compact: false, addParent: true};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });
            
        });
        
    });
    
    describe('options = {compact: true}', function () {
        
        describe('Options set to default values explicitly:', function () {
            
            var options = {compact: true, trim: false, sanitize: false, nativeType: false, emptyChildren: false, addParent: false};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });
            
        });
        
        describe('options = {compact: true}', function () {
            
            var options = {compact: true};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });
            
        });
        
        describe('options = {compact: true, trim: true}', function () {
            
            var options = {compact: true, trim: true};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });
            
        });
        
        describe('options = {compact: true, sanitize: true}', function () {
            
            var options = {compact: true, sanitize: true};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });
            
        });
        
        describe('options = {compact: true, emptyChildren: true}', function () {
            
            var options = {compact: true, emptyChildren: true};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });
            
        });
        
        describe('options = {compact: true, addParent: true}', function () {
            
            var options = {compact: true, addParent: true};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });
            
        });
        
    });
    
    describe('Various options:', function () {
        
        describe('options = {trim: true}', function () {

            var options = {trim: true};
            testItems({trim: true}).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });
        
        describe('options = {nativeType: true}', function () {

            var options = {nativeType: true};

            it('Parse number', function () {
                expect(convert.xml2js('<a>123</a>', options)).toEqual({"elements":[{"type":"element","name":"a","elements":[{"type":"text","text":123}]}]});
            });
            it('Parse true', function () {
                expect(convert.xml2js('<a>true</a>', options)).toEqual({"elements":[{"type":"element","name":"a","elements":[{"type":"text","text":true}]}]});
            });
            it('Parse false', function () {
                expect(convert.xml2js('<a>false</a>', options)).toEqual({"elements":[{"type":"element","name":"a","elements":[{"type":"text","text":false}]}]});
            });
            convert.xml2js('<a>x', {});
            /*it('Parse improper XML', function () {
                expect(convert.xml2js('<a>x', {})).toEqual({"elements":[{"type":"element","name":"a","elements":[{"type":"text","text":"x"}]}]});
            });*/

        });
        
    });
    
    describe('xml2json:', function () {
        
        describe('No options supplied (fallback to defaults):', function () {
            
            var options = {};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2json(test.xml, options)).toEqual(JSON.stringify(test.js));
                });
            });
            
        });
        
        describe('options = {compact: true, addParent: true}:', function () {
            
            var options = {onlyItem:3, compact: true, addParent: true};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2json(test.xml, options)).toBe(JSON.stringify(test.js, function (k, v) { return k === '_parent'? '_' : v; }));
                });
            });
            
        });
        
    });
    
});