/*jslint node:true */
var sax = require('sax');
var expat = {};
//var expat = require('node-expat');

var options;
var pureJsParser = true;
var currentElement;

function validateOptions (userOptions) {
    var key, options = {};
    for (key in userOptions) {
        if (userOptions.hasOwnProperty(key)) {
            options[key] = userOptions[key];
        }
    }
    if (!('compact' in options) || typeof options.compact !== 'boolean') {
        options.compact = false;
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
    if (!('nativeType' in options) || typeof options.nativeType !== 'boolean') {
        options.nativeType = false;
    }
    if (!('sanitize' in options) || typeof options.sanitize !== 'boolean') {
        options.sanitize = false;
    }
    if (!('declarationKey' in options) || typeof options.declarationKey !== 'string') {
        options.declarationKey = options.compact ? '_declaration' : 'declaration';
    }
    if (!('attributesKey' in options) || typeof options.attributesKey !== 'string') {
        options.attributesKey = options.compact ? '_attributes' : 'attributes';
    }
    if (!('textKey' in options) || typeof options.textKey !== 'string') {
        options.textKey = options.compact ? '_text' : 'text';
    }
    if (!('commentKey' in options) || typeof options.commentKey !== 'string') {
        options.commentKey = options.compact ? '_comment' : 'comment';
    }
    if (!('cdataKey' in options) || typeof options.cdataKey !== 'string') {
        options.cdataKey = options.compact ? '_cdata' : 'cdata';
    }
    if (!('typeKey' in options) || typeof options.typeKey !== 'string') {
        options.typeKey = options.compact ? '_type' : 'type';
    }
    if (!('nameKey' in options) || typeof options.nameKey !== 'string') {
        options.nameKey = options.compact ? '_name' : 'name';
    }
    if (!('elementsKey' in options) || typeof options.elementsKey !== 'string') {
        options.elementsKey = options.compact ? '_elements' : 'elements';
    }
    if (!('parentKey' in options) || typeof options.parentKey !== 'string') {
        options.parentKey = options.compact ? '_parent' : 'parent';
    }
    return options;
}

module.exports = function(xml, userOptions) {
    
    var parser = pureJsParser ? sax.parser(true, {}) : parser = new expat.Parser('UTF-8');
    var result = {};
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
    
    if (result[options.elementsKey]) {
        var temp = result[options.elementsKey];
        delete result[options.elementsKey];
        result[options.elementsKey] = temp;
        delete result.text;
    }
    
    return result;

};

function onDeclaration(declaration) {
    if (currentElement[options.declarationKey]) {
        return;
    }
    currentElement[options.declarationKey] = {};
    while (declaration.body) {
        var attribute = declaration.body.match(/([\w:-]+)\s*=\s*"([^"]*)"|'([^']*)'|(\w+)\s*/);
        if (!attribute) {
            break;
        }
        if (!currentElement[options.declarationKey][options.attributesKey]) {
            currentElement[options.declarationKey][options.attributesKey] = {};
        }
        currentElement[options.declarationKey][options.attributesKey][attribute[1]] = attribute[2];
        declaration.body = declaration.body.slice(attribute[0].length); // advance the string
    }
    if (options.addParent && options.compact) {
        currentElement[options.declarationKey][options.parentKey] = currentElement;
    }
    //console.error('result[options.declarationKey]', result[options.declarationKey]);
}

function onStartElement(name, attributes) {
    var key;
    if (typeof name === 'object') {
        attributes = name.attributes;
        name = name.name;
    }
    if (options.trim && attributes) {
        for (key in attributes) {
            if (attributes.hasOwnProperty(key)) {
                attributes[key] = attributes[key].trim();
            }
        }
    }
    if (options.compact) {
        if (!(name in currentElement)) {
            currentElement[name] = {};
            if (attributes && Object.keys(attributes).length) {
                currentElement[name][options.attributesKey] = {};
            }
            currentElement[name][options.parentKey] = currentElement;
        }
        for (key in attributes) {
            if (attributes.hasOwnProperty(key)) {
                currentElement[name][options.attributesKey][key] = attributes[key];
            }
        }
        currentElement = currentElement[name];
    } else {
        if (!currentElement[options.elementsKey]) {
            currentElement[options.elementsKey] = [];
        }
        var element = {};
        element[options.typeKey] = 'element';
        element[options.nameKey] = name;
        element[options.attributesKey] = attributes;
        element[options.parentKey] = currentElement;
        if (options.emptyChildren) {
            element[options.elementsKey] = [];
        }
        currentElement[options.elementsKey].push(element);
        currentElement = currentElement[options.elementsKey][currentElement[options.elementsKey].length - 1];
    }
    //console.log('startElement:', name, attributes);
}

function onText(text) {
    //console.log('currentElement:', currentElement);
    if (!text.trim()) {
        return;
    }
    if (options.trim) {
        text = text.trim();
    }
    if (options.nativeType) {
        text = coerce(text);
    }
    if (options.sanitize) {
        text = sanitize(text);
    }
    if (options.compact) {
        currentElement[options.textKey] = (currentElement[options.textKey] ? currentElement[options.textKey] + '\n' : '') + text;
    } else {
        if (!currentElement[options.elementsKey]) {
            currentElement[options.elementsKey] = [];
        }
        var element = {};
        element[options.typeKey] = 'text';
        element[options.textKey] = text;
        if (options.addParent) {
            element[options.parentKey] = currentElement;
        }
        currentElement[options.elementsKey].push(element);
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
    if (options.compact) {
        currentElement[options.commentKey] = (currentElement[options.commentKey] ? currentElement[options.commentKey] + '\n' : '') + comment;
    } else {
        if (!currentElement[options.elementsKey]) {
            currentElement[options.elementsKey] = [];
        }
        var element = {};
        element[options.typeKey] = 'comment';
        element[options.commentKey] = comment;
        if (options.addParent) {
            element[options.parentKey] = currentElement;
        }
        currentElement[options.elementsKey].push(element);
    }
    //console.log('comment', comment);
}

function onEndElement (name) {
    var parentElement = currentElement[options.parentKey];
    if (!options.addParent) {
        delete currentElement[options.parentKey];
    }
    currentElement = parentElement;
    //console.log('endElement', name);
}

function onCdata(cdata) {
    if (options.trim) {
        cdata = cdata.trim();
    }
    if (options.compact) {
        currentElement[options.cdataKey] = (currentElement[options.cdataKey] ? currentElement[options.cdataKey] + '\n' : '') + cdata;
    } else {
        if (!currentElement[options.elementsKey]) {
            currentElement[options.elementsKey] = [];
        }
        var element = {};
        element[options.typeKey] = 'cdata';
        element[options.cdataKey] = cdata;
        if (options.addParent) {
            element[options.parentKey] = currentElement;
        }
        currentElement[options.elementsKey].push(element);
    }
    //console.error('cdata', cdata);
}

function onError(error) {
    console.error('error', error);
}

function sanitize(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function coerce(value) {
    if (value.trim() === '') {
        return value;
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