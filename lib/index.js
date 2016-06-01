/*jslint node:true */

if (process.argv.length > 2) {
    require('./cli')();
} else {
    module.exports = {
        xml2js: require('./xml2js'),
        xml2json: require('./xml2json'),
        js2xml: require('./js2xml'),
        json2xml: require('./json2xml')
    };
}