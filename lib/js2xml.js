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
        xml += (options.spaces && element[options.elementsKey] && element[options.elementsKey].length && (element[options.elementsKey].length > 1 || element[options.elementsKey][0].type !== 'text') ? '\n' + Array(depth + 1).join(options.spaces) : '');
        xml += '</' + element.name + '>';
    } else {
        xml += '/>';
    }
    return xml;
}

function writeElements (elements, options, depth, firstLine) {
    var indent = writeIndentation(options, depth, firstLine);
    return elements.reduce(function (xml, element) {
        switch (element.type) {
            case 'element': return xml + indent + writeElement(element, options, depth);
            case 'comment': return xml + indent + writeComment(element, options);
            case 'cdata': return xml + indent + writeCdata(element, options);
            case 'text': return xml + writeText(element, options);
        }
    }, '');
}

function hasContent (element, options, skipText) {
    var key;
    for (key in element) {
        if (element.hasOwnProperty(key)) {
            switch (key) {
                case options.textKey:
                    if (!skipText) {
                        return true;
                    }
                    break; // skip to next key
                case options.parentKey:
                case options.attributesKey:
                    break; // skip to next key
                case options.cdataKey:
                case options.commentKey:
                case options.declarationKey:
                    return true;
                default:
                    return true;
            }
        }
    }
    return false;
}

function writeElementCompact (element, name, options, depth, indent) {
    var xml = '';
    if (name) {
        xml += '<' + name;
        if (element[options.attributesKey]) {
            xml += writeAttributes(element[options.attributesKey]);
        }
        if (options.fullTagEmptyElement || hasContent(element, options) || element[options.attributesKey] && element[options.attributesKey]['xml:space'] === 'preserve') {
            xml += '>';
        } else {
            xml += '/>';
            return xml;
        }
    }
    xml += writeElementsCompact(element, options, depth + 1, false);
    if (name) {
        xml += (indent ? writeIndentation(options, depth, false) : '') + '</' + name + '>';
    }
    return xml;
}

function writeElementsCompact (element, options, depth, firstLine) {
    var key, xml = '';
    for (key in element) {
        if (element.hasOwnProperty(key)) {
            switch (key) {
                case options.declarationKey: xml += writeDeclaration(element[options.declarationKey], options); break;
                case options.attributesKey: case options.parentKey: break; // skip
                case options.textKey: xml += writeText(element, options); break;
                case options.cdataKey: xml += writeIndentation(options, depth, firstLine) + writeCdata(element, options); break;
                case options.commentKey: xml += writeIndentation(options, depth, firstLine) + writeComment(element, options); break;
                default:
                    if (element[key] instanceof Array) {
                        element[key].forEach(function (el) {
                            xml += writeIndentation(options, depth, firstLine) + writeElementCompact(el, key, options, depth, hasContent(el, options, true));
                        });
                    } else {
                        xml += writeIndentation(options, depth, firstLine) + writeElementCompact(element[key], key, options, depth, hasContent(element[key], options, true));
                    }
            }
            firstLine = firstLine && !xml;
        }
    }
    return xml;
}

module.exports = function (js, options) {
    'use strict';
    options = validateOptions(options);
    var xml = '';
    if (options.compact) {
        xml = writeElementsCompact(js, options, 0, true);
    } else {
        if (js[options.declarationKey]) {
            xml += writeDeclaration(js[options.declarationKey], options);
        }
        if (js[options.elementsKey] && js[options.elementsKey].length) {
            xml += writeElements(js[options.elementsKey], options, 0, !xml);
        }
    }
    return xml;
};