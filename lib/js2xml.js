var common = require('./common');

function validateOptions(userOptions) {
    var options = common.copyOptions(userOptions);
    common.ensureFlagExists('ignoreDeclaration', options);
    common.ensureFlagExists('ignoreInstruction', options);
    common.ensureFlagExists('ignoreAttributes', options);
    common.ensureFlagExists('ignoreText', options);
    common.ensureFlagExists('ignoreComment', options);
    common.ensureFlagExists('ignoreCdata', options);
    common.ensureFlagExists('ignoreDoctype', options);
    common.ensureFlagExists('compact', options);
    common.ensureFlagExists('indentText', options);
    common.ensureFlagExists('indentCdata', options);
    common.ensureFlagExists('indentInstruction', options);
    common.ensureFlagExists('fullTagEmptyElement', options);
    common.ensureSpacesExists(options);
    if (typeof options.spaces === 'number') {
        options.spaces = Array(options.spaces + 1).join(' ');
    }
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
    return options;
}

function writeIndentation(options, depth, firstLine) {
    return (!firstLine && options.spaces ? '\n' : '') + Array(depth + 1).join(options.spaces);
}

function writeAttributes(attributes, options) {
    if (options.ignoreAttributes) {
        return '';
    }
    var key, result = '';
    for (key in attributes) {
        if (attributes.hasOwnProperty(key)) {
            result += ' ' + key + '="' + attributes[key] + '"';
        }
    }
    return result;
}

function writeDeclaration(declaration, options) {
    return options.ignoreDeclaration ? '' :  '<?xml' + writeAttributes(declaration[options.attributesKey], options) + '?>';
}

function writeInstruction(instruction, options) {
    if (options.ignoreInstruction) {
        return '';
    }
    var key;
    for (key in instruction) {
        if (instruction.hasOwnProperty(key)) {
            break;
        }
    }
    if (typeof instruction[key] === 'object') {
        return '<?' + key + writeAttributes(instruction[key][options.attributesKey], options) + '?>';
    } else {
        return '<?' + key + (instruction[key] ? ' ' + instruction[key] : '') + '?>';
    }
}

function writeComment(comment, options) {
    return options.ignoreComment ? '' : '<!--' + comment + '-->';
}

function writeCdata(cdata, options) {
    return options.ignoreCdata ? '' : '<![CDATA[' + cdata + ']]>';
}

function writeDoctype(doctype, options) {
    return options.ignoreDoctype ? '' : '<!DOCTYPE ' + doctype + '>';
}

function writeText(text, options) {
    return options.ignoreText ? '' : text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function hasContent(element, options) {
    var i;
    if (element.elements && element.elements.length) {
        for (i = 0; i < element.elements.length; ++i) {
            switch (element.elements[i][options.typeKey]) {
                case 'text':
                    if (options.indentText) {
                        return true;
                    }
                    break; // skip to next key
                case 'cdata':
                    if (options.indentCdata) {
                        return true;
                    }
                    break; // skip to next key
                case 'instruction':
                    if (options.indentInstruction) {
                        return true;
                    }
                    break; // skip to next key
                case 'doctype':
                case 'comment':
                case 'element':
                    return true;
                default:
                    return true;
            }
        }
    }
    return false;
}

function writeElement(element, options, depth) {
    var xml = '';
    xml += '<' + element.name;
    if (element[options.attributesKey]) {
        xml += writeAttributes(element[options.attributesKey], options);
    }
    if (options.fullTagEmptyElement || (element[options.elementsKey] && element[options.elementsKey].length) || (element[options.attributesKey] && element[options.attributesKey]['xml:space'] === 'preserve')) {
        xml += '>';
        if (element[options.elementsKey] && element[options.elementsKey].length) {
            xml += writeElements(element[options.elementsKey], options, depth + 1);
        }
        xml += options.spaces && hasContent(element, options) ? '\n' + Array(depth + 1).join(options.spaces) : '';
        xml += '</' + element.name + '>';
    } else {
        xml += '/>';
    }
    return xml;
}

function writeElements(elements, options, depth, firstLine) {
    return elements.reduce(function (xml, element) {
        var indent = writeIndentation(options, depth, firstLine && !xml);
        switch (element.type) {
            case 'element': return xml + indent + writeElement(element, options, depth);
            case 'comment': return xml + indent + writeComment(element[options.commentKey], options);
            case 'doctype': return xml + indent + writeDoctype(element[options.doctypeKey], options);
            case 'cdata': return xml + (options.indentCdata ? indent : '') + writeCdata(element[options.cdataKey], options);
            case 'text': return xml + (options.indentText ? indent : '') + writeText(element[options.textKey], options);
            case 'instruction':
                var instruction = {};
                instruction[element[options.nameKey]] = element[options.attributesKey] ? element : element[options.instructionKey];
                return xml + (options.indentInstruction ? indent : '') + writeInstruction(instruction, options);
        }
    }, '');
}

function hasContentCompact(element, options, anyContent) {
    var key;
    for (key in element) {
        if (element.hasOwnProperty(key)) {
            switch (key) {
                case options.parentKey:
                case options.attributesKey:
                    break; // skip to next key
                case options.textKey:
                    if (options.indentText || anyContent) {
                        return true;
                    }
                    break; // skip to next key
                case options.cdataKey:
                    if (options.indentCdata || anyContent) {
                        return true;
                    }
                    break; // skip to next key
                case options.instructionKey:
                    if (options.indentInstruction || anyContent) {
                        return true;
                    }
                    break; // skip to next key
                case options.doctypeKey:
                case options.commentKey:
                    return true;
                default:
                    return true;
            }
        }
    }
    return false;
}

function writeElementCompact(element, name, options, depth, indent) {
    var xml = '';
    if (name) {
        xml += '<' + name;
        if (element[options.attributesKey]) {
            xml += writeAttributes(element[options.attributesKey], options);
        }
        if (options.fullTagEmptyElement || hasContentCompact(element, options, true) || element[options.attributesKey] && element[options.attributesKey]['xml:space'] === 'preserve') {
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

function writeElementsCompact(element, options, depth, firstLine) {
    var i, key, nodes, xml = '';
    for (key in element) {
        if (element.hasOwnProperty(key)) {
            nodes = element[key] instanceof Array ? element[key] : [element[key]];
            for (i = 0; i < nodes.length; ++i) {
                switch (key) {
                    case options.declarationKey: xml += writeDeclaration(nodes[i], options); break;
                    case options.instructionKey: xml += (options.indentInstruction ? writeIndentation(options, depth, firstLine) : '') + writeInstruction(nodes[i], options); break;
                    case options.attributesKey: case options.parentKey: break; // skip
                    case options.textKey: xml += (options.indentText ? writeIndentation(options, depth, firstLine) : '') + writeText(nodes[i], options); break;
                    case options.cdataKey: xml += (options.indentCdata ? writeIndentation(options, depth, firstLine) : '') + writeCdata(nodes[i], options); break;
                    case options.doctypeKey: xml += writeIndentation(options, depth, firstLine) + writeDoctype(nodes[i], options); break;
                    case options.commentKey: xml += writeIndentation(options, depth, firstLine) + writeComment(nodes[i], options); break;
                    default: xml += writeIndentation(options, depth, firstLine) + writeElementCompact(nodes[i], key, options, depth, hasContentCompact(nodes[i], options));
                }
                firstLine = firstLine && !xml;
            }
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
