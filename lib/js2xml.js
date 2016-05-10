/*jslint node:true */

function validateOptions (userOptions) {
    var key, options = {};
    for (key in userOptions) {
        if (userOptions.hasOwnProperty(key)) {
            options[key] = userOptions[key];
        }
    }
    if (!('spaces' in options) || (typeof options.spaces !== 'string' || isNaN(parseInt(options.spaces)))) {
        options.spaces = 0;
    }
    if (!isNaN(parseInt(options.spaces))) {
        options.spaces = Array(options.spaces + 1).join(' ');
    }
    if (!('ignoreText' in options) || typeof options.ignoreText !== 'boolean') {
        options.ignoreText = false;
    }
    if (!('ignoreComment' in options) || typeof options.ignoreComment !== 'boolean') {
        options.ignoreComment = false;
    }
    if (!('ignoreCdata' in options) || typeof options.ignoreCdata !== 'boolean') {
        options.ignoreCdata = false;
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
            case 'comment': return xml + sep + writeComment(element, options);
            case 'cdata': return xml + sep + writeCdata(element, options);
            case 'text': return xml + sep + writeText(element, options);
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

function writeComment (element, options) {
    return options.ignoreComment ? '' : '<!--' + element.comment + '-->';
}

function writeCdata (element, options) {
    return options.ignoreCdata ? '' : '<![CDATA[' + element.cdata + ']]>';
}

function writeText (element, options) {
    return options.ignoreText ? '' : element.text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}