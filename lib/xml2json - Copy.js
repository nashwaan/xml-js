/*jslint node:true */
var expat = require('node-expat');
var sanitizer = require('./sanitize.js');

var options; 
var obj = {};
var currentObject = {};
var ancestors = [];
var currentElementName = null;

module.exports = function(xml, userOptions) {

    options = validateOptions(userOptions);
    
    var parser = new expat.Parser('UTF-8');
    parser.on('startElement', startElement);
    parser.on('text', text);
    parser.on('endElement', endElement);

    if (!parser.parse(xml)) {
        throw new Error('XML parsing error: ' + parser.getError());
    }

    if (options.object) {
        return obj;
    } else {
        return JSON.stringify(obj).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
    }
};

function validateOptions (options) {
    options = options || {};
    if (!('object' in options) || typeof options.object !== 'boolean') {
        options.object = false;
    }
    if (!('addParent' in options) || typeof options.addParent !== 'boolean') {
        options.addParent = false;
    }
    if (!('trim' in options) || typeof options.trim !== 'boolean') {
        options.trim = true;
    }
    if (!('sanitize' in options) || typeof options.sanitize !== 'boolean') {
        options.sanitize = true;
    }
    return options;
}

function startElement(name, attrs) {
    currentElementName = name;
    if(options.coerce) {
        // Looping here instead of making coerce generic as object walk is unnecessary
        for(var key in attrs) {
            attrs[key] = coerce(attrs[key], key);
        }
    }

    if (!(name in currentObject)) {
        if(options.arrayNotation) {
            currentObject[name] = [attrs];
        } else {
            currentObject[name] = attrs;
        }
    } else if (!(currentObject[name] instanceof Array)) {
        // Put the existing object in an array.
        var newArray = [currentObject[name]];
        // Add the new object to the array.
        newArray.push(attrs);
        // Point to the new array.
        currentObject[name] = newArray;
    } else {
        // An array already exists, push the attributes on to it.
        currentObject[name].push(attrs);
    }

    // Store the current (old) parent.
    ancestors.push(currentObject);

    // We are now working with this object, so it becomes the current parent.
    if (currentObject[name] instanceof Array) {
        // If it is an array, get the last element of the array.
        currentObject = currentObject[name][currentObject[name].length - 1];
    } else {
        // Otherwise, use the object itself.
        currentObject = currentObject[name];
    }
}

function text(data) {
    currentObject.$t = (currentObject.$t || '') + data;
}

function endElement(name) {
    if (currentObject.$t) {
        if (options.trim) {
            currentObject.$t = currentObject.$t.trim();
        }

        if (options.sanitize) {
            currentObject.$t = sanitizer.sanitize(currentObject.$t);
        }

        currentObject.$t = coerce(currentObject.$t,name);
    }

    if (currentElementName !== name) {
        delete currentObject.$t;
    }
    // This should check to make sure that the name we're ending
    // matches the name we started on.
    var ancestor = ancestors.pop();
    if (!options.reversible) {
        if (('$t' in currentObject) && (Object.keys(currentObject).length === 1)) {
            if (ancestor[name] instanceof Array) {
                ancestor[name].push(ancestor[name].pop().$t);
            } else {
                ancestor[name] = currentObject.$t;
            }
        }
    }

    currentObject = ancestor;
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