/*jslint node:true */
var sax = require('sax');
var expat = require('node-expat');

var options;
var pureJsParser = true;
var currentElement;

function validateOptions (options) {
    options = options || {};
    if (!('nestedObjects' in options) || typeof options.nestedObjects !== 'boolean') {
        options.nestedObjects = false;
    }
    if (!('emptyChildren' in options) || typeof options.emptyChildren !== 'boolean') {
        options.emptyChildren = false;
    }
    if (!('addParent' in options) || typeof options.addParent !== 'boolean') {
        options.addParent = false;
    }
    if (!('trim' in options) || typeof options.trim !== 'boolean') {
        options.trim = false;
    }
    if (!('sanitize' in options) || typeof options.sanitize !== 'boolean') {
        options.sanitize = false;
    }
    return options;
}

module.exports = function(xml, userOptions) {
    
    var parser = pureJsParser ? sax.parser(true, {}) : parser = new expat.Parser('UTF-8');
    var result = {elements: []};
    currentElement = result;
    
    options = validateOptions(userOptions); //console.log(JSON.stringify(options, null, 4));
    
    if (pureJsParser) {
        parser.onopentag = onStartElement;
        parser.ontext = onText;
        parser.oncomment = onComment;
        parser.onclosetag = onEndElement;
        parser.onerror = onError;
        parser.oncdata = onCdata;
        parser.onprocessinginstruction = onDeclaration;
    } else {
        parser.on('startElement', onStartElement);
        parser.on('text', onText);
        parser.on('comment', onComment);
        parser.on('endElement', onEndElement);
        parser.on('error', onError);
        //parser.on('startCdata', onStartCdata);
        //parser.on('endCdata', onEndCdata);
        //parser.on('entityDecl', onEntityDecl);
    }
    
    if (pureJsParser) {
        parser.write(xml).close();
    } else {
        if (!parser.parse(xml)) {
            throw new Error('XML parsing error: ' + parser.getError());
        }
    }
    
    var temp = result.elements;
    delete result.elements;
    result.elements = temp;
    delete result.text;
    
    return result;

};

function onDeclaration(declaration) {
    if (currentElement.declaration) {
        return;
    }
    currentElement.declaration = {};
    while (declaration.body) {
        var attribute = declaration.body.match(/([\w:-]+)\s*=\s*"([^"]*)"|'([^']*)'|(\w+)\s*/);
        if (!attribute) {
            return;
        }
        if (!currentElement.declaration.attributes) {
            currentElement.declaration.attributes = {};
        }
        currentElement.declaration.attributes[attribute[1]] = attribute[2];
        declaration.body = declaration.body.slice(attribute[0].length); // advance the string
    }
    //console.error('result.declaration', result.declaration);
}

function onStartElement(name, attributes) {
    if (typeof name === 'object') {
        attributes = name.attributes;
        name = name.name;
    }
    if (options.nestedObjects) {
        if (!(name in currentElement)) {
            currentElement[name] = {_attributes: [],
                                    _text: '',
                                    _parent: currentElement};
        }
        currentElement = currentElement[name];
        currentElement._attributes.forEach(function (attr) {
            currentElement._attributes.push(attr);
        });
    } else {
        if (!currentElement.elements) {
            currentElement.elements = [];
        }
        currentElement.elements.push({type: 'element',
                                   name: name,
                                   attributes: attributes,
                                   parent: currentElement});
        currentElement = currentElement.elements[currentElement.elements.length - 1];
        if (options.emptyChildren) {
            currentElement.elements = [];
        }
    }
    //console.log('startElement:', name, attributes);
}

function onText(text) {
    //console.log('currentElement:', currentElement);
    if (options.trim) {
        text = text.trim();
    }
    if (options.coerce) {
        text = coerce(text);
    }
    if (options.sanitize) {
        text = sanitize(text);
    }
    if (options.nestedObjects) {
        currentElement._text = (currentElement.text || '') + text;
    } else {
        if (!currentElement.elements) {
            currentElement.elements = [];
        }
        if (options.addParent) {
            currentElement.elements.push({type: 'text',
                                       text: text,
                                       parent: currentElement});
        } else {
            currentElement.elements.push({type: 'text',
                                       text: text});
        }
    }
    //console.log('text for current element name "' + currentElement.name + '"', text);
}

function onComment(comment) {
    if (options.trim) {
        comment = comment.trim();
    }
    if (options.sanitize) {
        comment = sanitize(comment);
    }
    if (options.nestedObjects) {
        currentElement._comment = (currentElement.comment || '') + comment;
    } else {
        if (!currentElement.elements) {
            currentElement.elements = [];
        }
        if (options.addParent) {
            currentElement.elements.push({type: 'comment',
                                       text: comment,
                                       parent: currentElement});
        } else {
            currentElement.elements.push({type: 'comment',
                                       text: comment});
        }
    }
    //console.log('comment', comment);
}

function onEndElement (name) {
    var parentElement = options.nestedObjects ? currentElement._parent : currentElement.parent;
    if (!options.addParent) {
        if (options.nestedObjects) {
            delete currentElement._parent;
        } else {
            delete currentElement.parent;
        }
    }
    currentElement = parentElement;
    //console.log('endElement', name);
}

function onCdata(cdata) {
    if (options.trim) {
        cdata = cdata.trim();
    }
    if (options.sanitize) {
        cdata = sanitize(cdata);
    }
    if (options.nestedObjects) {
        currentElement._cdata = (currentElement.cdata || '') + cdata;
    } else {
        if (!currentElement.elements) {
            currentElement.elements = [];
        }
        if (options.addParent) {
            currentElement.elements.push({type: 'cdata',
                                       text: cdata,
                                       parent: currentElement});
        } else {
            currentElement.elements.push({type: 'cdata',
                                       text: cdata});
        }
    }
    //console.error('cdata', cdata);
}

function onError(error) {
    console.error('error', error);
}

function sanitize(text) {
    text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
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