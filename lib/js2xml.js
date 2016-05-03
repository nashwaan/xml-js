/*jslint node:true */

function validateOptions (options) {
    options = options || {};
    if (!('spaces' in options) || (typeof options.spaces !== 'string' || isNaN(parseInt(options.spaces)))) {
        options.spaces = 0;
    }
    if (!isNaN(parseInt(options.spaces))) {
        options.spaces = Array(options.spaces + 1).join(' ');
    }
    if (!('ignoreComments' in options) || typeof options.ignoreComments !== 'boolean') {
        options.ignoreComments = false;
    }
    if (!('fullTagEmptyElement' in options) || typeof options.fullTagEmptyElement !== 'boolean') {
        options.fullTagEmptyElement = false;
    }
    return options;
}

module.exports = function (js, options) {
    'use strict';
    options = validateOptions(options);
    var xml = '';
    if (js.declaration) {
        xml += writeDeclaration(js.declaration);
        xml += (options.spaces ? '\n' : '');
    }
    if (js.elements && js.elements.length) {
        xml += writeElements(js.elements, options);
    }
    return xml;
};

function writeElements (elements, options, depth) {
    depth = depth || 0;
    var sep = Array(depth + 1).join(options.spaces);
    return elements.reduce(function (xml, element) {
        switch (element.type) {
            case 'element': return xml + sep + writeElement(element, options, depth);
            case 'comment': return xml + sep + writeComment(element.text);
            case 'cdata': return xml + sep + writeCdata(element.text);
            case 'text': return xml + sep + writeText(element.text);
        }
    }, '');
}

function writeElement (element, options, depth) {
    var xml = '';
    xml += '<' + element.name;
    if (element.attributes) {
        xml += writeAttributes(element.attributes);
    }
    if (options.fullTagEmptyElement || (element.elements && element.elements.length) || (element.attributes && element.attributes['xml:space'] === 'preserve')) {
        xml += '>';
        if (element.elements && element.elements.length) {
            xml += (options.spaces ? '\n' : '');
            xml += writeElements(element.elements, options, depth + 1);
        }
        xml += '</' + element.name + '>' + (options.spaces ? '\n' : '');
    } else {
        xml += '/>' + (options.spaces ? '\n' : '');
    }
    return xml;
}

function writeDeclaration (declaration) {
    return '<?xml' + writeAttributes(declaration.attributes) + '?>';
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

function writeComment (comment) {
    return '<!--' + comment + '-->';
}

function writeCdata (cdata) {
    return '<![CDATA[' + cdata + ']]>';
}

function writeText (text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}