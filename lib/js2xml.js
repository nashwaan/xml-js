/*jslint node:true */

var common = require('./common');

function validateOptions (userOptions) {
    var options = common.copyOptions(userOptions);
    common.checkOptionExist('ignoreDeclaration', options);
    common.checkOptionExist('ignoreAttributes', options);
    common.checkOptionExist('ignoreText', options);
    common.checkOptionExist('ignoreComment', options);
    common.checkOptionExist('ignoreCdata', options);
    common.checkOptionExist('fromCompact', options);
    common.checkOptionExist('fullTagEmptyElement', options);
    if (!('spaces' in options) || (typeof options.spaces !== 'number' && typeof options.spaces !== 'string' || isNaN(parseInt(options.spaces, 10)))) {
        options.spaces = 0;
    }
    if (!isNaN(parseInt(options.spaces, 10))) {
        options.spaces = Array(options.spaces + 1).join(' ');
    }
    return options;
}

module.exports = function (js, options) {
    'use strict';
    options = validateOptions(options);
    var xml = '';
    if (js.declaration) {
        xml += writeDeclaration(js.declaration);
    }
    if (js.elements && js.elements.length) {
        xml += writeElements(js.elements, options, 0, !js.declaration);
    }
    return xml;
};

function writeElements (elements, options, depth, firstLine) {
    depth = depth || 0;
    var sep = (!firstLine && options.spaces ? '\n' : '') + Array(depth + 1).join(options.spaces);
    return elements.reduce(function (xml, element) {
        switch (element.type) {
            case 'element': return xml + sep + writeElement(element, options, depth);
            case 'comment': return xml + sep + writeComment(element, options);
            case 'cdata': return xml + sep + writeCdata(element, options);
            case 'text': return xml + writeText(element, options);
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
            xml += writeElements(element.elements, options, depth + 1);
        }
        xml += (options.spaces && element.elements && element.elements.length && (element.elements.length > 1 || element.elements[0].type !== 'text') ? '\n' : '') + Array(depth + 1).join(options.spaces);
        xml += '</' + element.name + '>';
    } else {
        xml += '/>';
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