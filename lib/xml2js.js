var sax = require('sax');
var expat /*= require('node-expat');*/ = { on: function () { }, parse: function () { } };
var common = require('./common');

var options;
var pureJsParser = true;
var currentElement;

function validateOptions(userOptions) {
    options = common.copyOptions(userOptions);
    common.ensureFlagExists('ignoreDeclaration', options);
    common.ensureFlagExists('ignoreInstruction', options);
    common.ensureFlagExists('ignoreAttributes', options);
    common.ensureFlagExists('ignoreText', options);
    common.ensureFlagExists('ignoreComment', options);
    common.ensureFlagExists('ignoreCdata', options);
    common.ensureFlagExists('ignoreDoctype', options);
    common.ensureFlagExists('compact', options);
    common.ensureFlagExists('alwaysArray', options);
    common.ensureFlagExists('alwaysChildren', options);
    common.ensureFlagExists('addParent', options);
    common.ensureFlagExists('trim', options);
    common.ensureFlagExists('nativeType', options);
    common.ensureFlagExists('sanitize', options);
    common.ensureKeyExists('declaration', options);
    common.ensureKeyExists('instruction', options);
    common.ensureKeyExists('attributes', options);
    common.ensureKeyExists('text', options);
    common.ensureKeyExists('comment', options);
    common.ensureKeyExists('cdata', options);
    common.ensureKeyExists('doctype', options);
    common.ensureKeyExists('type', options);
    common.ensureKeyExists('name', options);
    common.ensureKeyExists('elements', options);
    common.ensureKeyExists('parent', options);
    return options;
}

function nativeType(value) {
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

function addField(type, value, options) {
    if (options.compact) {
        if (!currentElement[options[type + 'Key']] && options.alwaysArray) {
            currentElement[options[type + 'Key']] = [];
        }
        if (currentElement[options[type + 'Key']] && !(currentElement[options[type + 'Key']] instanceof Array)) {
            currentElement[options[type + 'Key']] = [currentElement[options[type + 'Key']]];
        }
        if (currentElement[options[type + 'Key']] instanceof Array) {
            currentElement[options[type + 'Key']].push(value);
        } else {
            currentElement[options[type + 'Key']] = value;
        }
    } else {
        if (!currentElement[options.elementsKey]) {
            currentElement[options.elementsKey] = [];
        }
        var key, element = {};
        element[options.typeKey] = type;
        if (type === 'instruction' && typeof value === 'object') {
            for (key in value) {
                if (value.hasOwnProperty(key)) {
                    break;
                }
            }
            element[options.nameKey] = key;
            if (options.instructionHasAttributes) {
                element[options.attributesKey] = value[key][options.attributesKey];
            } else {
                element[options[type + 'Key']] = value[key];
            }
        } else {
            element[options[type + 'Key']] = value;
        }
        if (options.addParent) {
            element[options.parentKey] = currentElement;
        }
        currentElement[options.elementsKey].push(element);
    }
}

function onInstruction(instruction) {
    var attributes = {};
    if (instruction.body && (instruction.name.toLowerCase() === 'xml' || options.instructionHasAttributes)) {
        while (instruction.body) {
            var attribute = instruction.body.match(/([\w:-]+)\s*=\s*"([^"]*)"|'([^']*)'|(\w+)\s*/);
            if (!attribute) {
                break;
            }
            attributes[attribute[1]] = attribute[2];
            instruction.body = instruction.body.slice(attribute[0].length); // advance the string
        }
    }
    if (instruction.name.toLowerCase() === 'xml') {
        if (options.ignoreDeclaration) {
            return;
        }
        currentElement[options.declarationKey] = {};
        if (Object.keys(attributes).length) {
            currentElement[options.declarationKey][options.attributesKey] = attributes;
        }
        if (options.addParent) {
            currentElement[options.declarationKey][options.parentKey] = currentElement;
        }
    } else {
        if (options.ignoreInstruction) {
            return;
        }
        if (options.trim) {
            instruction.body = instruction.body.trim();
        }
        if (options.sanitize) {
            instruction.body = common.sanitize(instruction.body);
        }
        var value = {};
        if (options.instructionHasAttributes && Object.keys(attributes).length) {
            value[instruction.name] = {};
            value[instruction.name][options.attributesKey] = attributes;
        } else {
            value[instruction.name] = instruction.body;
        }
        addField('instruction', value, options);
    }
}

function onStartElement(name, attributes) {
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
        if (!(name in currentElement) && options.alwaysArray) {
            currentElement[name] = [];
        }
        if (currentElement[name] && !(currentElement[name] instanceof Array)) {
            currentElement[name] = [currentElement[name]];
        }
        if (currentElement[name] instanceof Array) {
            currentElement[name].push(element);
        } else {
            currentElement[name] = element;
        }
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
        if (options.alwaysChildren) {
            element[options.elementsKey] = [];
        }
        currentElement[options.elementsKey].push(element);
    }
    // if (options.addParent) {
        element[options.parentKey] = currentElement;
    // }
    currentElement = element;
}

function onText(text) {
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

function onComment(comment) {
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

function onEndElement(name) {
    var parentElement = currentElement[options.parentKey];
    if (!options.addParent) {
        delete currentElement[options.parentKey];
    }
    currentElement = parentElement;
}

function onCdata(cdata) {
    if (options.ignoreCdata) {
        return;
    }
    if (options.trim) {
        cdata = cdata.trim();
    }
    addField('cdata', cdata, options);
}

function onDoctype(doctype) {
    if (options.ignoreDoctype) {
        return;
    }
    doctype = doctype.replace(/^ /, '');
    if (options.trim) {
        doctype = doctype.trim();
    }
    addField('doctype', doctype, options);
}

function onError(error) {
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
        parser.ondoctype = onDoctype;
        parser.onprocessinginstruction = onInstruction;
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
