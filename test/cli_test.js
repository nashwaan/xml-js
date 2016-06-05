/*jslint node:true*/
/*global describe,it,expect,beforeEach,afterEach*/

var convert = require('../lib');
var testItems = require('./test-items');

describe('Testing cli.js:', function () {
    'use strict';
    
    xdescribe('No options supplied (fallback to defaults):', function () {
        
        var options = {onlyItem: 6};
        testItems(options).forEach(function (test) {
            it(test.desc, function () {
                expect(convert.xml2js(test.xml, options)).toEqual(test.js);
            });
        });
        
    });
    
});