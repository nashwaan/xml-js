/*jslint node:true */

var common = require('./common');

function validateOptions (userOptions) {
    var options = common.copyOptions(userOptions);
    common.ensureFlagExists('ignoreDeclaration', options);
    common.ensureFlagExists('ignoreAttributes', options);
    common.ensureFlagExists('ignoreText', options);
    common.ensureFlagExists('ignoreComment', options);
    common.ensureFlagExists('ignoreCdata', options);
    common.ensureFlagExists('compact', options);
    common.ensureFlagExists('fullTagEmptyElement', options);
    common.ensureSpacesExists(options);
    if (typeof options.spaces === 'number') {
        options.spaces = Array(options.spaces + 1).join(' ');
    }
    common.ensureKeyExists('declaration', options);
    common.ensureKeyExists('attributes', options);
    common.ensureKeyExists('text', options);
    common.ensureKeyExists('comment', options);
    common.ensureKeyExists('cdata', options);
    common.ensureKeyExists('type', options);
    common.ensureKeyExists('name', options);
    common.ensureKeyExists('elements', options);
    return options;
}

function writeIndentation (options, depth, firstLine) {
    return (!firstLine && options.spaces ? '\n' : '') + Array(depth + 1).join(options.spaces);
}

function writeAttributes (attributes) {
    var key, result = '';
    for (key in attributes) {
        if (attributes.hasOwnProperty(key)) {
            result += ' ' + key + '="' + attributes[key] + '"';
        }
    }
    return result;
}

function writeDeclaration (declaration, options) {
    return '<?xml' + writeAttributes(declaration[options.attributesKey]) + '?>';
}

function writeComment (element, options) {
    return options.ignoreComment ? '' : '<!--' + element[options.commentKey] + '-->';
}

function writeCdata (element, options) {
    return options.ignoreCdata ? '' : '<![CDATA[' + element[options.cdataKey] + ']]>';
}

function writeText (element, options) {
    return options.ignoreText ? '' : element[options.textKey].replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function writeElement (element, options, depth) {
    var xml = '';
    xml += '<' + element.name;
    if (element[options.attributesKey]) {
        xml += writeAttributes(element[options.attributesKey]);
    }
    if (options.fullTagEmptyElement || (element[options.elementsKey] && element[options.elementsKey].length) || (element[options.attributesKey] && element[options.attributesKey]['xml:space'] === 'preserve')) {
        xml += '>';
        if (element[options.elementsKey] && element[options.elementsKey].length) {
            xml += writeElements(element[options.elementsKey], options, depth + 1);
        }
        xml += (options.spaces && element[options.elementsKey] && element[options.elementsKey].length && (element[options.elementsKey].length > 1 || element[options.elementsKey][0].type !== 'text') ? '\n' : '') + Array(depth + 1).join(options.spaces);
        xml += '</' + element.name + '>';
    } else {
        xml += '/>';
    }
    return xml;
}

function writeElements (elements, options, depth, firstLine) {
    var sep = writeIndentation(options, depth, firstLine);
    return elements.reduce(function (xml, element) {
        switch (element.type) {
            case 'element': return xml + sep + writeElement(element, options, depth);
            case 'comment': return xml + sep + writeComment(element, options);
            case 'cdata': return xml + sep + writeCdata(element, options);
            case 'text': return xml + writeText(element, options);
        }
    }, '');
}

function writeElementCompact (element, name, options, depth, firstLine) {
    var xml = '', key;
    if (name) {
        xml += writeIndentation(options, depth, firstLine) + '<' + name;
        if (element[options.attributesKey]) {
            xml += writeAttributes(element[options.attributesKey]);
        }
        if (options.fullTagEmptyElement || (xml !== '<' + name && Object.keys(element).length > 1 || xml === '<' + name && Object.keys(element).length) || (element[options.attributesKey] && element[options.attributesKey]['xml:space'] === 'preserve')) {
            xml += '>';
        } else {
            xml += '/>';
            return xml;
        }
    }
    for (key in element) {
        if (element.hasOwnProperty(key)) {
            switch (key) {
                case options.attributesKey: case options.parentKey: break;
                case options.textKey: xml += writeText(element, options); break;
                case options.cdataKey: xml += writeCdata(element, options); break;
                case options.commentKey: xml += writeComment(element, options); break;
                default:
                    if (depth !== 0 || key !== [options.declarationKey]) {
                        xml += writeElementCompact (element[key], key, options, depth + 1);
                    }
            }
        }
    }
    if (name) {
        xml += '</' + name + '>';
    }
    return xml;
}

module.exports = function (js, options) {
    'use strict';
    options = validateOptions(options);
    var xml = '';
    if (js[options.declarationKey]) {
        xml += writeDeclaration(js[options.declarationKey], options);
    }
    if (options.compact) {
        if (xml !== '' && Object.keys(js).length > 1 || xml === '' && Object.keys(js).length) {
            xml += writeElementCompact(js, null, options, 0, !xml);
        }
    } else {
        if (js[options.elementsKey] && js[options.elementsKey].length) {
            xml += writeElements(js[options.elementsKey], options, 0, !xml);
        }
    }
    return xml;
};