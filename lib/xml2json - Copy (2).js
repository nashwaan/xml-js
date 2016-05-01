/*jslint node:true */
var sax = require('sax');
var expat = require('node-expat');
var sanitizer = require('./sanitize.js');



module.exports = function(xml, options) {
    
    var pureJsParser = true;
    var result = {children: []};
    var currentElement = result;
    var parser = pureJsParser ? sax.createStream(true, {}) : parser = new expat.Parser('UTF-8');
    //var parser = pureJsParser ? sax.parser(true, {}) : parser = new expat.Parser('UTF-8');
    
    options = validateOptions(options);
    
    parser.on('opentagstart', function (node) {
        console.log('opentagstart:---------------', node);
    });
    
    parser.on('opentag', function (node) {
        console.log('opentag:---------------', node);
    });

    parser.on('text', function (text) {
        console.log('text', text);
    });

    parser.on('closetag', function (tag) {
        console.log('closetag', tag);
    });

    parser.on('startCdata', function () {
        
    });
    
    parser.on('endCdata', function () {
        
    });
    
    parser.on('entityDecl', function (entityName, isParameterEntity, value, base, systemId, publicId, notationName) {
        console.log('entityDecl: ', entityName, isParameterEntity, value, base, systemId, publicId, notationName);
    });

    /*parser.on(pureJsParser ? 'startElement' : 'startElement', function (name, attrs) {
        if (options.arrayElements) {
            currentElement.children.push({name: name, attrs: attrs, text: '', children: [], parent: currentElement});
            currentElement = currentElement.children[currentElement.children.length - 1];
        } else {
            if (!(name in currentElement)) {
                currentElement[name] = {_attrs: [], _text: '', _parent: currentElement};
            }
            currentElement = currentElement[name];
            currentElement._attrs.forEach(function (attr) {
                currentElement._attrs.push(attr);
            });
        }
        console.log('startElement:', name, attrs);
    });*/
    
    parser.on('text', function (text) {
        if (options.trim) {
            text = text.trim();
        }
        if (options.arrayElements) {
            currentElement.text += text;
        } else {
            currentElement._text += text;
        }
        //console.log('text for current element name "' + currentElement.name + '"', text);
    });
    
    parser.on('comment', function (comment) {
        if (options.trim) {
            comment = comment.trim();
        }
        if (options.arrayElements) {
            currentElement.comment += comment;
        } else {
            currentElement._comment += comment;
        }
    });
    
    parser.on('endElement', function (name) {
        var parentElement = currentElement.parent;
        if (!options.addParent) {
            delete currentElement.parent;
        }
        currentElement = parentElement;
        console.log('endElement', name);
    });
    
    parser.on('error', function (error) {
        console.error('error', error);
    });
    
    if (pureJsParser) {
        require('fs').createReadStream('test/fixtures/note.xml').pipe(parser);
        console.log('***********', xml);
        var stream = new require('stream').Readable();
        stream.push(xml); stream.push(null);
        stream.pipe(parser);
        //parser.write(xml).close();
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

function coerce(value, key) {
    if (!options.coerce || value.trim() === '') {
        return value;
    }

    if (typeof options.coerce[key] === 'function') {
        return options.coerce[key](value);
    }

    var nValue = Number(value);
    if (!isNaN(nValue)) {
        return nValue;
    }

    var bValue = value.toLowerCase();
    if (bValue === 'true') {
        return true;
    } else if (bValue === 'false') {
        return false;
    }

    return value;
}