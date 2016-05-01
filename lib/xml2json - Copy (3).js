/*jslint node:true */
var sax = require('sax');
var expat = require('node-expat');
//var sanitizer = require('./sanitize.js');

module.exports = function(xml, options) {
    
    var pureJsParser = true;
    var result = {children: []};
    var currentElement = result;
    var parser = pureJsParser ? sax.createStream(true, {}) : parser = new expat.Parser('UTF-8');
    
    options = validateOptions(options);
    
    parser.on('opentag', function (node) {
        console.log('opentag:---------------', node);
        result.children.push('node.name');
    });

    parser.on('text', function (text) {
        console.log('text', text);
    });

    parser.on('closetag', function (tag) {
        console.log('closetag', tag);
    });

    if (pureJsParser) {
        //require('fs').createReadStream('test/fixtures/note.xml').pipe(parser);
        console.log('**********', xml);
        xml = '<?xml version="1.0" encoding="utf-8"?><note importance="high" logged="true">Watch out!<time>11:00 am</time><time>11:30 am</time></note>';
        var stream = new require('stream').Readable();
        stream.push(xml); stream.push(null);
        stream.pipe(parser);
    } else {
        if (!parser.parse(xml)) {
            throw new Error('XML parsing error: ' + parser.getError());
        }
    }
    
    if (options.object) {
        return result;
    } else {
        return JSON.stringify(result).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
    }
    
};

//var xml = '<?xml version="1.0" encoding="utf-8"?><note importance="high" logged="true">Watch out!<time>11:00 am</time><time>11:30 am</time></note>';
console.log(module.exports('', {}));

function validateOptions (options) {
    options = options || {};
    if (!('object' in options) || typeof options.object !== 'boolean') {
        options.object = false;
    }
    if (!('addParent' in options) || typeof options.addParent !== 'boolean') {
        options.addParent = false;
    }
    if (!('trim' in options) || typeof options.trim !== 'boolean') {
        options.trim = true;
    }
    if (!('sanitize' in options) || typeof options.sanitize !== 'boolean') {
        options.sanitize = true;
    }
    if (!('arrayElements' in options) || typeof options.arrayElements !== 'boolean') {
        options.arrayElements = true;
    }
    return options;
}