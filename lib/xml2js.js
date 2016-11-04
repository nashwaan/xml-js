var sax = require('sax');
var expat /*= require('node-expat');*/ = {on: function () {}, parse: function () {}};
var common = require('./common');

var options;
var pureJsParser = 1; //true;
var currentElement;

function validateOptions (userOptions) {
    options = common.copyOptions(userOptions);
    common.ensureFlagExists('ignoreDeclaration', options);
    common.ensureFlagExists('ignoreAttributes', options);
    common.ensureFlagExists('ignoreText', options);
    common.ensureFlagExists('ignoreComment', options);
    common.ensureFlagExists('ignoreCdata', options);
    common.ensureFlagExists('compact', options);
    common.ensureFlagExists('alwaysChildren', options);
    common.ensureFlagExists('addParent', options);
    common.ensureFlagExists('trim', options);
    common.ensureFlagExists('nativeType', options);
    common.ensureFlagExists('sanitize', options);
    common.ensureKeyExists('declaration', options);
    common.ensureKeyExists('attributes', options);
    common.ensureKeyExists('text', options);
    common.ensureKeyExists('comment', options);
    common.ensureKeyExists('cdata', options);
    common.ensureKeyExists('type', options);
    common.ensureKeyExists('name', options);
    common.ensureKeyExists('elements', options);
    common.ensureKeyExists('parent', options);
    return options;
}

function nativeType (value) {
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

function addField (type, value, options) {
    if (options.compact) {
        currentElement[options[type + 'Key']] = (currentElement[options[type + 'Key']] ? currentElement[options[type + 'Key']] + '\n' : '') + value;
    } else {
        if (!currentElement[options.elementsKey]) {
            currentElement[options.elementsKey] = [];
        }
        var element = {};
        element[options.typeKey] = type;
        element[options[type + 'Key']] = value;
        if (options.addParent) {
            element[options.parentKey] = currentElement;
        }
        currentElement[options.elementsKey].push(element);
    }
}

function onDeclaration (declaration) {
    if (options.ignoreDeclaration) {
        return;
    }
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
    if (options.addParent) {
        currentElement[options.declarationKey][options.parentKey] = currentElement;
    }
}

function onStartElement (name, attributes) {
    var key, element;
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
        element = {};
        if (!options.ignoreAttributes && attributes && Object.keys(attributes).length) {
            element[options.attributesKey] = {};
            for (key in attributes) {
                if (attributes.hasOwnProperty(key)) {
                    element[options.attributesKey][key] = attributes[key];
                }
            }
        }
        element[options.parentKey] = currentElement;
        if (!(name in currentElement)) {
            currentElement[name] = element;
        } else {
            if (!(currentElement[name] instanceof Array)) {
                currentElement[name] = [currentElement[name]];
            }
            currentElement[name].push(element);
        }
        currentElement = element;
    } else {
        if (!currentElement[options.elementsKey]) {
            currentElement[options.elementsKey] = [];
        }
        element = {};
        element[options.typeKey] = 'element';
        element[options.nameKey] = name;
        if (!options.ignoreAttributes && attributes && Object.keys(attributes).length) {
            element[options.attributesKey] = attributes;
        }
        element[options.parentKey] = currentElement;
        if (options.alwaysChildren) {
            element[options.elementsKey] = [];
        }
        currentElement[options.elementsKey].push(element);
        currentElement = element;
    }
}

function onText (text) {
    //console.log('currentElement:', currentElement);
    if (options.ignoreText) {
        return;
    }
    if (!text.trim()) {
        return;
    }
    if (options.trim) {
        text = text.trim();
    }
    if (options.nativeType) {
        text = nativeType(text);
    }
    if (options.sanitize) {
        text = common.sanitize(text);
    }
    addField('text', text, options);
}

function onComment (comment) {
    if (options.ignoreComment) {
        return;
    }
    if (options.trim) {
        comment = comment.trim();
    }
    if (options.sanitize) {
        comment = common.sanitize(comment);
    }
    addField('comment', comment, options);
}

function onEndElement (name) {
    var parentElement = currentElement[options.parentKey];
    if (!options.addParent) {
        delete currentElement[options.parentKey];
    }
    currentElement = parentElement;
}

function onCdata (cdata) {
    if (options.ignoreCdata) {
        return;
    }
    if (options.trim) {
        cdata = cdata.trim();
    }
    addField('cdata', cdata, options);
}

function onError (error) {
    error.note = error; //console.error(error);
}

module.exports = function (xml, userOptions) {
    
    var parser = pureJsParser ? sax.parser(true, {}) : parser = new expat.Parser('UTF-8');
    var result = {};
    currentElement = result;
    
    options = validateOptions(userOptions);
    
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