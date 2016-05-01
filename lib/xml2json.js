/*jslint node:true */
var xml2js = require('./xml2js');

module.exports = function(xml, options) {
    
    var js = xml2js(xml, options), json, parentKey;
    parentKey = options.nestedObjects ? '_parent' : 'parent';
    if (options.addParent) {
        json = JSON.stringify(js, function (k, v) {
            return k === parentKey? '_' : v;
        });
    } else {
        json = JSON.stringify(js);
    }
    return json.replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
    
};