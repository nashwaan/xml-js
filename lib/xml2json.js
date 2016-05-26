/*jslint node:true */
var common = require('./common');
var xml2js = require('./xml2js');

function validateOptions (userOptions) {
    var options = common.copyOptions(userOptions);
    if (!('spaces' in options) || (typeof options.spaces !== 'string' || isNaN(parseInt(options.spaces, 10)))) {
        options.spaces = 0;
    }
    return options;
}

module.exports = function(xml, userOptions) {
    'use strict';
    var options, js, json, parentKey;
    options = validateOptions(userOptions);
    js = xml2js(xml, options);
    parentKey = 'compact' in options && options.compact ? '_parent' : 'parent';
    if ('addParent' in options && options.addParent) {
        json = JSON.stringify(js, function (k, v) { return k === parentKey? '_' : v; }, options.spaces);
    } else {
        json = JSON.stringify(js, null, options.spaces);
    }
    return json.replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
};