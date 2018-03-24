(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process){
module.exports = {

  getCommandLineHelp: function (command, requiredArgs, optionalArgs) {
    var reqArgs = requiredArgs.reduce(function (res, arg) {return res + ' <' + arg.arg + '>';}, '');
    var output = 'Usage: ' + command + reqArgs + ' [options]\n';
    requiredArgs.forEach(function (argument) {
      output += '  <' + argument.arg + '>' + Array(20 - argument.arg.length).join(' ') + argument.desc + '\n';
    });
    output += '\nOptions:\n';
    optionalArgs.forEach(function (argument) {
      output += '  --' + argument.arg + Array(20 - argument.arg.length).join(' ') + argument.desc + '\n';
    });
    return output;
  },

  mapCommandLineArgs: function (requiredArgs, optionalArgs) {
    var options = {}, r, o, a = 2;
    for (r = 0; r < requiredArgs.length; r += 1) {
      if (a < process.argv.length && process.argv[a].substr(0, 1) !== '-' && process.argv[a] !== 'JASMINE_CONFIG_PATH=./jasmine.json') {
        options[requiredArgs[r].option] = process.argv[a++];
      } else {
        break;
      }
    }
    for (; a < process.argv.length; a += 1) {
      for (o = 0; o < optionalArgs.length; o += 1) {
        if (optionalArgs[o].alias === process.argv[a].slice(1) || optionalArgs[o].arg === process.argv[a].slice(2)) {
          break;
        }
      }
      if (o < optionalArgs.length) {
        switch (optionalArgs[o].type) {
        case 'file': case 'string': case 'number':
          if (a + 1 < process.argv.length) {
            a += 1;
            options[optionalArgs[o].option] = (optionalArgs[o].type === 'number' ? Number(process.argv[a]) : process.argv[a]);
          }
          break;
        case 'flag':
          options[optionalArgs[o].option] = true; break;
        }
      }
    }
    return options;
  }

};

}).call(this,require('_process'))
},{"_process":21}],2:[function(require,module,exports){
module.exports = {

  isArray: function(value) {
    if (Array.isArray) {
      return Array.isArray(value);
    }
    // fallback for older browsers like  IE 8
    return Object.prototype.toString.call( value ) === '[object Array]';
  }

};

},{}],3:[function(require,module,exports){
/*jslint node:true */

var xml2js = require('./xml2js');
var xml2json = require('./xml2json');
var js2xml = require('./js2xml');
var json2xml = require('./json2xml');

module.exports = {
  xml2js: xml2js,
  xml2json: xml2json,
  js2xml: js2xml,
  json2xml: json2xml
};

},{"./js2xml":4,"./json2xml":5,"./xml2js":7,"./xml2json":8}],4:[function(require,module,exports){
var helper = require('./options-helper');
var isArray = require('./array-helper').isArray;

var currentElement, currentElementName;

function validateOptions(userOptions) {
  var options = helper.copyOptions(userOptions);
  helper.ensureFlagExists('ignoreDeclaration', options);
  helper.ensureFlagExists('ignoreInstruction', options);
  helper.ensureFlagExists('ignoreAttributes', options);
  helper.ensureFlagExists('ignoreText', options);
  helper.ensureFlagExists('ignoreComment', options);
  helper.ensureFlagExists('ignoreCdata', options);
  helper.ensureFlagExists('ignoreDoctype', options);
  helper.ensureFlagExists('compact', options);
  helper.ensureFlagExists('indentText', options);
  helper.ensureFlagExists('indentCdata', options);
  helper.ensureFlagExists('indentAttributes', options);
  helper.ensureFlagExists('indentInstruction', options);
  helper.ensureFlagExists('fullTagEmptyElement', options);
  helper.ensureFlagExists('noQuotesForNativeAttributes', options);
  helper.ensureSpacesExists(options);
  if (typeof options.spaces === 'number') {
    options.spaces = Array(options.spaces + 1).join(' ');
  }
  helper.ensureKeyExists('declaration', options);
  helper.ensureKeyExists('instruction', options);
  helper.ensureKeyExists('attributes', options);
  helper.ensureKeyExists('text', options);
  helper.ensureKeyExists('comment', options);
  helper.ensureKeyExists('cdata', options);
  helper.ensureKeyExists('doctype', options);
  helper.ensureKeyExists('type', options);
  helper.ensureKeyExists('name', options);
  helper.ensureKeyExists('elements', options);
  helper.checkFnExists('doctype', options);
  helper.checkFnExists('instruction', options);
  helper.checkFnExists('cdata', options);
  helper.checkFnExists('comment', options);
  helper.checkFnExists('text', options);
  helper.checkFnExists('instructionName', options);
  helper.checkFnExists('elementName', options);
  helper.checkFnExists('attributeName', options);
  helper.checkFnExists('attributeValue', options);
  helper.checkFnExists('attributes', options);
  helper.checkFnExists('fullTagEmptyElement', options);
  return options;
}

function writeIndentation(options, depth, firstLine) {
  return (!firstLine && options.spaces ? '\n' : '') + Array(depth + 1).join(options.spaces);
}

function writeAttributes(attributes, options, depth) {
  if (options.ignoreAttributes) {
    return '';
  }
  if ('attributesFn' in options) {
    attributes = options.attributesFn(attributes, currentElementName, currentElement);
  }
  var key, attr, attrName, quote, result = '';
  for (key in attributes) {
    if (attributes.hasOwnProperty(key)) {
      quote = options.noQuotesForNativeAttributes && typeof attributes[key] !== 'string' ? '' : '"';
      attr = '' + attributes[key]; // ensure number and boolean are converted to String
      attr = attr.replace(/"/g, '&quot;');
      attrName = 'attributeNameFn' in options ? options.attributeNameFn(key, attr, currentElementName, currentElement) : key;
      result += (options.spaces && options.indentAttributes? writeIndentation(options, depth+1, false) : ' ');
      result += attrName + '=' + quote + ('attributeValueFn' in options ? options.attributeValueFn(attr, key, currentElementName, currentElement) : attr) + quote;
    }
  }
  if (attributes && Object.keys(attributes).length && options.spaces && options.indentAttributes) {
    result += writeIndentation(options, depth, false);
  }
  return result;
}

function writeDeclaration(declaration, options, depth) {
  currentElement = declaration;
  currentElementName = 'xml';
  return options.ignoreDeclaration ? '' :  '<?' + 'xml' + writeAttributes(declaration[options.attributesKey], options, depth) + '?>';
}

function writeInstruction(instruction, options, depth) {
  if (options.ignoreInstruction) {
    return '';
  }
  var key;
  for (key in instruction) {
    if (instruction.hasOwnProperty(key)) {
      break;
    }
  }
  var instructionName = 'instructionNameFn' in options ? options.instructionNameFn(key, instruction[key], currentElementName, currentElement) : key;
  if (typeof instruction[key] === 'object') {
    currentElement = instruction;
    currentElementName = instructionName;
    return '<?' + instructionName + writeAttributes(instruction[key][options.attributesKey], options, depth) + '?>';
  } else {
    var instructionValue = instruction[key] ? instruction[key] : '';
    if ('instructionFn' in options) instructionValue = options.instructionFn(instructionValue, key, currentElementName, currentElement);
    return '<?' + instructionName + (instructionValue ? ' ' + instructionValue : '') + '?>';
  }
}

function writeComment(comment, options) {
  return options.ignoreComment ? '' : '<!--' + ('commentFn' in options ? options.commentFn(comment, currentElementName, currentElement) : comment) + '-->';
}

function writeCdata(cdata, options) {
  return options.ignoreCdata ? '' : '<![CDATA[' + ('cdataFn' in options ? options.cdataFn(cdata, currentElementName, currentElement) : cdata) + ']]>';
}

function writeDoctype(doctype, options) {
  return options.ignoreDoctype ? '' : '<!DOCTYPE ' + ('doctypeFn' in options ? options.doctypeFn(doctype, currentElementName, currentElement) : doctype) + '>';
}

function writeText(text, options) {
  if (options.ignoreText) return '';
  text = '' + text; // ensure Number and Boolean are converted to String
  text = text.replace(/&amp;/g, '&'); // desanitize to avoid double sanitization
  text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return 'textFn' in options ? options.textFn(text, currentElementName, currentElement) : text;
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
  currentElement = element;
  currentElementName = element.name;
  var xml = '', elementName = 'elementNameFn' in options ? options.elementNameFn(element.name, element) : element.name;
  xml += '<' + elementName;
  if (element[options.attributesKey]) {
    xml += writeAttributes(element[options.attributesKey], options, depth);
  }
  var withClosingTag = element[options.elementsKey] && element[options.elementsKey].length || element[options.attributesKey] && element[options.attributesKey]['xml:space'] === 'preserve';
  if (!withClosingTag) {
    if ('fullTagEmptyElementFn' in options) {
      withClosingTag = options.fullTagEmptyElementFn(element.name, element);
    } else {
      withClosingTag = options.fullTagEmptyElement;
    }
  }
  if (withClosingTag) {
    xml += '>';
    if (element[options.elementsKey] && element[options.elementsKey].length) {
      xml += writeElements(element[options.elementsKey], options, depth + 1);
      currentElement = element;
      currentElementName = element.name;
    }
    xml += options.spaces && hasContent(element, options) ? '\n' + Array(depth + 1).join(options.spaces) : '';
    xml += '</' + elementName + '>';
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
      return xml + (options.indentInstruction ? indent : '') + writeInstruction(instruction, options, depth);
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
  currentElement = element;
  currentElementName = name;
  var elementName = 'elementNameFn' in options ? options.elementNameFn(name, element) : name;
  if (typeof element === 'undefined' || element === null) {
    return 'fullTagEmptyElementFn' in options && options.fullTagEmptyElementFn(name, element) || options.fullTagEmptyElement ? '<' + elementName + '></' + elementName + '>' : '<' + elementName + '/>';
  }
  var xml = '';
  if (name) {
    xml += '<' + elementName;
    if (typeof element !== 'object') {
      xml += '>' + writeText(element,options) + '</' + elementName + '>';
      return xml;
    }
    if (element[options.attributesKey]) {
      xml += writeAttributes(element[options.attributesKey], options, depth);
    }
    var withClosingTag = hasContentCompact(element, options, true) || element[options.attributesKey] && element[options.attributesKey]['xml:space'] === 'preserve';
    if (!withClosingTag) {
      if ('fullTagEmptyElementFn' in options) {
        withClosingTag = options.fullTagEmptyElementFn(name, element);
      } else {
        withClosingTag = options.fullTagEmptyElement;
      }
    }
    if (withClosingTag) {
      xml += '>';
    } else {
      xml += '/>';
      return xml;
    }
  }
  xml += writeElementsCompact(element, options, depth + 1, false);
  currentElement = element;
  currentElementName = name;
  if (name) {
    xml += (indent ? writeIndentation(options, depth, false) : '') + '</' + elementName + '>';
  }
  return xml;
}

function writeElementsCompact(element, options, depth, firstLine) {
  var i, key, nodes, xml = '';
  for (key in element) {
    if (element.hasOwnProperty(key)) {
      nodes = isArray(element[key]) ? element[key] : [element[key]];
      for (i = 0; i < nodes.length; ++i) {
        switch (key) {
        case options.declarationKey: xml += writeDeclaration(nodes[i], options, depth); break;
        case options.instructionKey: xml += (options.indentInstruction ? writeIndentation(options, depth, firstLine) : '') + writeInstruction(nodes[i], options, depth); break;
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
  options = validateOptions(options);
  var xml = '';
  currentElement = js;
  currentElementName = '_root_';
  if (options.compact) {
    xml = writeElementsCompact(js, options, 0, true);
  } else {
    if (js[options.declarationKey]) {
      xml += writeDeclaration(js[options.declarationKey], options, 0);
    }
    if (js[options.elementsKey] && js[options.elementsKey].length) {
      xml += writeElements(js[options.elementsKey], options, 0, !xml);
    }
  }
  return xml;
};

},{"./array-helper":2,"./options-helper":6}],5:[function(require,module,exports){
(function (Buffer){
var js2xml = require('./js2xml.js');

module.exports = function (json, options) {
  if (json instanceof Buffer) {
    json = json.toString();
  }
  var js = null;
  if (typeof (json) === 'string') {
    try {
      js = JSON.parse(json);
    } catch (e) {
      throw new Error('The JSON structure is invalid');
    }
  } else {
    js = json;
  }
  return js2xml(js, options);
};

}).call(this,require("buffer").Buffer)
},{"./js2xml.js":4,"buffer":11}],6:[function(require,module,exports){
var isArray = require('./array-helper').isArray;

module.exports = {

  copyOptions: function (options) {
    var key, copy = {};
    for (key in options) {
      if (options.hasOwnProperty(key)) {
        copy[key] = options[key];
      }
    }
    return copy;
  },

  ensureFlagExists: function (item, options) {
    if (!(item in options) || typeof options[item] !== 'boolean') {
      options[item] = false;
    }
  },

  ensureSpacesExists: function (options) {
    if (!('spaces' in options) || (typeof options.spaces !== 'number' && typeof options.spaces !== 'string')) {
      options.spaces = 0;
    }
  },

  ensureAlwaysArrayExists: function (options) {
    if (!('alwaysArray' in options) || (typeof options.alwaysArray !== 'boolean' && !isArray(options.alwaysArray))) {
      options.alwaysArray = false;
    }
  },

  ensureKeyExists: function (key, options) {
    if (!(key + 'Key' in options) || typeof options[key + 'Key'] !== 'string') {
      options[key + 'Key'] = options.compact ? '_' + key : key;
    }
  },

  checkFnExists: function (key, options) {
    return key + 'Fn' in options;
  }

};

},{"./array-helper":2}],7:[function(require,module,exports){
var sax = require('sax');
var expat /*= require('node-expat');*/ = { on: function () { }, parse: function () { } };
var helper = require('./options-helper');
var isArray = require('./array-helper').isArray;

var options;
var pureJsParser = true;
var currentElement;

function validateOptions(userOptions) {
  options = helper.copyOptions(userOptions);
  helper.ensureFlagExists('ignoreDeclaration', options);
  helper.ensureFlagExists('ignoreInstruction', options);
  helper.ensureFlagExists('ignoreAttributes', options);
  helper.ensureFlagExists('ignoreText', options);
  helper.ensureFlagExists('ignoreComment', options);
  helper.ensureFlagExists('ignoreCdata', options);
  helper.ensureFlagExists('ignoreDoctype', options);
  helper.ensureFlagExists('compact', options);
  helper.ensureFlagExists('alwaysChildren', options);
  helper.ensureFlagExists('addParent', options);
  helper.ensureFlagExists('trim', options);
  helper.ensureFlagExists('nativeType', options);
  helper.ensureFlagExists('sanitize', options);
  helper.ensureFlagExists('instructionHasAttributes', options);
  helper.ensureFlagExists('captureSpacesBetweenElements', options);
  helper.ensureAlwaysArrayExists(options);
  helper.ensureKeyExists('declaration', options);
  helper.ensureKeyExists('instruction', options);
  helper.ensureKeyExists('attributes', options);
  helper.ensureKeyExists('text', options);
  helper.ensureKeyExists('comment', options);
  helper.ensureKeyExists('cdata', options);
  helper.ensureKeyExists('doctype', options);
  helper.ensureKeyExists('type', options);
  helper.ensureKeyExists('name', options);
  helper.ensureKeyExists('elements', options);
  helper.ensureKeyExists('parent', options);
  helper.checkFnExists('doctype', options);
  helper.checkFnExists('instruction', options);
  helper.checkFnExists('cdata', options);
  helper.checkFnExists('comment', options);
  helper.checkFnExists('text', options);
  helper.checkFnExists('instructionName', options);
  helper.checkFnExists('elementName', options);
  helper.checkFnExists('attributeName', options);
  helper.checkFnExists('attributeValue', options);
  helper.checkFnExists('attributes', options);
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

function addField(type, value) {
  var key;
  if (options.compact) {
    if (
      !currentElement[options[type + 'Key']] &&
      (isArray(options.alwaysArray) ? options.alwaysArray.indexOf(options[type + 'Key']) !== -1 : options.alwaysArray)
    ) {
      currentElement[options[type + 'Key']] = [];
    }
    if (currentElement[options[type + 'Key']] && !isArray(currentElement[options[type + 'Key']])) {
      currentElement[options[type + 'Key']] = [currentElement[options[type + 'Key']]];
    }
    if (type + 'Fn' in options && typeof value === 'string') {
      value = options[type + 'Fn'](value, currentElement);
    }
    if (type === 'instruction' && ('instructionFn' in options || 'instructionNameFn' in options)) {
      for (key in value) {
        if (value.hasOwnProperty(key)) {
          if ('instructionFn' in options) {
            value[key] = options.instructionFn(value[key], key, currentElement);
          } else {
            var temp = value[key];
            delete value[key];
            value[options.instructionNameFn(key, temp, currentElement)] = temp;
          }
        }
      }
    }
    if (isArray(currentElement[options[type + 'Key']])) {
      currentElement[options[type + 'Key']].push(value);
    } else {
      currentElement[options[type + 'Key']] = value;
    }
  } else {
    if (!currentElement[options.elementsKey]) {
      currentElement[options.elementsKey] = [];
    }
    var element = {};
    element[options.typeKey] = type;
    if (type === 'instruction') {
      for (key in value) {
        if (value.hasOwnProperty(key)) {
          break;
        }
      }
      element[options.nameKey] = 'instructionNameFn' in options ? options.instructionNameFn(key, value, currentElement) : key;
      if (options.instructionHasAttributes) {
        element[options.attributesKey] = value[key][options.attributesKey];
        if ('instructionFn' in options) {
          element[options.attributesKey] = options.instructionFn(element[options.attributesKey], key, currentElement);
        }
      } else {
        if ('instructionFn' in options) {
          value[key] = options.instructionFn(value[key], key, currentElement);
        }
        element[options.instructionKey] = value[key];
      }
    } else {
      if (type + 'Fn' in options) {
        value = options[type + 'Fn'](value, currentElement);
      }
      element[options[type + 'Key']] = value;
    }
    if (options.addParent) {
      element[options.parentKey] = currentElement;
    }
    currentElement[options.elementsKey].push(element);
  }
}

function manipulateAttributes(attributes) {
  if ('attributesFn' in options && attributes) {
    attributes = options.attributesFn(attributes, currentElement);
  }
  if ((options.trim || 'attributeValueFn' in options || 'attributeNameFn' in options) && attributes) {
    var key;
    for (key in attributes) {
      if (attributes.hasOwnProperty(key)) {
        if (options.trim) attributes[key] = attributes[key].trim();
        if ('attributeValueFn' in options) attributes[key] = options.attributeValueFn(attributes[key], key, currentElement);
        if ('attributeNameFn' in options) {
          var temp = attributes[key];
          delete attributes[key];
          attributes[options.attributeNameFn(key, attributes[key], currentElement)] = temp;
        }
      }
    }
  }
  return attributes;
}

function onInstruction(instruction) {
  var attributes = {};
  if (instruction.body && (instruction.name.toLowerCase() === 'xml' || options.instructionHasAttributes)) {
    var attrsRegExp = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\w+))\s*/g;
    var match;
    while ((match = attrsRegExp.exec(instruction.body)) !== null) {
      attributes[match[1]] = match[2] || match[3] || match[4];
    }
    attributes = manipulateAttributes(attributes);
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
    var value = {};
    if (options.instructionHasAttributes && Object.keys(attributes).length) {
      value[instruction.name] = {};
      value[instruction.name][options.attributesKey] = attributes;
    } else {
      value[instruction.name] = instruction.body;
    }
    addField('instruction', value);
  }
}

function onStartElement(name, attributes) {
  var element;
  if (typeof name === 'object') {
    attributes = name.attributes;
    name = name.name;
  }
  attributes = manipulateAttributes(attributes);
  if ('elementNameFn' in options) {
    name = options.elementNameFn(name, currentElement);
  }
  if (options.compact) {
    element = {};
    if (!options.ignoreAttributes && attributes && Object.keys(attributes).length) {
      element[options.attributesKey] = {};
      var key;
      for (key in attributes) {
        if (attributes.hasOwnProperty(key)) {
          element[options.attributesKey][key] = attributes[key];
        }
      }
    }
    if (
      !(name in currentElement) &&
      (isArray(options.alwaysArray) ? options.alwaysArray.indexOf(name) !== -1 : options.alwaysArray)
    ) {
      currentElement[name] = [];
    }
    if (currentElement[name] && !isArray(currentElement[name])) {
      currentElement[name] = [currentElement[name]];
    }
    if (isArray(currentElement[name])) {
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
  element[options.parentKey] = currentElement; // will be deleted in onEndElement() if !options.addParent
  currentElement = element;
}

function onText(text) {
  if (options.ignoreText) {
    return;
  }
  if (!text.trim() && !options.captureSpacesBetweenElements) {
    return;
  }
  if (options.trim) {
    text = text.trim();
  }
  if (options.nativeType) {
    text = nativeType(text);
  }
  if (options.sanitize) {
    text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  addField('text', text);
}

function onComment(comment) {
  if (options.ignoreComment) {
    return;
  }
  if (options.trim) {
    comment = comment.trim();
  }
  addField('comment', comment);
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
  addField('cdata', cdata);
}

function onDoctype(doctype) {
  if (options.ignoreDoctype) {
    return;
  }
  doctype = doctype.replace(/^ /, '');
  if (options.trim) {
    doctype = doctype.trim();
  }
  addField('doctype', doctype);
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
    parser.opt = {strictEntities: true};
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

},{"./array-helper":2,"./options-helper":6,"sax":36}],8:[function(require,module,exports){
var helper = require('./options-helper');
var xml2js = require('./xml2js');

function validateOptions (userOptions) {
  var options = helper.copyOptions(userOptions);
  helper.ensureSpacesExists(options);
  return options;
}

module.exports = function(xml, userOptions) {
  var options, js, json, parentKey;
  options = validateOptions(userOptions);
  js = xml2js(xml, options);
  parentKey = 'compact' in options && options.compact ? '_parent' : 'parent';
  // parentKey = ptions.compact ? '_parent' : 'parent'; // consider this
  if ('addParent' in options && options.addParent) {
    json = JSON.stringify(js, function (k, v) { return k === parentKey? '_' : v; }, options.spaces);
  } else {
    json = JSON.stringify(js, null, options.spaces);
  }
  return json.replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
};

},{"./options-helper":6,"./xml2js":7}],9:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return (b64.length * 3 / 4) - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr((len * 3 / 4) - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0; i < l; i += 4) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],10:[function(require,module,exports){

},{}],11:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('Invalid typed array length')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (isArrayBuffer(value)) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  return fromObject(value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj) {
    if (isArrayBufferView(obj) || 'length' in obj) {
      if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
        return createBuffer(0)
      }
      return fromArrayLike(obj)
    }

    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
      return fromArrayLike(obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (isArrayBufferView(string) || isArrayBuffer(string)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : new Buffer(val, encoding)
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffers from another context (i.e. an iframe) do not pass the `instanceof` check
// but they should be treated as valid. See: https://github.com/feross/buffer/issues/166
function isArrayBuffer (obj) {
  return obj instanceof ArrayBuffer ||
    (obj != null && obj.constructor != null && obj.constructor.name === 'ArrayBuffer' &&
      typeof obj.byteLength === 'number')
}

// Node 0.10 supports `ArrayBuffer` but lacks `ArrayBuffer.isView`
function isArrayBufferView (obj) {
  return (typeof ArrayBuffer.isView === 'function') && ArrayBuffer.isView(obj)
}

function numberIsNaN (obj) {
  return obj !== obj // eslint-disable-line no-self-compare
}

},{"base64-js":9,"ieee754":14}],12:[function(require,module,exports){
(function (Buffer){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

}).call(this,{"isBuffer":require("../../is-buffer/index.js")})
},{"../../is-buffer/index.js":17}],13:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],14:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],15:[function(require,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],16:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],17:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],18:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],19:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":21}],20:[function(require,module,exports){
(function (process){
'use strict';

if (!process.version ||
    process.version.indexOf('v0.') === 0 ||
    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
  module.exports = nextTick;
} else {
  module.exports = process.nextTick;
}

function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }
  var len = arguments.length;
  var args, i;
  switch (len) {
  case 0:
  case 1:
    return process.nextTick(fn);
  case 2:
    return process.nextTick(function afterTickOne() {
      fn.call(null, arg1);
    });
  case 3:
    return process.nextTick(function afterTickTwo() {
      fn.call(null, arg1, arg2);
    });
  case 4:
    return process.nextTick(function afterTickThree() {
      fn.call(null, arg1, arg2, arg3);
    });
  default:
    args = new Array(len - 1);
    i = 0;
    while (i < args.length) {
      args[i++] = arguments[i];
    }
    return process.nextTick(function afterTick() {
      fn.apply(null, args);
    });
  }
}

}).call(this,require('_process'))
},{"_process":21}],21:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],22:[function(require,module,exports){
module.exports = require('./lib/_stream_duplex.js');

},{"./lib/_stream_duplex.js":23}],23:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

'use strict';

/*<replacement>*/

var processNextTick = require('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }return keys;
};
/*</replacement>*/

module.exports = Duplex;

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var Readable = require('./_stream_readable');
var Writable = require('./_stream_writable');

util.inherits(Duplex, Readable);

var keys = objectKeys(Writable.prototype);
for (var v = 0; v < keys.length; v++) {
  var method = keys[v];
  if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  processNextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

Object.defineProperty(Duplex.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }
    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});

Duplex.prototype._destroy = function (err, cb) {
  this.push(null);
  this.end();

  processNextTick(cb, err);
};

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}
},{"./_stream_readable":25,"./_stream_writable":27,"core-util-is":12,"inherits":16,"process-nextick-args":20}],24:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

'use strict';

module.exports = PassThrough;

var Transform = require('./_stream_transform');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};
},{"./_stream_transform":26,"core-util-is":12,"inherits":16}],25:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var processNextTick = require('process-nextick-args');
/*</replacement>*/

module.exports = Readable;

/*<replacement>*/
var isArray = require('isarray');
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = require('events').EventEmitter;

var EElistenerCount = function (emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

// TODO(bmeurer): Change this back to const once hole checks are
// properly optimized away early in Ignition+TurboFan.
/*<replacement>*/
var Buffer = require('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}
/*</replacement>*/

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var debugUtil = require('util');
var debug = void 0;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/

var BufferList = require('./internal/streams/BufferList');
var destroyImpl = require('./internal/streams/destroy');
var StringDecoder;

util.inherits(Readable, Stream);

var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') {
    return emitter.prependListener(event, fn);
  } else {
    // This is a hack to make sure that our error handler is attached before any
    // userland ones.  NEVER DO THIS. This is here only because this code needs
    // to continue to work with older versions of Node.js that do not include
    // the prependListener() method. The goal is to eventually remove this hack.
    if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
  }
}

function ReadableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // has it been destroyed
  this.destroyed = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options) {
    if (typeof options.read === 'function') this._read = options.read;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }

  Stream.call(this);
}

Object.defineProperty(Readable.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined) {
      return false;
    }
    return this._readableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
  }
});

Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;
Readable.prototype._destroy = function (err, cb) {
  this.push(null);
  cb(err);
};

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;

  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;
      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }
      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }

  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};

function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  var state = stream._readableState;
  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);
    if (er) {
      stream.emit('error', er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }

      if (addToFront) {
        if (state.endEmitted) stream.emit('error', new Error('stream.unshift() after end event'));else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        stream.emit('error', new Error('stream.push() after EOF'));
      } else {
        state.reading = false;
        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
    }
  }

  return needMoreData(state);
}

function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    stream.emit('data', chunk);
    stream.read(0);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

    if (state.needReadable) emitReadable(stream);
  }
  maybeReadMore(stream, state);
}

function chunkInvalid(state, chunk) {
  var er;
  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;

  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) processNextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    processNextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('_read() is not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) processNextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');
    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.
  var increasedAwaitDrain = false;
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);
    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
        increasedAwaitDrain = true;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = { hasUnpiped: false };

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this, unpipeInfo);
    }return this;
  }

  // try to find the right one.
  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;

  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this, unpipeInfo);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;
      if (!state.reading) {
        processNextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    processNextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null) {}
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var state = this._readableState;
  var paused = false;

  var self = this;
  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) self.push(chunk);
    }

    self.push(null);
  });

  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = self.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], self.emit.bind(self, kProxyEvents[n]));
  }

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  self._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return self;
};

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;

  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }

  return ret;
}

// Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromListPartial(n, list, hasStrings) {
  var ret;
  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }
  return ret;
}

// Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;
  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;
    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

// Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBuffer(n, list) {
  var ret = Buffer.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;
  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;
    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    processNextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./_stream_duplex":23,"./internal/streams/BufferList":28,"./internal/streams/destroy":29,"./internal/streams/stream":30,"_process":21,"core-util-is":12,"events":13,"inherits":16,"isarray":18,"process-nextick-args":20,"safe-buffer":35,"string_decoder/":38,"util":10}],26:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

'use strict';

module.exports = Transform;

var Duplex = require('./_stream_duplex');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(Transform, Duplex);

function TransformState(stream) {
  this.afterTransform = function (er, data) {
    return afterTransform(stream, er, data);
  };

  this.needTransform = false;
  this.transforming = false;
  this.writecb = null;
  this.writechunk = null;
  this.writeencoding = null;
}

function afterTransform(stream, er, data) {
  var ts = stream._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) {
    return stream.emit('error', new Error('write callback called multiple times'));
  }

  ts.writechunk = null;
  ts.writecb = null;

  if (data !== null && data !== undefined) stream.push(data);

  cb(er);

  var rs = stream._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    stream._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = new TransformState(this);

  var stream = this;

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  this.once('prefinish', function () {
    if (typeof this._flush === 'function') this._flush(function (er, data) {
      done(stream, er, data);
    });else done(stream);
  });
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('_transform() is not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

Transform.prototype._destroy = function (err, cb) {
  var _this = this;

  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
    _this.emit('close');
  });
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);

  if (data !== null && data !== undefined) stream.push(data);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  var ws = stream._writableState;
  var ts = stream._transformState;

  if (ws.length) throw new Error('Calling transform done when ws.length != 0');

  if (ts.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}
},{"./_stream_duplex":23,"core-util-is":12,"inherits":16}],27:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.

'use strict';

/*<replacement>*/

var processNextTick = require('process-nextick-args');
/*</replacement>*/

module.exports = Writable;

/* <replacement> */
function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;
  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/
var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : processNextTick;
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var internalUtil = {
  deprecate: require('util-deprecate')
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

/*<replacement>*/
var Buffer = require('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}
/*</replacement>*/

var destroyImpl = require('./internal/streams/destroy');

util.inherits(Writable, Stream);

function nop() {}

function WritableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // if _final has been called
  this.finalCalled = false;

  // drain event flag.
  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // has it been destroyed
  this.destroyed = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function () {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})();

// Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.
var realHasInstance;
if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function (object) {
      if (realHasInstance.call(this, object)) return true;

      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function (object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.

  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
    return new Writable(options);
  }

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;

    if (typeof options.writev === 'function') this._writev = options.writev;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;

    if (typeof options.final === 'function') this._final = options.final;
  }

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  processNextTick(cb, er);
}

// Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;

  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  if (er) {
    stream.emit('error', er);
    processNextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;
  var isBuf = _isUint8Array(chunk) && !state.objectMode;

  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

  if (typeof cb !== 'function') cb = nop;

  if (state.ended) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);
    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;

  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    processNextTick(cb, er);
    // this can emit finish, and it will always happen
    // after error
    processNextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
    // this can emit finish, but finish must
    // always follow error
    finishMaybe(stream, state);
  }
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
      asyncWrite(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    var allBuffers = true;
    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }
    buffer.allBuffers = allBuffers;

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequestCount = 0;
  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('_write() is not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}
function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;
    if (err) {
      stream.emit('error', err);
    }
    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}
function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function') {
      state.pendingcb++;
      state.finalCalled = true;
      processNextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    prefinish(stream, state);
    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) processNextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}

function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;
  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  }
  if (state.corkedRequestsFree) {
    state.corkedRequestsFree.next = corkReq;
  } else {
    state.corkedRequestsFree = corkReq;
  }
}

Object.defineProperty(Writable.prototype, 'destroyed', {
  get: function () {
    if (this._writableState === undefined) {
      return false;
    }
    return this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._writableState.destroyed = value;
  }
});

Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;
Writable.prototype._destroy = function (err, cb) {
  this.end();
  cb(err);
};
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./_stream_duplex":23,"./internal/streams/destroy":29,"./internal/streams/stream":30,"_process":21,"core-util-is":12,"inherits":16,"process-nextick-args":20,"safe-buffer":35,"util-deprecate":39}],28:[function(require,module,exports){
'use strict';

/*<replacement>*/

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Buffer = require('safe-buffer').Buffer;
/*</replacement>*/

function copyBuffer(src, target, offset) {
  src.copy(target, offset);
}

module.exports = function () {
  function BufferList() {
    _classCallCheck(this, BufferList);

    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  BufferList.prototype.push = function push(v) {
    var entry = { data: v, next: null };
    if (this.length > 0) this.tail.next = entry;else this.head = entry;
    this.tail = entry;
    ++this.length;
  };

  BufferList.prototype.unshift = function unshift(v) {
    var entry = { data: v, next: this.head };
    if (this.length === 0) this.tail = entry;
    this.head = entry;
    ++this.length;
  };

  BufferList.prototype.shift = function shift() {
    if (this.length === 0) return;
    var ret = this.head.data;
    if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
    --this.length;
    return ret;
  };

  BufferList.prototype.clear = function clear() {
    this.head = this.tail = null;
    this.length = 0;
  };

  BufferList.prototype.join = function join(s) {
    if (this.length === 0) return '';
    var p = this.head;
    var ret = '' + p.data;
    while (p = p.next) {
      ret += s + p.data;
    }return ret;
  };

  BufferList.prototype.concat = function concat(n) {
    if (this.length === 0) return Buffer.alloc(0);
    if (this.length === 1) return this.head.data;
    var ret = Buffer.allocUnsafe(n >>> 0);
    var p = this.head;
    var i = 0;
    while (p) {
      copyBuffer(p.data, ret, i);
      i += p.data.length;
      p = p.next;
    }
    return ret;
  };

  return BufferList;
}();
},{"safe-buffer":35}],29:[function(require,module,exports){
'use strict';

/*<replacement>*/

var processNextTick = require('process-nextick-args');
/*</replacement>*/

// undocumented cb() API, needed for core, not for public API
function destroy(err, cb) {
  var _this = this;

  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;

  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
      processNextTick(emitErrorNT, this, err);
    }
    return;
  }

  // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks

  if (this._readableState) {
    this._readableState.destroyed = true;
  }

  // if this is a duplex stream mark the writable part as destroyed as well
  if (this._writableState) {
    this._writableState.destroyed = true;
  }

  this._destroy(err || null, function (err) {
    if (!cb && err) {
      processNextTick(emitErrorNT, _this, err);
      if (_this._writableState) {
        _this._writableState.errorEmitted = true;
      }
    } else if (cb) {
      cb(err);
    }
  });
}

function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }

  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}

function emitErrorNT(self, err) {
  self.emit('error', err);
}

module.exports = {
  destroy: destroy,
  undestroy: undestroy
};
},{"process-nextick-args":20}],30:[function(require,module,exports){
module.exports = require('events').EventEmitter;

},{"events":13}],31:[function(require,module,exports){
module.exports = require('./readable').PassThrough

},{"./readable":32}],32:[function(require,module,exports){
exports = module.exports = require('./lib/_stream_readable.js');
exports.Stream = exports;
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable.js');
exports.Duplex = require('./lib/_stream_duplex.js');
exports.Transform = require('./lib/_stream_transform.js');
exports.PassThrough = require('./lib/_stream_passthrough.js');

},{"./lib/_stream_duplex.js":23,"./lib/_stream_passthrough.js":24,"./lib/_stream_readable.js":25,"./lib/_stream_transform.js":26,"./lib/_stream_writable.js":27}],33:[function(require,module,exports){
module.exports = require('./readable').Transform

},{"./readable":32}],34:[function(require,module,exports){
module.exports = require('./lib/_stream_writable.js');

},{"./lib/_stream_writable.js":27}],35:[function(require,module,exports){
/* eslint-disable node/no-deprecated-api */
var buffer = require('buffer')
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}

},{"buffer":11}],36:[function(require,module,exports){
(function (Buffer){
;(function (sax) { // wrapper for non-node envs
  sax.parser = function (strict, opt) { return new SAXParser(strict, opt) }
  sax.SAXParser = SAXParser
  sax.SAXStream = SAXStream
  sax.createStream = createStream

  // When we pass the MAX_BUFFER_LENGTH position, start checking for buffer overruns.
  // When we check, schedule the next check for MAX_BUFFER_LENGTH - (max(buffer lengths)),
  // since that's the earliest that a buffer overrun could occur.  This way, checks are
  // as rare as required, but as often as necessary to ensure never crossing this bound.
  // Furthermore, buffers are only tested at most once per write(), so passing a very
  // large string into write() might have undesirable effects, but this is manageable by
  // the caller, so it is assumed to be safe.  Thus, a call to write() may, in the extreme
  // edge case, result in creating at most one complete copy of the string passed in.
  // Set to Infinity to have unlimited buffers.
  sax.MAX_BUFFER_LENGTH = 64 * 1024

  var buffers = [
    'comment', 'sgmlDecl', 'textNode', 'tagName', 'doctype',
    'procInstName', 'procInstBody', 'entity', 'attribName',
    'attribValue', 'cdata', 'script'
  ]

  sax.EVENTS = [
    'text',
    'processinginstruction',
    'sgmldeclaration',
    'doctype',
    'comment',
    'opentagstart',
    'attribute',
    'opentag',
    'closetag',
    'opencdata',
    'cdata',
    'closecdata',
    'error',
    'end',
    'ready',
    'script',
    'opennamespace',
    'closenamespace'
  ]

  function SAXParser (strict, opt) {
    if (!(this instanceof SAXParser)) {
      return new SAXParser(strict, opt)
    }

    var parser = this
    clearBuffers(parser)
    parser.q = parser.c = ''
    parser.bufferCheckPosition = sax.MAX_BUFFER_LENGTH
    parser.opt = opt || {}
    parser.opt.lowercase = parser.opt.lowercase || parser.opt.lowercasetags
    parser.looseCase = parser.opt.lowercase ? 'toLowerCase' : 'toUpperCase'
    parser.tags = []
    parser.closed = parser.closedRoot = parser.sawRoot = false
    parser.tag = parser.error = null
    parser.strict = !!strict
    parser.noscript = !!(strict || parser.opt.noscript)
    parser.state = S.BEGIN
    parser.strictEntities = parser.opt.strictEntities
    parser.ENTITIES = parser.strictEntities ? Object.create(sax.XML_ENTITIES) : Object.create(sax.ENTITIES)
    parser.attribList = []

    // namespaces form a prototype chain.
    // it always points at the current tag,
    // which protos to its parent tag.
    if (parser.opt.xmlns) {
      parser.ns = Object.create(rootNS)
    }

    // mostly just for error reporting
    parser.trackPosition = parser.opt.position !== false
    if (parser.trackPosition) {
      parser.position = parser.line = parser.column = 0
    }
    emit(parser, 'onready')
  }

  if (!Object.create) {
    Object.create = function (o) {
      function F () {}
      F.prototype = o
      var newf = new F()
      return newf
    }
  }

  if (!Object.keys) {
    Object.keys = function (o) {
      var a = []
      for (var i in o) if (o.hasOwnProperty(i)) a.push(i)
      return a
    }
  }

  function checkBufferLength (parser) {
    var maxAllowed = Math.max(sax.MAX_BUFFER_LENGTH, 10)
    var maxActual = 0
    for (var i = 0, l = buffers.length; i < l; i++) {
      var len = parser[buffers[i]].length
      if (len > maxAllowed) {
        // Text/cdata nodes can get big, and since they're buffered,
        // we can get here under normal conditions.
        // Avoid issues by emitting the text node now,
        // so at least it won't get any bigger.
        switch (buffers[i]) {
          case 'textNode':
            closeText(parser)
            break

          case 'cdata':
            emitNode(parser, 'oncdata', parser.cdata)
            parser.cdata = ''
            break

          case 'script':
            emitNode(parser, 'onscript', parser.script)
            parser.script = ''
            break

          default:
            error(parser, 'Max buffer length exceeded: ' + buffers[i])
        }
      }
      maxActual = Math.max(maxActual, len)
    }
    // schedule the next check for the earliest possible buffer overrun.
    var m = sax.MAX_BUFFER_LENGTH - maxActual
    parser.bufferCheckPosition = m + parser.position
  }

  function clearBuffers (parser) {
    for (var i = 0, l = buffers.length; i < l; i++) {
      parser[buffers[i]] = ''
    }
  }

  function flushBuffers (parser) {
    closeText(parser)
    if (parser.cdata !== '') {
      emitNode(parser, 'oncdata', parser.cdata)
      parser.cdata = ''
    }
    if (parser.script !== '') {
      emitNode(parser, 'onscript', parser.script)
      parser.script = ''
    }
  }

  SAXParser.prototype = {
    end: function () { end(this) },
    write: write,
    resume: function () { this.error = null; return this },
    close: function () { return this.write(null) },
    flush: function () { flushBuffers(this) }
  }

  var Stream
  try {
    Stream = require('stream').Stream
  } catch (ex) {
    Stream = function () {}
  }

  var streamWraps = sax.EVENTS.filter(function (ev) {
    return ev !== 'error' && ev !== 'end'
  })

  function createStream (strict, opt) {
    return new SAXStream(strict, opt)
  }

  function SAXStream (strict, opt) {
    if (!(this instanceof SAXStream)) {
      return new SAXStream(strict, opt)
    }

    Stream.apply(this)

    this._parser = new SAXParser(strict, opt)
    this.writable = true
    this.readable = true

    var me = this

    this._parser.onend = function () {
      me.emit('end')
    }

    this._parser.onerror = function (er) {
      me.emit('error', er)

      // if didn't throw, then means error was handled.
      // go ahead and clear error, so we can write again.
      me._parser.error = null
    }

    this._decoder = null

    streamWraps.forEach(function (ev) {
      Object.defineProperty(me, 'on' + ev, {
        get: function () {
          return me._parser['on' + ev]
        },
        set: function (h) {
          if (!h) {
            me.removeAllListeners(ev)
            me._parser['on' + ev] = h
            return h
          }
          me.on(ev, h)
        },
        enumerable: true,
        configurable: false
      })
    })
  }

  SAXStream.prototype = Object.create(Stream.prototype, {
    constructor: {
      value: SAXStream
    }
  })

  SAXStream.prototype.write = function (data) {
    if (typeof Buffer === 'function' &&
      typeof Buffer.isBuffer === 'function' &&
      Buffer.isBuffer(data)) {
      if (!this._decoder) {
        var SD = require('string_decoder').StringDecoder
        this._decoder = new SD('utf8')
      }
      data = this._decoder.write(data)
    }

    this._parser.write(data.toString())
    this.emit('data', data)
    return true
  }

  SAXStream.prototype.end = function (chunk) {
    if (chunk && chunk.length) {
      this.write(chunk)
    }
    this._parser.end()
    return true
  }

  SAXStream.prototype.on = function (ev, handler) {
    var me = this
    if (!me._parser['on' + ev] && streamWraps.indexOf(ev) !== -1) {
      me._parser['on' + ev] = function () {
        var args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments)
        args.splice(0, 0, ev)
        me.emit.apply(me, args)
      }
    }

    return Stream.prototype.on.call(me, ev, handler)
  }

  // this really needs to be replaced with character classes.
  // XML allows all manner of ridiculous numbers and digits.
  var CDATA = '[CDATA['
  var DOCTYPE = 'DOCTYPE'
  var XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace'
  var XMLNS_NAMESPACE = 'http://www.w3.org/2000/xmlns/'
  var rootNS = { xml: XML_NAMESPACE, xmlns: XMLNS_NAMESPACE }

  // http://www.w3.org/TR/REC-xml/#NT-NameStartChar
  // This implementation works on strings, a single character at a time
  // as such, it cannot ever support astral-plane characters (10000-EFFFF)
  // without a significant breaking change to either this  parser, or the
  // JavaScript language.  Implementation of an emoji-capable xml parser
  // is left as an exercise for the reader.
  var nameStart = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/

  var nameBody = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/

  var entityStart = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/
  var entityBody = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/

  function isWhitespace (c) {
    return c === ' ' || c === '\n' || c === '\r' || c === '\t'
  }

  function isQuote (c) {
    return c === '"' || c === '\''
  }

  function isAttribEnd (c) {
    return c === '>' || isWhitespace(c)
  }

  function isMatch (regex, c) {
    return regex.test(c)
  }

  function notMatch (regex, c) {
    return !isMatch(regex, c)
  }

  var S = 0
  sax.STATE = {
    BEGIN: S++, // leading byte order mark or whitespace
    BEGIN_WHITESPACE: S++, // leading whitespace
    TEXT: S++, // general stuff
    TEXT_ENTITY: S++, // &amp and such.
    OPEN_WAKA: S++, // <
    SGML_DECL: S++, // <!BLARG
    SGML_DECL_QUOTED: S++, // <!BLARG foo "bar
    DOCTYPE: S++, // <!DOCTYPE
    DOCTYPE_QUOTED: S++, // <!DOCTYPE "//blah
    DOCTYPE_DTD: S++, // <!DOCTYPE "//blah" [ ...
    DOCTYPE_DTD_QUOTED: S++, // <!DOCTYPE "//blah" [ "foo
    COMMENT_STARTING: S++, // <!-
    COMMENT: S++, // <!--
    COMMENT_ENDING: S++, // <!-- blah -
    COMMENT_ENDED: S++, // <!-- blah --
    CDATA: S++, // <![CDATA[ something
    CDATA_ENDING: S++, // ]
    CDATA_ENDING_2: S++, // ]]
    PROC_INST: S++, // <?hi
    PROC_INST_BODY: S++, // <?hi there
    PROC_INST_ENDING: S++, // <?hi "there" ?
    OPEN_TAG: S++, // <strong
    OPEN_TAG_SLASH: S++, // <strong /
    ATTRIB: S++, // <a
    ATTRIB_NAME: S++, // <a foo
    ATTRIB_NAME_SAW_WHITE: S++, // <a foo _
    ATTRIB_VALUE: S++, // <a foo=
    ATTRIB_VALUE_QUOTED: S++, // <a foo="bar
    ATTRIB_VALUE_CLOSED: S++, // <a foo="bar"
    ATTRIB_VALUE_UNQUOTED: S++, // <a foo=bar
    ATTRIB_VALUE_ENTITY_Q: S++, // <foo bar="&quot;"
    ATTRIB_VALUE_ENTITY_U: S++, // <foo bar=&quot
    CLOSE_TAG: S++, // </a
    CLOSE_TAG_SAW_WHITE: S++, // </a   >
    SCRIPT: S++, // <script> ...
    SCRIPT_ENDING: S++ // <script> ... <
  }

  sax.XML_ENTITIES = {
    'amp': '&',
    'gt': '>',
    'lt': '<',
    'quot': '"',
    'apos': "'"
  }

  sax.ENTITIES = {
    'amp': '&',
    'gt': '>',
    'lt': '<',
    'quot': '"',
    'apos': "'",
    'AElig': 198,
    'Aacute': 193,
    'Acirc': 194,
    'Agrave': 192,
    'Aring': 197,
    'Atilde': 195,
    'Auml': 196,
    'Ccedil': 199,
    'ETH': 208,
    'Eacute': 201,
    'Ecirc': 202,
    'Egrave': 200,
    'Euml': 203,
    'Iacute': 205,
    'Icirc': 206,
    'Igrave': 204,
    'Iuml': 207,
    'Ntilde': 209,
    'Oacute': 211,
    'Ocirc': 212,
    'Ograve': 210,
    'Oslash': 216,
    'Otilde': 213,
    'Ouml': 214,
    'THORN': 222,
    'Uacute': 218,
    'Ucirc': 219,
    'Ugrave': 217,
    'Uuml': 220,
    'Yacute': 221,
    'aacute': 225,
    'acirc': 226,
    'aelig': 230,
    'agrave': 224,
    'aring': 229,
    'atilde': 227,
    'auml': 228,
    'ccedil': 231,
    'eacute': 233,
    'ecirc': 234,
    'egrave': 232,
    'eth': 240,
    'euml': 235,
    'iacute': 237,
    'icirc': 238,
    'igrave': 236,
    'iuml': 239,
    'ntilde': 241,
    'oacute': 243,
    'ocirc': 244,
    'ograve': 242,
    'oslash': 248,
    'otilde': 245,
    'ouml': 246,
    'szlig': 223,
    'thorn': 254,
    'uacute': 250,
    'ucirc': 251,
    'ugrave': 249,
    'uuml': 252,
    'yacute': 253,
    'yuml': 255,
    'copy': 169,
    'reg': 174,
    'nbsp': 160,
    'iexcl': 161,
    'cent': 162,
    'pound': 163,
    'curren': 164,
    'yen': 165,
    'brvbar': 166,
    'sect': 167,
    'uml': 168,
    'ordf': 170,
    'laquo': 171,
    'not': 172,
    'shy': 173,
    'macr': 175,
    'deg': 176,
    'plusmn': 177,
    'sup1': 185,
    'sup2': 178,
    'sup3': 179,
    'acute': 180,
    'micro': 181,
    'para': 182,
    'middot': 183,
    'cedil': 184,
    'ordm': 186,
    'raquo': 187,
    'frac14': 188,
    'frac12': 189,
    'frac34': 190,
    'iquest': 191,
    'times': 215,
    'divide': 247,
    'OElig': 338,
    'oelig': 339,
    'Scaron': 352,
    'scaron': 353,
    'Yuml': 376,
    'fnof': 402,
    'circ': 710,
    'tilde': 732,
    'Alpha': 913,
    'Beta': 914,
    'Gamma': 915,
    'Delta': 916,
    'Epsilon': 917,
    'Zeta': 918,
    'Eta': 919,
    'Theta': 920,
    'Iota': 921,
    'Kappa': 922,
    'Lambda': 923,
    'Mu': 924,
    'Nu': 925,
    'Xi': 926,
    'Omicron': 927,
    'Pi': 928,
    'Rho': 929,
    'Sigma': 931,
    'Tau': 932,
    'Upsilon': 933,
    'Phi': 934,
    'Chi': 935,
    'Psi': 936,
    'Omega': 937,
    'alpha': 945,
    'beta': 946,
    'gamma': 947,
    'delta': 948,
    'epsilon': 949,
    'zeta': 950,
    'eta': 951,
    'theta': 952,
    'iota': 953,
    'kappa': 954,
    'lambda': 955,
    'mu': 956,
    'nu': 957,
    'xi': 958,
    'omicron': 959,
    'pi': 960,
    'rho': 961,
    'sigmaf': 962,
    'sigma': 963,
    'tau': 964,
    'upsilon': 965,
    'phi': 966,
    'chi': 967,
    'psi': 968,
    'omega': 969,
    'thetasym': 977,
    'upsih': 978,
    'piv': 982,
    'ensp': 8194,
    'emsp': 8195,
    'thinsp': 8201,
    'zwnj': 8204,
    'zwj': 8205,
    'lrm': 8206,
    'rlm': 8207,
    'ndash': 8211,
    'mdash': 8212,
    'lsquo': 8216,
    'rsquo': 8217,
    'sbquo': 8218,
    'ldquo': 8220,
    'rdquo': 8221,
    'bdquo': 8222,
    'dagger': 8224,
    'Dagger': 8225,
    'bull': 8226,
    'hellip': 8230,
    'permil': 8240,
    'prime': 8242,
    'Prime': 8243,
    'lsaquo': 8249,
    'rsaquo': 8250,
    'oline': 8254,
    'frasl': 8260,
    'euro': 8364,
    'image': 8465,
    'weierp': 8472,
    'real': 8476,
    'trade': 8482,
    'alefsym': 8501,
    'larr': 8592,
    'uarr': 8593,
    'rarr': 8594,
    'darr': 8595,
    'harr': 8596,
    'crarr': 8629,
    'lArr': 8656,
    'uArr': 8657,
    'rArr': 8658,
    'dArr': 8659,
    'hArr': 8660,
    'forall': 8704,
    'part': 8706,
    'exist': 8707,
    'empty': 8709,
    'nabla': 8711,
    'isin': 8712,
    'notin': 8713,
    'ni': 8715,
    'prod': 8719,
    'sum': 8721,
    'minus': 8722,
    'lowast': 8727,
    'radic': 8730,
    'prop': 8733,
    'infin': 8734,
    'ang': 8736,
    'and': 8743,
    'or': 8744,
    'cap': 8745,
    'cup': 8746,
    'int': 8747,
    'there4': 8756,
    'sim': 8764,
    'cong': 8773,
    'asymp': 8776,
    'ne': 8800,
    'equiv': 8801,
    'le': 8804,
    'ge': 8805,
    'sub': 8834,
    'sup': 8835,
    'nsub': 8836,
    'sube': 8838,
    'supe': 8839,
    'oplus': 8853,
    'otimes': 8855,
    'perp': 8869,
    'sdot': 8901,
    'lceil': 8968,
    'rceil': 8969,
    'lfloor': 8970,
    'rfloor': 8971,
    'lang': 9001,
    'rang': 9002,
    'loz': 9674,
    'spades': 9824,
    'clubs': 9827,
    'hearts': 9829,
    'diams': 9830
  }

  Object.keys(sax.ENTITIES).forEach(function (key) {
    var e = sax.ENTITIES[key]
    var s = typeof e === 'number' ? String.fromCharCode(e) : e
    sax.ENTITIES[key] = s
  })

  for (var s in sax.STATE) {
    sax.STATE[sax.STATE[s]] = s
  }

  // shorthand
  S = sax.STATE

  function emit (parser, event, data) {
    parser[event] && parser[event](data)
  }

  function emitNode (parser, nodeType, data) {
    if (parser.textNode) closeText(parser)
    emit(parser, nodeType, data)
  }

  function closeText (parser) {
    parser.textNode = textopts(parser.opt, parser.textNode)
    if (parser.textNode) emit(parser, 'ontext', parser.textNode)
    parser.textNode = ''
  }

  function textopts (opt, text) {
    if (opt.trim) text = text.trim()
    if (opt.normalize) text = text.replace(/\s+/g, ' ')
    return text
  }

  function error (parser, er) {
    closeText(parser)
    if (parser.trackPosition) {
      er += '\nLine: ' + parser.line +
        '\nColumn: ' + parser.column +
        '\nChar: ' + parser.c
    }
    er = new Error(er)
    parser.error = er
    emit(parser, 'onerror', er)
    return parser
  }

  function end (parser) {
    if (parser.sawRoot && !parser.closedRoot) strictFail(parser, 'Unclosed root tag')
    if ((parser.state !== S.BEGIN) &&
      (parser.state !== S.BEGIN_WHITESPACE) &&
      (parser.state !== S.TEXT)) {
      error(parser, 'Unexpected end')
    }
    closeText(parser)
    parser.c = ''
    parser.closed = true
    emit(parser, 'onend')
    SAXParser.call(parser, parser.strict, parser.opt)
    return parser
  }

  function strictFail (parser, message) {
    if (typeof parser !== 'object' || !(parser instanceof SAXParser)) {
      throw new Error('bad call to strictFail')
    }
    if (parser.strict) {
      error(parser, message)
    }
  }

  function newTag (parser) {
    if (!parser.strict) parser.tagName = parser.tagName[parser.looseCase]()
    var parent = parser.tags[parser.tags.length - 1] || parser
    var tag = parser.tag = { name: parser.tagName, attributes: {} }

    // will be overridden if tag contails an xmlns="foo" or xmlns:foo="bar"
    if (parser.opt.xmlns) {
      tag.ns = parent.ns
    }
    parser.attribList.length = 0
    emitNode(parser, 'onopentagstart', tag)
  }

  function qname (name, attribute) {
    var i = name.indexOf(':')
    var qualName = i < 0 ? [ '', name ] : name.split(':')
    var prefix = qualName[0]
    var local = qualName[1]

    // <x "xmlns"="http://foo">
    if (attribute && name === 'xmlns') {
      prefix = 'xmlns'
      local = ''
    }

    return { prefix: prefix, local: local }
  }

  function attrib (parser) {
    if (!parser.strict) {
      parser.attribName = parser.attribName[parser.looseCase]()
    }

    if (parser.attribList.indexOf(parser.attribName) !== -1 ||
      parser.tag.attributes.hasOwnProperty(parser.attribName)) {
      parser.attribName = parser.attribValue = ''
      return
    }

    if (parser.opt.xmlns) {
      var qn = qname(parser.attribName, true)
      var prefix = qn.prefix
      var local = qn.local

      if (prefix === 'xmlns') {
        // namespace binding attribute. push the binding into scope
        if (local === 'xml' && parser.attribValue !== XML_NAMESPACE) {
          strictFail(parser,
            'xml: prefix must be bound to ' + XML_NAMESPACE + '\n' +
            'Actual: ' + parser.attribValue)
        } else if (local === 'xmlns' && parser.attribValue !== XMLNS_NAMESPACE) {
          strictFail(parser,
            'xmlns: prefix must be bound to ' + XMLNS_NAMESPACE + '\n' +
            'Actual: ' + parser.attribValue)
        } else {
          var tag = parser.tag
          var parent = parser.tags[parser.tags.length - 1] || parser
          if (tag.ns === parent.ns) {
            tag.ns = Object.create(parent.ns)
          }
          tag.ns[local] = parser.attribValue
        }
      }

      // defer onattribute events until all attributes have been seen
      // so any new bindings can take effect. preserve attribute order
      // so deferred events can be emitted in document order
      parser.attribList.push([parser.attribName, parser.attribValue])
    } else {
      // in non-xmlns mode, we can emit the event right away
      parser.tag.attributes[parser.attribName] = parser.attribValue
      emitNode(parser, 'onattribute', {
        name: parser.attribName,
        value: parser.attribValue
      })
    }

    parser.attribName = parser.attribValue = ''
  }

  function openTag (parser, selfClosing) {
    if (parser.opt.xmlns) {
      // emit namespace binding events
      var tag = parser.tag

      // add namespace info to tag
      var qn = qname(parser.tagName)
      tag.prefix = qn.prefix
      tag.local = qn.local
      tag.uri = tag.ns[qn.prefix] || ''

      if (tag.prefix && !tag.uri) {
        strictFail(parser, 'Unbound namespace prefix: ' +
          JSON.stringify(parser.tagName))
        tag.uri = qn.prefix
      }

      var parent = parser.tags[parser.tags.length - 1] || parser
      if (tag.ns && parent.ns !== tag.ns) {
        Object.keys(tag.ns).forEach(function (p) {
          emitNode(parser, 'onopennamespace', {
            prefix: p,
            uri: tag.ns[p]
          })
        })
      }

      // handle deferred onattribute events
      // Note: do not apply default ns to attributes:
      //   http://www.w3.org/TR/REC-xml-names/#defaulting
      for (var i = 0, l = parser.attribList.length; i < l; i++) {
        var nv = parser.attribList[i]
        var name = nv[0]
        var value = nv[1]
        var qualName = qname(name, true)
        var prefix = qualName.prefix
        var local = qualName.local
        var uri = prefix === '' ? '' : (tag.ns[prefix] || '')
        var a = {
          name: name,
          value: value,
          prefix: prefix,
          local: local,
          uri: uri
        }

        // if there's any attributes with an undefined namespace,
        // then fail on them now.
        if (prefix && prefix !== 'xmlns' && !uri) {
          strictFail(parser, 'Unbound namespace prefix: ' +
            JSON.stringify(prefix))
          a.uri = prefix
        }
        parser.tag.attributes[name] = a
        emitNode(parser, 'onattribute', a)
      }
      parser.attribList.length = 0
    }

    parser.tag.isSelfClosing = !!selfClosing

    // process the tag
    parser.sawRoot = true
    parser.tags.push(parser.tag)
    emitNode(parser, 'onopentag', parser.tag)
    if (!selfClosing) {
      // special case for <script> in non-strict mode.
      if (!parser.noscript && parser.tagName.toLowerCase() === 'script') {
        parser.state = S.SCRIPT
      } else {
        parser.state = S.TEXT
      }
      parser.tag = null
      parser.tagName = ''
    }
    parser.attribName = parser.attribValue = ''
    parser.attribList.length = 0
  }

  function closeTag (parser) {
    if (!parser.tagName) {
      strictFail(parser, 'Weird empty close tag.')
      parser.textNode += '</>'
      parser.state = S.TEXT
      return
    }

    if (parser.script) {
      if (parser.tagName !== 'script') {
        parser.script += '</' + parser.tagName + '>'
        parser.tagName = ''
        parser.state = S.SCRIPT
        return
      }
      emitNode(parser, 'onscript', parser.script)
      parser.script = ''
    }

    // first make sure that the closing tag actually exists.
    // <a><b></c></b></a> will close everything, otherwise.
    var t = parser.tags.length
    var tagName = parser.tagName
    if (!parser.strict) {
      tagName = tagName[parser.looseCase]()
    }
    var closeTo = tagName
    while (t--) {
      var close = parser.tags[t]
      if (close.name !== closeTo) {
        // fail the first time in strict mode
        strictFail(parser, 'Unexpected close tag')
      } else {
        break
      }
    }

    // didn't find it.  we already failed for strict, so just abort.
    if (t < 0) {
      strictFail(parser, 'Unmatched closing tag: ' + parser.tagName)
      parser.textNode += '</' + parser.tagName + '>'
      parser.state = S.TEXT
      return
    }
    parser.tagName = tagName
    var s = parser.tags.length
    while (s-- > t) {
      var tag = parser.tag = parser.tags.pop()
      parser.tagName = parser.tag.name
      emitNode(parser, 'onclosetag', parser.tagName)

      var x = {}
      for (var i in tag.ns) {
        x[i] = tag.ns[i]
      }

      var parent = parser.tags[parser.tags.length - 1] || parser
      if (parser.opt.xmlns && tag.ns !== parent.ns) {
        // remove namespace bindings introduced by tag
        Object.keys(tag.ns).forEach(function (p) {
          var n = tag.ns[p]
          emitNode(parser, 'onclosenamespace', { prefix: p, uri: n })
        })
      }
    }
    if (t === 0) parser.closedRoot = true
    parser.tagName = parser.attribValue = parser.attribName = ''
    parser.attribList.length = 0
    parser.state = S.TEXT
  }

  function parseEntity (parser) {
    var entity = parser.entity
    var entityLC = entity.toLowerCase()
    var num
    var numStr = ''

    if (parser.ENTITIES[entity]) {
      return parser.ENTITIES[entity]
    }
    if (parser.ENTITIES[entityLC]) {
      return parser.ENTITIES[entityLC]
    }
    entity = entityLC
    if (entity.charAt(0) === '#') {
      if (entity.charAt(1) === 'x') {
        entity = entity.slice(2)
        num = parseInt(entity, 16)
        numStr = num.toString(16)
      } else {
        entity = entity.slice(1)
        num = parseInt(entity, 10)
        numStr = num.toString(10)
      }
    }
    entity = entity.replace(/^0+/, '')
    if (isNaN(num) || numStr.toLowerCase() !== entity) {
      strictFail(parser, 'Invalid character entity')
      return '&' + parser.entity + ';'
    }

    return String.fromCodePoint(num)
  }

  function beginWhiteSpace (parser, c) {
    if (c === '<') {
      parser.state = S.OPEN_WAKA
      parser.startTagPosition = parser.position
    } else if (!isWhitespace(c)) {
      // have to process this as a text node.
      // weird, but happens.
      strictFail(parser, 'Non-whitespace before first tag.')
      parser.textNode = c
      parser.state = S.TEXT
    }
  }

  function charAt (chunk, i) {
    var result = ''
    if (i < chunk.length) {
      result = chunk.charAt(i)
    }
    return result
  }

  function write (chunk) {
    var parser = this
    if (this.error) {
      throw this.error
    }
    if (parser.closed) {
      return error(parser,
        'Cannot write after close. Assign an onready handler.')
    }
    if (chunk === null) {
      return end(parser)
    }
    if (typeof chunk === 'object') {
      chunk = chunk.toString()
    }
    var i = 0
    var c = ''
    while (true) {
      c = charAt(chunk, i++)
      parser.c = c

      if (!c) {
        break
      }

      if (parser.trackPosition) {
        parser.position++
        if (c === '\n') {
          parser.line++
          parser.column = 0
        } else {
          parser.column++
        }
      }

      switch (parser.state) {
        case S.BEGIN:
          parser.state = S.BEGIN_WHITESPACE
          if (c === '\uFEFF') {
            continue
          }
          beginWhiteSpace(parser, c)
          continue

        case S.BEGIN_WHITESPACE:
          beginWhiteSpace(parser, c)
          continue

        case S.TEXT:
          if (parser.sawRoot && !parser.closedRoot) {
            var starti = i - 1
            while (c && c !== '<' && c !== '&') {
              c = charAt(chunk, i++)
              if (c && parser.trackPosition) {
                parser.position++
                if (c === '\n') {
                  parser.line++
                  parser.column = 0
                } else {
                  parser.column++
                }
              }
            }
            parser.textNode += chunk.substring(starti, i - 1)
          }
          if (c === '<' && !(parser.sawRoot && parser.closedRoot && !parser.strict)) {
            parser.state = S.OPEN_WAKA
            parser.startTagPosition = parser.position
          } else {
            if (!isWhitespace(c) && (!parser.sawRoot || parser.closedRoot)) {
              strictFail(parser, 'Text data outside of root node.')
            }
            if (c === '&') {
              parser.state = S.TEXT_ENTITY
            } else {
              parser.textNode += c
            }
          }
          continue

        case S.SCRIPT:
          // only non-strict
          if (c === '<') {
            parser.state = S.SCRIPT_ENDING
          } else {
            parser.script += c
          }
          continue

        case S.SCRIPT_ENDING:
          if (c === '/') {
            parser.state = S.CLOSE_TAG
          } else {
            parser.script += '<' + c
            parser.state = S.SCRIPT
          }
          continue

        case S.OPEN_WAKA:
          // either a /, ?, !, or text is coming next.
          if (c === '!') {
            parser.state = S.SGML_DECL
            parser.sgmlDecl = ''
          } else if (isWhitespace(c)) {
            // wait for it...
          } else if (isMatch(nameStart, c)) {
            parser.state = S.OPEN_TAG
            parser.tagName = c
          } else if (c === '/') {
            parser.state = S.CLOSE_TAG
            parser.tagName = ''
          } else if (c === '?') {
            parser.state = S.PROC_INST
            parser.procInstName = parser.procInstBody = ''
          } else {
            strictFail(parser, 'Unencoded <')
            // if there was some whitespace, then add that in.
            if (parser.startTagPosition + 1 < parser.position) {
              var pad = parser.position - parser.startTagPosition
              c = new Array(pad).join(' ') + c
            }
            parser.textNode += '<' + c
            parser.state = S.TEXT
          }
          continue

        case S.SGML_DECL:
          if ((parser.sgmlDecl + c).toUpperCase() === CDATA) {
            emitNode(parser, 'onopencdata')
            parser.state = S.CDATA
            parser.sgmlDecl = ''
            parser.cdata = ''
          } else if (parser.sgmlDecl + c === '--') {
            parser.state = S.COMMENT
            parser.comment = ''
            parser.sgmlDecl = ''
          } else if ((parser.sgmlDecl + c).toUpperCase() === DOCTYPE) {
            parser.state = S.DOCTYPE
            if (parser.doctype || parser.sawRoot) {
              strictFail(parser,
                'Inappropriately located doctype declaration')
            }
            parser.doctype = ''
            parser.sgmlDecl = ''
          } else if (c === '>') {
            emitNode(parser, 'onsgmldeclaration', parser.sgmlDecl)
            parser.sgmlDecl = ''
            parser.state = S.TEXT
          } else if (isQuote(c)) {
            parser.state = S.SGML_DECL_QUOTED
            parser.sgmlDecl += c
          } else {
            parser.sgmlDecl += c
          }
          continue

        case S.SGML_DECL_QUOTED:
          if (c === parser.q) {
            parser.state = S.SGML_DECL
            parser.q = ''
          }
          parser.sgmlDecl += c
          continue

        case S.DOCTYPE:
          if (c === '>') {
            parser.state = S.TEXT
            emitNode(parser, 'ondoctype', parser.doctype)
            parser.doctype = true // just remember that we saw it.
          } else {
            parser.doctype += c
            if (c === '[') {
              parser.state = S.DOCTYPE_DTD
            } else if (isQuote(c)) {
              parser.state = S.DOCTYPE_QUOTED
              parser.q = c
            }
          }
          continue

        case S.DOCTYPE_QUOTED:
          parser.doctype += c
          if (c === parser.q) {
            parser.q = ''
            parser.state = S.DOCTYPE
          }
          continue

        case S.DOCTYPE_DTD:
          parser.doctype += c
          if (c === ']') {
            parser.state = S.DOCTYPE
          } else if (isQuote(c)) {
            parser.state = S.DOCTYPE_DTD_QUOTED
            parser.q = c
          }
          continue

        case S.DOCTYPE_DTD_QUOTED:
          parser.doctype += c
          if (c === parser.q) {
            parser.state = S.DOCTYPE_DTD
            parser.q = ''
          }
          continue

        case S.COMMENT:
          if (c === '-') {
            parser.state = S.COMMENT_ENDING
          } else {
            parser.comment += c
          }
          continue

        case S.COMMENT_ENDING:
          if (c === '-') {
            parser.state = S.COMMENT_ENDED
            parser.comment = textopts(parser.opt, parser.comment)
            if (parser.comment) {
              emitNode(parser, 'oncomment', parser.comment)
            }
            parser.comment = ''
          } else {
            parser.comment += '-' + c
            parser.state = S.COMMENT
          }
          continue

        case S.COMMENT_ENDED:
          if (c !== '>') {
            strictFail(parser, 'Malformed comment')
            // allow <!-- blah -- bloo --> in non-strict mode,
            // which is a comment of " blah -- bloo "
            parser.comment += '--' + c
            parser.state = S.COMMENT
          } else {
            parser.state = S.TEXT
          }
          continue

        case S.CDATA:
          if (c === ']') {
            parser.state = S.CDATA_ENDING
          } else {
            parser.cdata += c
          }
          continue

        case S.CDATA_ENDING:
          if (c === ']') {
            parser.state = S.CDATA_ENDING_2
          } else {
            parser.cdata += ']' + c
            parser.state = S.CDATA
          }
          continue

        case S.CDATA_ENDING_2:
          if (c === '>') {
            if (parser.cdata) {
              emitNode(parser, 'oncdata', parser.cdata)
            }
            emitNode(parser, 'onclosecdata')
            parser.cdata = ''
            parser.state = S.TEXT
          } else if (c === ']') {
            parser.cdata += ']'
          } else {
            parser.cdata += ']]' + c
            parser.state = S.CDATA
          }
          continue

        case S.PROC_INST:
          if (c === '?') {
            parser.state = S.PROC_INST_ENDING
          } else if (isWhitespace(c)) {
            parser.state = S.PROC_INST_BODY
          } else {
            parser.procInstName += c
          }
          continue

        case S.PROC_INST_BODY:
          if (!parser.procInstBody && isWhitespace(c)) {
            continue
          } else if (c === '?') {
            parser.state = S.PROC_INST_ENDING
          } else {
            parser.procInstBody += c
          }
          continue

        case S.PROC_INST_ENDING:
          if (c === '>') {
            emitNode(parser, 'onprocessinginstruction', {
              name: parser.procInstName,
              body: parser.procInstBody
            })
            parser.procInstName = parser.procInstBody = ''
            parser.state = S.TEXT
          } else {
            parser.procInstBody += '?' + c
            parser.state = S.PROC_INST_BODY
          }
          continue

        case S.OPEN_TAG:
          if (isMatch(nameBody, c)) {
            parser.tagName += c
          } else {
            newTag(parser)
            if (c === '>') {
              openTag(parser)
            } else if (c === '/') {
              parser.state = S.OPEN_TAG_SLASH
            } else {
              if (!isWhitespace(c)) {
                strictFail(parser, 'Invalid character in tag name')
              }
              parser.state = S.ATTRIB
            }
          }
          continue

        case S.OPEN_TAG_SLASH:
          if (c === '>') {
            openTag(parser, true)
            closeTag(parser)
          } else {
            strictFail(parser, 'Forward-slash in opening tag not followed by >')
            parser.state = S.ATTRIB
          }
          continue

        case S.ATTRIB:
          // haven't read the attribute name yet.
          if (isWhitespace(c)) {
            continue
          } else if (c === '>') {
            openTag(parser)
          } else if (c === '/') {
            parser.state = S.OPEN_TAG_SLASH
          } else if (isMatch(nameStart, c)) {
            parser.attribName = c
            parser.attribValue = ''
            parser.state = S.ATTRIB_NAME
          } else {
            strictFail(parser, 'Invalid attribute name')
          }
          continue

        case S.ATTRIB_NAME:
          if (c === '=') {
            parser.state = S.ATTRIB_VALUE
          } else if (c === '>') {
            strictFail(parser, 'Attribute without value')
            parser.attribValue = parser.attribName
            attrib(parser)
            openTag(parser)
          } else if (isWhitespace(c)) {
            parser.state = S.ATTRIB_NAME_SAW_WHITE
          } else if (isMatch(nameBody, c)) {
            parser.attribName += c
          } else {
            strictFail(parser, 'Invalid attribute name')
          }
          continue

        case S.ATTRIB_NAME_SAW_WHITE:
          if (c === '=') {
            parser.state = S.ATTRIB_VALUE
          } else if (isWhitespace(c)) {
            continue
          } else {
            strictFail(parser, 'Attribute without value')
            parser.tag.attributes[parser.attribName] = ''
            parser.attribValue = ''
            emitNode(parser, 'onattribute', {
              name: parser.attribName,
              value: ''
            })
            parser.attribName = ''
            if (c === '>') {
              openTag(parser)
            } else if (isMatch(nameStart, c)) {
              parser.attribName = c
              parser.state = S.ATTRIB_NAME
            } else {
              strictFail(parser, 'Invalid attribute name')
              parser.state = S.ATTRIB
            }
          }
          continue

        case S.ATTRIB_VALUE:
          if (isWhitespace(c)) {
            continue
          } else if (isQuote(c)) {
            parser.q = c
            parser.state = S.ATTRIB_VALUE_QUOTED
          } else {
            strictFail(parser, 'Unquoted attribute value')
            parser.state = S.ATTRIB_VALUE_UNQUOTED
            parser.attribValue = c
          }
          continue

        case S.ATTRIB_VALUE_QUOTED:
          if (c !== parser.q) {
            if (c === '&') {
              parser.state = S.ATTRIB_VALUE_ENTITY_Q
            } else {
              parser.attribValue += c
            }
            continue
          }
          attrib(parser)
          parser.q = ''
          parser.state = S.ATTRIB_VALUE_CLOSED
          continue

        case S.ATTRIB_VALUE_CLOSED:
          if (isWhitespace(c)) {
            parser.state = S.ATTRIB
          } else if (c === '>') {
            openTag(parser)
          } else if (c === '/') {
            parser.state = S.OPEN_TAG_SLASH
          } else if (isMatch(nameStart, c)) {
            strictFail(parser, 'No whitespace between attributes')
            parser.attribName = c
            parser.attribValue = ''
            parser.state = S.ATTRIB_NAME
          } else {
            strictFail(parser, 'Invalid attribute name')
          }
          continue

        case S.ATTRIB_VALUE_UNQUOTED:
          if (!isAttribEnd(c)) {
            if (c === '&') {
              parser.state = S.ATTRIB_VALUE_ENTITY_U
            } else {
              parser.attribValue += c
            }
            continue
          }
          attrib(parser)
          if (c === '>') {
            openTag(parser)
          } else {
            parser.state = S.ATTRIB
          }
          continue

        case S.CLOSE_TAG:
          if (!parser.tagName) {
            if (isWhitespace(c)) {
              continue
            } else if (notMatch(nameStart, c)) {
              if (parser.script) {
                parser.script += '</' + c
                parser.state = S.SCRIPT
              } else {
                strictFail(parser, 'Invalid tagname in closing tag.')
              }
            } else {
              parser.tagName = c
            }
          } else if (c === '>') {
            closeTag(parser)
          } else if (isMatch(nameBody, c)) {
            parser.tagName += c
          } else if (parser.script) {
            parser.script += '</' + parser.tagName
            parser.tagName = ''
            parser.state = S.SCRIPT
          } else {
            if (!isWhitespace(c)) {
              strictFail(parser, 'Invalid tagname in closing tag')
            }
            parser.state = S.CLOSE_TAG_SAW_WHITE
          }
          continue

        case S.CLOSE_TAG_SAW_WHITE:
          if (isWhitespace(c)) {
            continue
          }
          if (c === '>') {
            closeTag(parser)
          } else {
            strictFail(parser, 'Invalid characters in closing tag')
          }
          continue

        case S.TEXT_ENTITY:
        case S.ATTRIB_VALUE_ENTITY_Q:
        case S.ATTRIB_VALUE_ENTITY_U:
          var returnState
          var buffer
          switch (parser.state) {
            case S.TEXT_ENTITY:
              returnState = S.TEXT
              buffer = 'textNode'
              break

            case S.ATTRIB_VALUE_ENTITY_Q:
              returnState = S.ATTRIB_VALUE_QUOTED
              buffer = 'attribValue'
              break

            case S.ATTRIB_VALUE_ENTITY_U:
              returnState = S.ATTRIB_VALUE_UNQUOTED
              buffer = 'attribValue'
              break
          }

          if (c === ';') {
            parser[buffer] += parseEntity(parser)
            parser.entity = ''
            parser.state = returnState
          } else if (isMatch(parser.entity.length ? entityBody : entityStart, c)) {
            parser.entity += c
          } else {
            strictFail(parser, 'Invalid character in entity name')
            parser[buffer] += '&' + parser.entity + c
            parser.entity = ''
            parser.state = returnState
          }

          continue

        default:
          throw new Error(parser, 'Unknown state: ' + parser.state)
      }
    } // while

    if (parser.position >= parser.bufferCheckPosition) {
      checkBufferLength(parser)
    }
    return parser
  }

  /*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
  /* istanbul ignore next */
  if (!String.fromCodePoint) {
    (function () {
      var stringFromCharCode = String.fromCharCode
      var floor = Math.floor
      var fromCodePoint = function () {
        var MAX_SIZE = 0x4000
        var codeUnits = []
        var highSurrogate
        var lowSurrogate
        var index = -1
        var length = arguments.length
        if (!length) {
          return ''
        }
        var result = ''
        while (++index < length) {
          var codePoint = Number(arguments[index])
          if (
            !isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
            codePoint < 0 || // not a valid Unicode code point
            codePoint > 0x10FFFF || // not a valid Unicode code point
            floor(codePoint) !== codePoint // not an integer
          ) {
            throw RangeError('Invalid code point: ' + codePoint)
          }
          if (codePoint <= 0xFFFF) { // BMP code point
            codeUnits.push(codePoint)
          } else { // Astral code point; split in surrogate halves
            // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
            codePoint -= 0x10000
            highSurrogate = (codePoint >> 10) + 0xD800
            lowSurrogate = (codePoint % 0x400) + 0xDC00
            codeUnits.push(highSurrogate, lowSurrogate)
          }
          if (index + 1 === length || codeUnits.length > MAX_SIZE) {
            result += stringFromCharCode.apply(null, codeUnits)
            codeUnits.length = 0
          }
        }
        return result
      }
      /* istanbul ignore next */
      if (Object.defineProperty) {
        Object.defineProperty(String, 'fromCodePoint', {
          value: fromCodePoint,
          configurable: true,
          writable: true
        })
      } else {
        String.fromCodePoint = fromCodePoint
      }
    }())
  }
})(typeof exports === 'undefined' ? this.sax = {} : exports)

}).call(this,require("buffer").Buffer)
},{"buffer":11,"stream":37,"string_decoder":38}],37:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = require('events').EventEmitter;
var inherits = require('inherits');

inherits(Stream, EE);
Stream.Readable = require('readable-stream/readable.js');
Stream.Writable = require('readable-stream/writable.js');
Stream.Duplex = require('readable-stream/duplex.js');
Stream.Transform = require('readable-stream/transform.js');
Stream.PassThrough = require('readable-stream/passthrough.js');

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

},{"events":13,"inherits":16,"readable-stream/duplex.js":22,"readable-stream/passthrough.js":31,"readable-stream/readable.js":32,"readable-stream/transform.js":33,"readable-stream/writable.js":34}],38:[function(require,module,exports){
'use strict';

var Buffer = require('safe-buffer').Buffer;

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.StringDecoder = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return -1;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// UTF-8 replacement characters ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd'.repeat(p);
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd'.repeat(p + 1);
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd'.repeat(p + 2);
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character for each buffered byte of a (partial)
// character needs to be added to the output.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd'.repeat(this.lastTotal - this.lastNeed);
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}
},{"safe-buffer":35}],39:[function(require,module,exports){
(function (global){

/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],40:[function(require,module,exports){
var indexOf = require('indexof');

var Object_keys = function (obj) {
    if (Object.keys) return Object.keys(obj)
    else {
        var res = [];
        for (var key in obj) res.push(key)
        return res;
    }
};

var forEach = function (xs, fn) {
    if (xs.forEach) return xs.forEach(fn)
    else for (var i = 0; i < xs.length; i++) {
        fn(xs[i], i, xs);
    }
};

var defineProp = (function() {
    try {
        Object.defineProperty({}, '_', {});
        return function(obj, name, value) {
            Object.defineProperty(obj, name, {
                writable: true,
                enumerable: false,
                configurable: true,
                value: value
            })
        };
    } catch(e) {
        return function(obj, name, value) {
            obj[name] = value;
        };
    }
}());

var globals = ['Array', 'Boolean', 'Date', 'Error', 'EvalError', 'Function',
'Infinity', 'JSON', 'Math', 'NaN', 'Number', 'Object', 'RangeError',
'ReferenceError', 'RegExp', 'String', 'SyntaxError', 'TypeError', 'URIError',
'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'escape',
'eval', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'undefined', 'unescape'];

function Context() {}
Context.prototype = {};

var Script = exports.Script = function NodeScript (code) {
    if (!(this instanceof Script)) return new Script(code);
    this.code = code;
};

Script.prototype.runInContext = function (context) {
    if (!(context instanceof Context)) {
        throw new TypeError("needs a 'context' argument.");
    }

    var iframe = document.createElement('iframe');
    if (!iframe.style) iframe.style = {};
    iframe.style.display = 'none';

    document.body.appendChild(iframe);

    var win = iframe.contentWindow;
    var wEval = win.eval, wExecScript = win.execScript;

    if (!wEval && wExecScript) {
        // win.eval() magically appears when this is called in IE:
        wExecScript.call(win, 'null');
        wEval = win.eval;
    }

    forEach(Object_keys(context), function (key) {
        win[key] = context[key];
    });
    forEach(globals, function (key) {
        if (context[key]) {
            win[key] = context[key];
        }
    });

    var winKeys = Object_keys(win);

    var res = wEval.call(win, this.code);

    forEach(Object_keys(win), function (key) {
        // Avoid copying circular objects like `top` and `window` by only
        // updating existing context properties or new properties in the `win`
        // that was only introduced after the eval.
        if (key in context || indexOf(winKeys, key) === -1) {
            context[key] = win[key];
        }
    });

    forEach(globals, function (key) {
        if (!(key in context)) {
            defineProp(context, key, win[key]);
        }
    });

    document.body.removeChild(iframe);

    return res;
};

Script.prototype.runInThisContext = function () {
    return eval(this.code); // maybe...
};

Script.prototype.runInNewContext = function (context) {
    var ctx = Script.createContext(context);
    var res = this.runInContext(ctx);

    forEach(Object_keys(ctx), function (key) {
        context[key] = ctx[key];
    });

    return res;
};

forEach(Object_keys(Script.prototype), function (name) {
    exports[name] = Script[name] = function (code) {
        var s = Script(code);
        return s[name].apply(s, [].slice.call(arguments, 1));
    };
});

exports.createScript = function (code) {
    return exports.Script(code);
};

exports.createContext = Script.createContext = function (context) {
    var copy = new Context();
    if(typeof context === 'object') {
        forEach(Object_keys(context), function (key) {
            copy[key] = context[key];
        });
    }
    return copy;
};

},{"indexof":15}],41:[function(require,module,exports){
arguments[4][10][0].apply(exports,arguments)
},{"dup":10}],42:[function(require,module,exports){
module.exports={
  "name": "xml-js",
  "version": "1.6.2",
  "description": "A convertor between XML text and Javascript object / JSON text.",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/nashwaan/xml-js.git"
  },
  "author": "Yousuf Almarzooqi <ysf953@gmail.com>",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/nashwaan/xml-js/issues"
  },
  "homepage": "https://github.com/nashwaan/xml-js#readme",
  "keywords": [
    "XML",
    "xml",
    "js",
    "JSON",
    "json",
    "cdata",
    "CDATA",
    "doctype",
    "processing instruction",
    "Javascript",
    "js2xml",
    "json2xml",
    "xml2js",
    "xml2json",
    "transform",
    "transformer",
    "transforming",
    "transformation",
    "convert",
    "convertor",
    "converting",
    "conversion",
    "parse",
    "parser",
    "parsing"
  ],
  "main": "lib/index.js",
  "bin": "./bin/cli.js",
  "types": "./types/index.d.ts",
  "scripts": {
    "build": "webpack",
    "doc": "node doc/compile-doc.js",
    "watch:doc": "watch \"npm run doc\" doc/templates/",
    "live:doc": "browser-sync start --port 9997 --server doc/ --files doc/templates/ --no-open --no-ui --no-online",
    "open:doc": "biased-opener --browser chrome http://localhost:9997",
    "start:doc": "npm-run-all --parallel watch:doc live:doc open:doc",
    "debug": "nodemon --inspect --watch lib/ --watch test/ --debug-brk test/index.js",
    "debug:cli": "nodemon --inspect --watch lib/ --debug-brk index.js -- --help",
    "jest": "jest --config=test/jest.conf.js",
    "jasmine": "jasmine JASMINE_CONFIG_PATH=./test/jasmine.json",
    "watch:jasmine": "watch \"npm run jasmine\" lib/ test/ --ignoreDirectoryPattern=/browse-.+/",
    "bundle:jasmine": "globify test/*.spec.js --watch --verbose --list --outfile test/browse-jasmine/bundle.js",
    "live:jasmine": "browser-sync start --port 9999 --server test/browse-jasmine/ --files test/browse-jasmine/ --no-open --no-ui --no-online",
    "open-help": "biased-opener --help",
    "open:jasmine": "biased-opener --browser chrome http://localhost:9999",
    "istanbul-original": "istanbul cover --dir test/coverage-jasmine -x test/browse-** test/index.js",
    "istanbul": "istanbul cover --dir test/coverage-jasmine test/index.js",
    "watch:istanbul": "watch \"npm run istanbul\" lib/ test/ --ignoreDirectoryPattern=/coverage-.+/",
    "live:istanbul": "browser-sync start --port 9998 --server test/coverage-jasmine/lcov-report/ --files test/coverage-jasmine/lcov-report/ --no-open --no-ui --no-online",
    "open:istanbul": "biased-opener --browser chrome http://localhost:9998",
    "live": "npm-run-all --parallel live:* open:*",
    "start": "npm-run-all --parallel bundle:jasmine live:jasmine open:jasmine watch:istanbul live:istanbul open:istanbul",
    "git:commit": "git add . && git commit -a -m \"Committed by npm script.\" && git push origin master",
    "git:push": "git push origin master",
    "deploy": "npm-run-all --serial coverage:* git:*",
    "coverage": "npm-run-all coverage:*",
    "coverage:a-step": "npm run istanbul",
    "coverage:coveralls": "cat ./test/coverage-jasmine/lcov.info | coveralls",
    "coverage:codecov": "codecov --token=0e52af41-702b-4d7f-8aa3-61145ac36624 --file=test/coverage-jasmine/lcov.info ",
    "coverage:codacy": "cross-env CODACY_PROJECT_TOKEN=0207815122ea49a68241d1aa435f21f1 && cat ./test/coverage-jasmine/lcov.info | codacy-coverage",
    "coverage:codeclimate": "cross-env CODECLIMATE_REPO_TOKEN=60848a077f9070acf358b0c7145f0a2698a460ddeca7d8250815e75aa4333f7d codeclimate-test-reporter < test\\coverage-jasmine\\lcov.info",
    "prepublish": "npm run test",
    "test": "npm run jasmine && npm run jest && npm run test:types",
    "test:types": "tsc -p ./types"
  },
  "dependencies": {
    "sax": "^1.2.4"
  },
  "devDependencies": {
    "babel-core": "^6.26.0",
    "babel-loader": "^7.1.2",
    "babel-preset-env": "^1.6.1",
    "biased-opener": "^0.2.8",
    "browser-sync": "^2.23.5",
    "cash-cat": "^0.2.0",
    "codacy-coverage": "^2.0.3",
    "codeclimate-test-reporter": "^0.5.0",
    "codecov": "^3.0.0",
    "coveralls": "^3.0.0",
    "cross-env": "^5.1.3",
    "eslint": "^4.15.0",
    "globify": "^2.3.0",
    "istanbul": "^0.4.5",
    "jasmine": "^2.8.0",
    "jest": "^20.0.4",
    "jest-cli": "^20.0.4",
    "jsonpath": "^1.0.0",
    "nodemon": "^1.14.11",
    "npm-run-all": "^4.1.2",
    "prismjs": "^1.9.0",
    "typescript": "^2.6.2",
    "unminified-webpack-plugin": "^1.4.2",
    "watch": "^1.0.1",
    "webpack": "^3.10.0"
  }
}

},{}],43:[function(require,module,exports){
var helper = require('../lib/array-helper');

/*global describe,it,expect,beforeEach,afterEach*/

describe('Testing array-helper.js:', function () {

  describe('Helpers:', function () {

    describe('isArray:', function () {

      var nativeIsArray;
      beforeEach(function () {
        nativeIsArray = Array.isArray;
      });

      afterEach(function () {
        Array.isArray = nativeIsArray;
      });

      it('Returns true for an array', function () {
        expect(helper.isArray([])).toBe(true);
        expect(helper.isArray(['one', 'two', 'three'])).toBe(true);
      });

      it('Returns false for none array values', function () {
        expect(helper.isArray({})).toBe(false);
        expect(helper.isArray('[]')).toBe(false);
      });

      it('Returns false for undefined values', function () {
        expect(helper.isArray(undefined)).toBe(false);
        expect(helper.isArray(null)).toBe(false);
      });

      it('Use fallback when isArray is not defined', function () {
        Array.isArray = undefined;

        expect(helper.isArray(['one', 'two', 'three'])).toBe(true);
        expect(helper.isArray({})).toBe(false);
      });

    });

  });

});

},{"../lib/array-helper":2}],44:[function(require,module,exports){
(function (process){
var helper = require('../bin/cli-helper');

/*global describe,it,expect*/

describe('Testing cli.js:', function () {

  describe('Getting help and parse arguments:', function () {

    describe('Command line help:', function () {

      it('Return help content', function () {
        var requiredArgs = [{arg: 'src', type: 'any', option: 'src', desc: 'Input file that need to be converted.'}];
        var possibleArgs = [{arg: 'help', alias: 'h', type: 'flag', option: 'help', desc: 'Display help content.'}];
        var help =
          'Usage: foo <src> [options]\n' +
          '  <src>                Input file that need to be converted.\n' +
          '\nOptions:\n' +
          '  --help               Display help content.\n';
        expect(helper.getCommandLineHelp('foo', requiredArgs, possibleArgs)).toEqual(help);
      });

    });

    describe('Map command line argument:', function () {

      if (typeof jasmineRequire === 'undefined') {

        it('Flag argument, alias', function () {
          var possibleArgs = [{arg: 'version', alias: 'v', type: 'flag', option: 'version', desc: 'Display version.'}];
          process.argv.push('-v');
          expect(helper.mapCommandLineArgs({}, possibleArgs)).toEqual({version: true});
          process.argv.pop();
        });

        it('Number argument, long form', function () {
          var possibleArgs = [{arg: 'spaces', type: 'number', option: 'spaces', desc: 'Specify spaces.'}];
          process.argv.push('--spaces'); process.argv.push('5');
          expect(helper.mapCommandLineArgs({}, possibleArgs)).toEqual({spaces: 5});
          process.argv.pop(); process.argv.pop();
        });

        it('String argument, long form', function () {
          var possibleArgs = [{arg: 'name', type: 'string', option: 'name', desc: 'Specify name.'}];
          process.argv.push('--name'); process.argv.push('Foo');
          expect(helper.mapCommandLineArgs({}, possibleArgs)).toEqual({name: 'Foo'});
          process.argv.pop(); process.argv.pop();
        });

        it('File argument, long form', function () {
          var possibleArgs = [{arg: 'input', type: 'file', option: 'input', desc: 'Specify file.'}];
          process.argv.push('--input'); process.argv.push('test.txt');
          expect(helper.mapCommandLineArgs({}, possibleArgs)).toEqual({input: 'test.txt'});
          process.argv.pop(); process.argv.pop();
        });

        it('Argument not proceeded with dash', function () {
          var possibleArgs = [{arg: 'version', alias: 'v', type: 'flag', option: 'version', desc: 'Display version.'}];
          process.argv.push('v');
          expect(helper.mapCommandLineArgs({}, possibleArgs)).not.toEqual({version: true});
          process.argv.pop();
        });

        it('Incomplete compound argument, long form', function () {
          var possibleArgs = [{arg: 'input', type: 'file', option: 'input', desc: 'Specify file.'}];
          process.argv.push('--input');
          expect(helper.mapCommandLineArgs({}, possibleArgs)).toEqual({});
          process.argv.pop();
        });

      }

    });

  });

});

}).call(this,require('_process'))
},{"../bin/cli-helper":1,"_process":21}],45:[function(require,module,exports){
(function (__dirname){
if (typeof jasmineRequire === 'undefined') {

  var path = require('path');
  var exec = require('child_process').exec;
  var packageInfo = require('../package.json');

  var command = 'node ' + path.join(__dirname, '../bin/cli');

  /*exec('node ./bin/cli.js --version', function (error, stdout, stderr) {
    console.log(stdout, stderr);
  });*/
  //console.log(exec('node ./bin/cli.js --version'), {encoding: 'utf8'});

  /*global describe,it,expect*/

  describe('Testing cli.js:', function () {

    describe('Getting version and help on usage:', function () {

      it('Get version --version', function (done) {
        exec(command + ' --version', function (error, stdout, stderr) {
          expect(stdout).toEqual(packageInfo.version + '\n');
          done();
        });
      });

      it('Get version -v', function (done) {
        exec(command + ' -v', function (error, stdout, stderr) {
          expect(stdout).toEqual(packageInfo.version + '\n');
          done();
        });
      });

      it('Get help --help', function (done) {
        exec(command + ' --help', function (error, stdout, stderr) {
          expect(stdout.substr(0, 13)).toEqual('Usage: xml-js');
          done();
        });
      });

      it('Get help -h', function (done) {
        exec(command + ' -h', function (error, stdout, stderr) {
          expect(stdout.substr(0, 13)).toEqual('Usage: xml-js');
          done();
        });
      });

      it('Get help when no arguments supplied', function (done) {
        exec(command, function (error, stdout, stderr) {
          expect(stdout.substr(0, 13)).toEqual('Usage: xml-js');
          done();
        });
      });

    });

    describe('Convert XML:', function () {

      it('should convert xml file', function (done) {
        exec(command + ' ' + path.join(__dirname, '../bin/test.xml'), function (error, stdout, stderr) {
          expect(stdout).toEqual('{"elements":[{"type":"element","name":"a","attributes":{"x":"1"},"elements":[{"type":"element","name":"b","elements":[{"type":"text","text":"bye!"}]}]}]}' + '\n');
          done();
        });
      });

      it('should convert xml file, --compact', function (done) {
        exec(command + ' ' + path.join(__dirname, '../bin/test.xml') + ' --compact', function (error, stdout, stderr) {
          expect(stdout).toEqual('{"a":{"_attributes":{"x":"1"},"b":{"_text":"bye!"}}}' + '\n');
          done();
        });
      });

    });

  });

}

}).call(this,"/test")
},{"../package.json":42,"child_process":41,"path":19}],46:[function(require,module,exports){
var convert = require('../lib');

/*global describe,it,expect*/

var args;

function manipulate(val) {
  args = arguments;
  return val.toUpperCase();
}

function manipulateAttribute(obj) {
  args = arguments;
  var key, temp;
  for (key in obj) {
    temp = obj[key];
    delete obj[key];
    obj[key.toUpperCase()] = temp.toUpperCase();
  }
  return obj;
}

function fullTag(name) {
  args = arguments;
  return name === 'b';
}

describe('Testing js2xml.js:', function () {

  describe('Adding function callbacks, options = {compact: false}', function () {

    describe('options = {doctypeFn: manipulate}', function () {

      var js = {"elements":[{"type":"doctype","doctype":"note [\n<!ENTITY foo \"baa\">]"}]};
      var xml = '<!DOCTYPE ' + manipulate('note [\n<!ENTITY foo "baa">]') + '>';
      it('<!DOCTYPE note [\\n<!ENTITY foo "baa">]>', function () {
        expect(convert.js2xml(js, {compact: false, doctypeFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toContain('note [\n<!ENTITY foo "baa">]', '_root_', js);
      });

    });

    describe('options = {instructionFn: manipulate}', function () {

      var js = {"elements":[{"type":"instruction","name":"go","instruction":"there"}]};
      var xml = '<?go ' + manipulate('there') + '?>';
      it('<?go there?>', function () {
        expect(convert.js2xml(js, {compact: false, instructionFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toContain('there', 'go', '_root_', js);
      });

    });

    describe('options = {cdataFn: manipulate}', function () {

      var js = {"elements":[{"type":"cdata","cdata":" \t <foo></bar> \t "}]};
      var xml = '<![CDATA[' + manipulate(' \t <foo></bar> \t ') + ']]>';
      it('<![CDATA[ \t <foo></bar> \t ]]>', function () {
        expect(convert.js2xml(js, {compact: false, cdataFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toContain(' \t <foo></bar> \t ', '_root_', js);
        // console.log(JSON.stringify(args));
      });

    });

    describe('options = {commentFn: manipulate}', function () {

      var js = {"elements":[{"type":"comment","comment":" \t Hello, World! \t "}]};
      var xml = '<!--' + manipulate(' \t Hello, World! \t ') + '-->';
      it('<!-- \t Hello, World! \t -->', function () {
        expect(convert.js2xml(js, {compact: false, commentFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toContain(' \t Hello, World! \t ', '_root_', js);
      });

    });

    describe('options = {textFn: manipulate}', function () {

      var js = {"elements":[{"type":"element","name":"a","elements":[{"type":"text","text":" \t Hi \t "}]}]};
      var xml = '<a>' + manipulate(' \t Hi \t ') + '</a>';
      it('<a> \t Hi \t </a>', function () {
        expect(convert.js2xml(js, {compact: false, textFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toContain(' \t Hi \t ', 'a', js.elements[0]);
      });

    });

    describe('options = {instructionNameFn: manipulate}', function () {

      var js = {"elements":[{"type":"instruction","name":"go","instruction":"there"}]};
      var xml = '<?' + manipulate('go') + ' there?>';
      it('<?go there?>', function () {
        expect(convert.js2xml(js, {compact: false, instructionNameFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toContain('go', '_root_', js);
      });

    });

    describe('options = {elementNameFn: manipulate}', function () {

      var js = {"elements":[{"type":"element","name":"a","attributes":{"x":"hello"}}]};
      var xml = '<' + manipulate('a') + ' x="hello"/>';
      it('<a x="hello"/>', function () {
        expect(convert.js2xml(js, {compact: false, elementNameFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toContain('a', js.elements[0]);
      });

    });

    describe('options = {attributeNameFn: manipulate}', function () {

      var js = {"elements":[{"type":"element","name":"a","attributes":{"x":"1.234","y":"It\'s"}}]};
      var xml = '<a ' + manipulate('x') + '="1.234" ' + manipulate('y') + '="It\'s"/>';
      it('<a x="1.234" y="It\'s"/>', function () {
        expect(convert.js2xml(js, {compact: false, attributeNameFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toContain('y', 'It\'s', 'a', js.elements[0]);
      });

    });

    describe('options = {attributeValueFn: manipulate}', function () {

      var js = {"elements":[{"type":"element","name":"a","attributes":{"x":"1.234","y":"It\'s"}}]};
      var xml = '<a x="' + manipulate('1.234') + '" y="' + manipulate('It\'s') + '"/>';
      it('<a x="1.234" y="It\'s"/>', function () {
        expect(convert.js2xml(js, {compact: false, attributeValueFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toContain('It\'s', 'y', 'a', js.elements[0]);
      });

    });

    describe('options = {attributesFn: manipulateAttribute}', function () {

      var js = {"elements":[{"type":"element","name":"a","attributes":{"x":"1.234","y":"It\'s"}}]};
      var xml = '<a ' + manipulate('x="1.234" y="It\'s"') + '/>';
      it('<a x="1.234" y="It\'s"/>', function () {
        expect(convert.js2xml(js, {compact: false, attributesFn: manipulateAttribute})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toContain({"X":"1.234","Y":"IT\'S"}, 'a', js.elements[0]);
      });

    });

  });

  describe('Adding function callbacks, options = {compact: true}', function () {

    describe('options = {doctypeFn: manipulate}', function () {

      var js = {"_doctype":"note [\n<!ENTITY foo \"baa\">]"};
      var xml = '<!DOCTYPE ' + manipulate('note [\n<!ENTITY foo "baa">]') + '>';
      it('<!DOCTYPE note [\\n<!ENTITY foo "baa">]>', function () {
        expect(convert.js2xml(js, {compact: true, doctypeFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toContain('note [\n<!ENTITY foo "baa">]', '_root_', js);
      });

    });

    describe('options = {instructionFn: manipulate}', function () {

      var js = {"_instruction":{"go": "there"}};
      var xml = '<?go ' + manipulate('there') + '?>';
      it('<?go there?>', function () {
        expect(convert.js2xml(js, {compact: true, instructionFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toContain('there', 'go', '_root_', js);
      });

    });

    describe('options = {cdataFn: manipulate}', function () {

      var js = {"_cdata":" \t <foo></bar> \t "};
      var xml = '<![CDATA[' + manipulate(' \t <foo></bar> \t ') + ']]>';
      it('<![CDATA[ \t <foo></bar> \t ]]>', function () {
        expect(convert.js2xml(js, {compact: true, cdataFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toContain(' \t <foo></bar> \t ', '_root_', js);
      });

    });

    describe('options = {commentFn: manipulate}', function () {

      var js = {"_comment":" \t Hello, World! \t "};
      var xml = '<!--' + manipulate(' \t Hello, World! \t ') + '-->';
      it('<!-- \t Hello, World! \t -->', function () {
        expect(convert.js2xml(js, {compact: true, commentFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toContain(' \t Hello, World! \t ', '_root_', js);
      });

    });

    describe('options = {textFn: manipulate}', function () {

      var js = {"a":{"_text":" \t Hi \t "}};
      var xml = '<a>' + manipulate(' \t Hi \t ') + '</a>';
      it('<a> \t Hi \t </a>', function () {
        expect(convert.js2xml(js, {compact: true, textFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toContain(' \t Hi \t ', 'a', js.a);
      });

    });

    describe('options = {instructionNameFn: manipulate}', function () {

      var js = {"_instruction":{"go": "there"}};
      var xml = '<?' + manipulate('go') + ' there?>';
      it('<?go there?>', function () {
        expect(convert.js2xml(js, {compact: true, instructionNameFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toContain('go', 'there', '_root_', js);
      });

    });

    describe('options = {elementNameFn: manipulate}', function () {

      var js = {"a":{_attributes:{"x":"hello"}}};
      var xml = '<' + manipulate('a') + ' x="hello"/>';
      it('<a x="hello"/>', function () {
        expect(convert.js2xml(js, {compact: true, elementNameFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toContain('a', js.a);
      });

    });

    describe('options = {attributeNameFn: manipulate}', function () {

      var js = {"a":{_attributes:{"x":"1.234","y":"It\'s"}}};
      var xml = '<a ' + manipulate('x') + '="1.234" ' + manipulate('y') + '="It\'s"/>';
      it('<a x="1.234" y="It\'s"/>', function () {
        expect(convert.js2xml(js, {compact: true, attributeNameFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toContain('y', 'It\'s', 'a', js.a);
      });

    });

    describe('options = {attributeValueFn: manipulate}', function () {

      var js = {"a":{_attributes:{"x":"1.234","y":"It\'s"}}};
      var xml = '<a x="' + manipulate('1.234') + '" y="' + manipulate('It\'s') + '"/>';
      it('<a x="1.234" y="It\'s"/>', function () {
        expect(convert.js2xml(js, {compact: true, attributeValueFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toContain('It\'s', 'y', 'a', js.a);
      });

    });

    describe('options = {attributesFn: manipulateAttribute}', function () {

      var js = {"a":{_attributes:{"x":"1.234","y":"It\'s"}}};
      var xml = '<a ' + manipulate('x="1.234" y="It\'s"') + '/>';
      it('<a x="1.234" y="It\'s"/>', function () {
        expect(convert.js2xml(js, {compact: true, attributesFn: manipulateAttribute})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toContain({"X":"1.234","Y":"IT\'S"}, 'a', js.a);
      });

    });

  });

  describe('options = {fullTagEmptyElementFn: fullTag}', function () {

    describe('options = {compact: false}', function () {

      var js = {"elements":[{"type":"element","name":"a"},{"type":"element","name":"b"}]};
      var xml = '<a/><b></b>';
      it('<a/><b/>', function () {
        expect(convert.js2xml(js, {compact: false, fullTagEmptyElementFn: fullTag})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toContain('b', js.elements[1]);
      });

    });

    describe('options = {compact: true}', function () {

      var js = {"a":{},"b":{}};
      var xml = '<a/><b></b>';
      it('<a/><b/>', function () {
        expect(convert.js2xml(js, {compact: true, fullTagEmptyElementFn: fullTag})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toContain('b', js.b);
      });

    });

  });

});

},{"../lib":3}],47:[function(require,module,exports){
var convert = require('../lib');
var Script = require('vm').Script;

/*global describe,it,expect*/

describe('Testing js2xml.js:', function () {

  describe('User reported issues:', function () {

    describe('case by Jan T. Sott', function () {
      // see https://github.com/nashwaan/xml-js/issues/2
      var js = {
        _comment: ' Released under The MIT License ',
        snippet: {
          content: {
            _cdata: 'console.log($1)'
          },
          tabTrigger: {
            _text: 'log'
          },
          scope: {
            _text: 'source.js'
          }
        }
      };
      var xml =
        '<!-- Released under The MIT License -->\n' +
        '<snippet>\n' +
        '\v<content><![CDATA[console.log($1)]]></content>\n' +
        '\v<tabTrigger>log</tabTrigger>\n' +
        '\v<scope>source.js</scope>\n' +
        '</snippet>';

      it('should output cdata and text unformatted', function () {
        expect(convert.js2xml(js, {compact: true})).toEqual(xml.replace(/\v|\n/g, ''));
      });

      it('should output cdata and text formatted', function () {
        expect(convert.js2xml(js, {compact: true, spaces: 4})).toEqual(xml.replace(/\v/g, '    '));
      });

    });

    describe('case 1 by Denis Carriere ', function () {
      // see https://github.com/nashwaan/xml-js/issues/5
      var js1 = {
        a: {
          b: {
            _text: 'foo bar'
          }
        }
      };
      var js2 = {
        elements: [{
          type: 'element',
          name: 'a',
          elements: [{
            type: 'element',
            name: 'b',
            elements: [{
              type: 'text',
              text: 'foo bar'
            }]
          }]
        }]
      };
      var xml = '<a>\n' +
        '\v<b>foo bar</b>\n' +
        '</a>';

      it('should output xml of compact js input', function () {
        expect(convert.js2xml(js1, {compact: true, spaces: 4})).toEqual(xml.replace(/\v/g, '    '));
      });

      it('should output xml of non-compact js input', function () {
        expect(convert.js2xml(js2, {compact: false, spaces: 4})).toEqual(xml.replace(/\v/g, '    '));
      });

    });

    describe('case 2 by Denis Carriere', function () {
      // see https://github.com/nashwaan/xml-js/issues/13
      var json =  {
        "_declaration": {
          "_attributes": {
            "version": "1.0",
            "encoding": "utf-8"
          }
        },
        "ServiceExceptionReport": {
          "_attributes": {
            "version": "1.1.1"
          },
          "_doctype": 'ServiceExceptionReport SYSTEM "http://schemas.opengis.net/wms/1.1.1/exception_1_1_1.dtd"',
          "ServiceException": {
            "_text": "foo"
          }
        }
      };
      var xml =
        '<?xml version="1.0" encoding="utf-8"?>\n' +
        '<ServiceExceptionReport version="1.1.1">\n' +
        '  <!DOCTYPE ServiceExceptionReport SYSTEM "http://schemas.opengis.net/wms/1.1.1/exception_1_1_1.dtd">\n' +
        '  <ServiceException>foo</ServiceException>\n' +
        '</ServiceExceptionReport>';

      it('should output as expected xml', function () {
        expect(convert.js2xml(json, {compact: true, spaces: 2})).toEqual(xml);
      });

    });

    describe('case 1 by Henning Hagmann ', function () {
      // see https://github.com/nashwaan/xml-js/issues/14
      var js = {
        _declaration: {
          _attributes: {
            version: '1.0'
          }
        },
        group: {
          name: {
            _cdata: 'An example name'
          }
        }
      };
      var xml = '<?xml version="1.0"?>\n' +
        '<group>\n' +
        '\v<name><![CDATA[An example name]]></name>\n' +
        '</group>';

      it('should output cdata without proceeding indentation', function () {
        expect(convert.js2xml(js, {compact: true, spaces: 4, fullTagEmptyElement: true})).toEqual(xml.replace(/\v/g, '    '));
      });

    });

    describe('case 2 by Henning Hagmann ', function () {
      // see https://github.com/nashwaan/xml-js/issues/14
      var js = {
        declaration: {
          attributes: {
            version: '1.0'
          }
        },
        elements: [{
          type: 'element',
          name: 'group',
          elements: [{
            type: 'element',
            name: 'name',
            elements: [{
              type: 'text',
              text: 'The url '
            }, {
              type: 'cdata',
              cdata: 'http://www.test.com'
            }, {
              type: 'text',
              text: ' and name '
            }, {
              type: 'cdata',
              cdata: 'examplename'
            }, {
              type: 'text',
              text: ' are wrapped'
            }]
          }]
        }]
      };
      var xml = '<?xml version="1.0"?>\n' +
        '<group>\n' +
        '\v<name>The url <![CDATA[http://www.test.com]]> and name <![CDATA[examplename]]> are wrapped</name>\n' +
        '</group>';

      it('should output cdata without proceeding indentation', function () {
        expect(convert.js2xml(js, {compact: false, spaces: 4})).toEqual(xml.replace(/\v/g, '    '));
      });

    });

    describe('case by John ', function () {
      // see https://github.com/nashwaan/xml-js/issues/20
      // var js = {
      //     request: {
      //         user: 'username',
      //         pass: 'password',
      //         numbers: {
      //             number: 1,
      //             number: 2
      //         }
      //     }
      // };
      var js = {
        request: {
          user: {
            _text: 'username'
          },
          pass: {
            _text: 'password'
          },
          numbers: {
            number: [
              {
                _text: 1
              },
              {
                _text: 2
              }
            ]
          }
        }
      };
      var xml =
        '<request>\n' +
        '\v<user>username</user>\n' +
        '\v<pass>password</pass>\n' +
        '\v<numbers>\n' +
        '\v\v<number>1</number>\n' +
        '\v\v<number>2</number>\n' +
        '\v</numbers>\n' +
        '</request>';

      it('should convert javascript object to xml correctly', function () {
        expect(convert.js2xml(js, {spaces: 4, compact: true})).toEqual(xml.replace(/\v/g, '    '));
        // expect(convert.xml2js(xml, {compact: true, nativeType: true})).toEqual(js);
      });

    });

    describe('case by yverenoir', function () {
      // see https://github.com/nashwaan/xml-js/issues/21
      // var js = {
      //     "vertical": {
      //         "-display_name": "Exercise",
      //         "html": {
      //             "-url_name": "12345"
      //         },
      //         "lti_consumer": {
      //             "-url_name": "12345",
      //             "-xblock-family": "xblock.v1",
      //             "-accept_grades_past_due": "false",
      //             "-weight": "14.0",
      //             "-has_score": "true",
      //             "-display_name": "Exercise",
      //             "-ask_to_send_username": "true",
      //             "-ask_to_send_email": "true",
      //             "-button_text": "Launch Exercise",
      //             "-custom_parameters": "none",
      //             "-lti_id": "id",
      //             "-launch_target": "new_window",
      //             "-launch_url": "url"
      //         }
      //     }
      // };
      var js = {
        "vertical": {
          "_attributes": {
            "-display_name": "Exercise"
          },
          "html": {
            "_attributes": {
              "-url_name": "12345"
            }
          },
          "lti_consumer": {
            "_attributes": {
              "-url_name": "12345",
              "-xblock-family": "xblock.v1",
              "-accept_grades_past_due": "false",
              "-weight": "14.0",
              "-has_score": "true",
              "-display_name": "Exercise",
              "-ask_to_send_username": "true",
              "-ask_to_send_email": "true",
              "-button_text": "Launch Exercise",
              "-custom_parameters": "none",
              "-lti_id": "id",
              "-launch_target": "new_window",
              "-launch_url": "url"
            }
          }
        }
      };
      var xml =
        '<vertical -display_name="Exercise">\n' +
        '\v<html -url_name="12345"/>\n' +
        '\v<lti_consumer -url_name="12345" -xblock-family="xblock.v1" -accept_grades_past_due="false" -weight="14.0" -has_score="true" -display_name="Exercise" -ask_to_send_username="true" -ask_to_send_email="true" -button_text="Launch Exercise" -custom_parameters="none" -lti_id="id" -launch_target="new_window" -launch_url="url"/>\n' +
        '</vertical>';

      it('should convert javascript object to xml correctly', function () {
        expect(convert.js2xml(js, {spaces: 4, compact: true})).toEqual(xml.replace(/\v/g, '    '));
      });

    });

    describe('case by mariotsi ', function () {
      // see https://github.com/nashwaan/xml-js/issues/28
      var js = {
        a: {
          _attributes: {
            num: 123
          }
        }
      };
      var xml = '<a num="123"/>';

      it('should process attribute number without issue', function () {
        expect(convert.js2xml(js, {compact: true})).toEqual(xml);
      });

    });

    describe('case by zaesnet ', function () {
      // see https://github.com/nashwaan/xml-js/issues/30
      var js = {
        a: {_text:'Hi There'}
      };
      var xml = '<a>Hi There</a>';
      it('should convert js object to xml', function () {
        expect(convert.js2xml(js, {spaces: 3, fullTagEmptyElement: true, compact: true})).toEqual(xml);
      });

    });

    describe('case by kolis ', function () {
      // see https://github.com/nashwaan/xml-js/issues/31
      var js = {
        parent: {
          _attributes: {
            bar: 1,
            baz: 'hello'
          },
          child: {
            _attributes: {
              attr1: 'a',
              attr2: 'b'
            }
          }
        }
      };
      var xml =
      '<parent\n' +
      '\vbar=1\n' +
      '\vbaz="hello"\n' +
      '>\n' +
      '\v<child\n' +
      '\v\vattr1="a"\n' +
      '\v\vattr2="b"\n' +
      '\v/>\n' +
      '</parent>';
      it('should be able to indent attributes', function () {
        expect(convert.js2xml(js, {indentAttributes: true, spaces: 2, compact: true})).toEqual(xml.replace(/\v/g, '  ').replace('=1', '="1"'));
      });
      it('should be able to indent attributes and no quotes for native attributes', function () {
        expect(convert.js2xml(js, {indentAttributes: true, spaces: 2, compact: true, noQuotesForNativeAttributes: true})).toEqual(xml.replace(/\v/g, '  '));
      });

    });

    describe('case by techborn ', function () {
      // see https://github.com/nashwaan/xml-js/pull/32
      // var js = {
      //     example: {
      //         _text: 'value'
      //     }
      // };
      var js = {
        example: 'value'
      };
      var xml = '<example>value</example>';
      it('should convert element text without _text property', function () {
        expect(convert.js2xml(js, {compact: true})).toEqual(xml);
      });

    });

    describe('case by silentgert', function() {
      // see https://github.com/nashwaan/xml-js/issues/42
      var context = {
        convert: convert,
        output: undefined,
      };
      var scriptCode =
      '(function() {\n' +
      '  const obj = {\n' +
      '    customers : {\n' +
      '      customer: [\n' +
      '        {\n' +
      '          _text: \'John Doe\',\n' +
      '          _attributes: {\n' +
      '            status: \'silver\'\n' +
      '          }\n' +
      '        },\n' +
      '        {\n' +
      '          _text: \'Alice Allgood\',\n' +
      '          _attributes: {\n' +
      '            status: \'gold\'\n' +
      '          }\n' +
      '        }\n' +
      '      ]\n' +
      '    }\n' +
      '  };\n' +
      '  output = convert.js2xml(obj, { compact: true });\n' +
      '})()\n';

      var executableScript = new Script(scriptCode, {
        displayErrors: true,
      });

      it ('should convert Arrays in a different context', function() {
        executableScript.runInNewContext(context);
        expect(context.output).toEqual('<customers><customer status="silver">John Doe</customer><customer status="gold">Alice Allgood</customer></customers>');
      });
    });


  });

});

},{"../lib":3,"vm":40}],48:[function(require,module,exports){
(function (Buffer){
var convert = require('../lib');
var testItems = require('./test-items');

/*global describe,it,expect*/

describe('Testing js2xml.js:', function () {

  describe('No options supplied (fallback to defaults):', function () {

    var options = {};
    testItems('js2xml', options).forEach(function (test) {
      it(test.desc, function () {
        expect(convert.js2xml(test.js, options)).toEqual(test.xml);
      });
    });

  });

  describe('options = {compact: false}', function () {

    describe('Options set to default values explicitly:', function () {

      var options = {compact: false, spaces: 0, ignoreText: false, ignoreComment: false, ignoreCdata: false, fullTagEmptyElement: false};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 4}', function () {

      var options = {spaces: 4, onlyItem: 8};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0}', function () {

      var options = {spaces: 0};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0, ignoreText: true}', function () {

      var options = {spaces: 0, ignoreText: true};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0, ignoreComment: true}', function () {

      var options = {spaces: 0, ignoreComment: true};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0, ignoreCdata: true}', function () {

      var options = {spaces: 0, ignoreCdata: true};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0, ignoreDoctype: true}', function () {

      var options = {spaces: 0, ignoreDoctype: true};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0, ignoreDeclaration: true}', function () {

      var options = {spaces: 0, ignoreDeclaration: true};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0, ignoreInstruction: true}', function () {

      var options = {spaces: 0, ignoreInstruction: true};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0, fullTagEmptyElement: true}', function () {

      var options = {spaces: 0, fullTagEmptyElement: true};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

  });

  describe('options = {compact: true}', function () {

    describe('Options set to default values explicitly:', function () {

      var options = {compact: true, spaces: 0, ignoreText: false, ignoreComment: false, ignoreCdata: false, fullTagEmptyElement: false};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 4}', function () {

      var options = {compact: true, spaces: 4};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0}', function () {

      var options = {compact: true, spaces: 0};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0, ignoreText: true}', function () {

      var options = {compact: true, spaces: 0, ignoreText: true};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0, ignoreComment: true}', function () {

      var options = {compact: true, spaces: 0, ignoreComment: true};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0, ignoreCdata: true}', function () {

      var options = {compact: true, spaces: 0, ignoreCdata: true};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0, ignoreDoctype: true}', function () {

      var options = {compact: true, spaces: 0, ignoreDoctype: true};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0, ignoreDeclaration: true}', function () {

      var options = {compact: true, spaces: 0, ignoreDeclaration: true};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0, ignoreInstruction: true}', function () {

      var options = {compact: true, spaces: 0, ignoreInstruction: true};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0, fullTagEmptyElement: true}', function () {

      var options = {compact: true, spaces: 0, fullTagEmptyElement: true};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

  });

  describe('Varying spaces', function () {

    describe('options = {}', function () {

      var options = {};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: true}', function () {

      var options = {spaces: true};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 2}', function () {

      var options = {spaces: 2};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 4}', function () {

      var options = {spaces: 4};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: \'  \'}', function () {

      var options = {spaces: '  '};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: \\t}', function () {

      var options = {spaces: '\t'};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

  });

  describe('json2xml:', function () {

    describe('using default options', function () {

      var options = {};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.json2xml(JSON.stringify(test.js), options)).toEqual(test.xml);
        });
      });

    });

    describe('submitting json as javascript object', function () {

      var options = {};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.json2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('using buffer', function () {

      var options = {};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.json2xml(new Buffer(JSON.stringify(test.js)), options)).toEqual(test.xml);
        });
      });

    });

    describe('improper json', function () {

      try {
        convert.json2xml('{a:', {});
      } catch (e) {
        e.note = 'ignore me';
      }

    });

  });

  describe('Various options:', function () {

    describe('options = {instructionHasAttributes: true}', function () {

      it('Write processing instruction attributes, {compact: true}', function () {
        expect(convert.js2xml({"_instruction":{"go":{"_attributes":{"to":"there"}}}}, {compact: true})).toEqual('<?go to="there"?>');
      });

      it('Write processing instruction attributes, {compact: false}', function () {
        expect(convert.js2xml({"elements":[{"type":"instruction","name":"go","attributes":{"to":"there"}}]})).toEqual('<?go to="there"?>');
      });

    });

  });

});

}).call(this,require("buffer").Buffer)
},{"../lib":3,"./test-items":50,"buffer":11}],49:[function(require,module,exports){
var helper = require('../lib/options-helper');

/*global describe,it,expect*/

describe('Testing options.js:', function () {

  describe('Helpers:', function () {

    describe('Copy options:', function () {

      it('Copy unprovided options', function () {
        expect(helper.copyOptions()).toEqual({});
      });

      it('Copy provided options', function () {
        var options = {ignoreText: true, textKey: true};
        expect(helper.copyOptions(options)).toEqual(options);
      });

    });

    describe('Ensure flag existance:', function () {

      it('New flag', function () {
        var options = {};
        helper.ensureFlagExists('foo', options);
        expect(options).toEqual({foo: false});
      });

      it('Existing flag, not boolean', function () {
        var options = {foo: 123};
        helper.ensureFlagExists('foo', options);
        expect(options).toEqual({foo: false});
      });

      it('Existing flag', function () {
        var options = {foo: true};
        helper.ensureFlagExists('foo', options);
        expect(options).toEqual({foo: true});
      });

    });

    describe('Ensure key existance:', function () {

      it('New key', function () {
        var options = {};
        helper.ensureKeyExists('foo', options);
        expect(options).toEqual({fooKey: 'foo'});
      });

      it('Existing key, not string', function () {
        var options = {fooKey: 123};
        helper.ensureKeyExists('foo', options);
        expect(options).toEqual({fooKey: 'foo'});
      });

      it('Existing key, string', function () {
        var options = {fooKey: 'baa'};
        helper.ensureKeyExists('foo', options);
        expect(options).toEqual({fooKey: 'baa'});
      });

    });

  });

});

},{"../lib/options-helper":6}],50:[function(require,module,exports){
var isArray = require('../lib/array-helper').isArray;

var cases = [
  {
    desc: 'declaration <?xml>',
    xml: '<?xml?>',
    js1: {"_declaration":{}},
    js2: {"declaration":{}}
  }, {
    desc: 'declaration with attributes',
    xml: '<?xml version="1.0" encoding="utf-8"?>',
    js1: {"_declaration":{"_attributes":{"version":"1.0","encoding":"utf-8"}}},
    js2: {"declaration":{"attributes":{"version":"1.0","encoding":"utf-8"}}}
  }, {
    desc: 'declaration and element',
    xml: '<?xml?>\n<a/>',
    js1: {"_declaration":{},"a":{}},
    js2: {"declaration":{},"elements":[{"type":"element","name":"a"}]}
  }, {
    desc: 'declaration and elements',
    xml: '<?xml?>\n<a>\n\v<b/>\n</a>',
    js1: {"_declaration":{},"a":{"b":{}}},
    js2: {"declaration":{},"elements":[{"type":"element","name":"a","elements":[{"type":"element","name":"b"}]}]}
  }, {
    desc: 'processing instruction <?go there?>',
    xml: '<?go there?>',
    js1: {"_instruction":{"go": "there"}},
    js2: {"elements":[{"type":"instruction","name":"go","instruction":"there"}]}
  }, {
    desc: '2 processing instructions <?go there?><?come here?>',
    xml: '<?go there?><?come here?>',
    js1: {"_instruction":[{"go": "there"},{"come": "here"}]},
    js2: {"elements":[{"type":"instruction","name":"go","instruction":"there"},{"type":"instruction","name":"come","instruction":"here"}]}
  }, {
    desc: 'should convert comment',
    xml: '<!-- \t Hello, World! \t -->',
    js1: {"_comment":" \t Hello, World! \t "},
    js2: {"elements":[{"type":"comment","comment":" \t Hello, World! \t "}]}
  }, {
    desc: 'should convert 2 comments',
    xml: '<!-- \t Hello \t -->\n<!-- \t World \t -->',
    js1: {"_comment":[" \t Hello \t "," \t World \t "]},
    js2: {"elements":[{"type":"comment","comment":" \t Hello \t "},{"type":"comment","comment":" \t World \t "}]}
  }, {
    desc: 'should convert cdata',
    xml: '<![CDATA[ \t <foo></bar> \t ]]>',
    js1: {"_cdata":" \t <foo></bar> \t "},
    js2: {"elements":[{"type":"cdata","cdata":" \t <foo></bar> \t "}]}
  }, {
    desc: 'should convert 2 cdata',
    xml: '<![CDATA[ \t data]]><![CDATA[< > " and & \t ]]>',
    js1: {"_cdata":[" \t data", "< > \" and & \t "]},
    js2: {"elements":[{"type":"cdata","cdata":" \t data"},{"type":"cdata","cdata":"< > \" and & \t "}]}
  }, {
    desc: 'should convert doctype',
    xml: '<!DOCTYPE note [\n<!ENTITY foo "baa">]>',
    js1: {"_doctype":"note [\n<!ENTITY foo \"baa\">]"},
    js2: {"elements":[{"type":"doctype","doctype":"note [\n<!ENTITY foo \"baa\">]"}]}
  }, {
    desc: 'should convert element',
    xml: '<a/>',
    js1: {"a":{}},
    js2: {"elements":[{"type":"element","name":"a"}]}
  }, {
    desc: 'should convert 2 same elements',
    xml: '<a/>\n<a/>',
    js1: {"a":[{},{}]},
    js2: {"elements":[{"type":"element","name":"a"},{"type":"element","name":"a"}]}
  }, {
    desc: 'should convert 2 different elements',
    xml: '<a/>\n<b/>',
    js1: {"a":{},"b":{}},
    js2: {"elements":[{"type":"element","name":"a"},{"type":"element","name":"b"}]}
  }, {
    desc: 'should convert attribute',
    xml: '<a x="hello"/>',
    js1: {"a":{_attributes:{"x":"hello"}}},
    js2: {"elements":[{"type":"element","name":"a","attributes":{"x":"hello"}}]}
  }, {
    desc: 'should convert 2 attributes',
    xml: '<a x="1.234" y="It\'s"/>',
    js1: {"a":{_attributes:{"x":"1.234","y":"It\'s"}}},
    js2: {"elements":[{"type":"element","name":"a","attributes":{"x":"1.234","y":"It\'s"}}]}
  }, {
    desc: 'should convert text in element',
    xml: '<a> \t Hi \t </a>',
    js1: {"a":{"_text":" \t Hi \t "}},
    js2: {"elements":[{"type":"element","name":"a","elements":[{"type":"text","text":" \t Hi \t "}]}]}
  }, {
    desc: 'should convert multi-line text',
    xml: '<a>  Hi \n There \t </a>',
    js1: {"a":{"_text":"  Hi \n There \t "}},
    js2: {"elements":[{"type":"element","name":"a","elements":[{"type":"text","text":"  Hi \n There \t "}]}]}
  }, {
    desc: 'should convert nested elements',
    xml: '<a>\n\v<b/>\n</a>',
    js1: {"a":{"b":{}}},
    js2: {"elements":[{"type":"element","name":"a","elements":[{"type":"element","name":"b"}]}]}
  }, {
    desc: 'should convert 3 nested elements',
    xml: '<a>\n\v<b>\n\v\v<c/>\n\v</b>\n</a>',
    js1: {"a":{"b":{"c":{}}}},
    js2: {"elements":[{"type":"element","name":"a","elements":[{"type":"element","name":"b","elements":[{"type":"element","name":"c"}]}]}]}
  }

  // todo alwaysArray array case
];

module.exports = function (direction, options) {
  var i, tests = [];
  options = options || {};
  function applyOptions (obj, pathKey) {
    var key, fullKey;
    pathKey = pathKey || '';
    if (obj instanceof Array) {
      obj = obj.filter(function (el) {
        return !(options.ignoreText && el.type === 'text' || options.ignoreComment && el.type === 'comment' || options.ignoreCdata && el.type === 'cdata'
        || options.ignoreDoctype && el.type === 'doctype' || options.ignoreDeclaration && el.type === 'declaration' || options.ignoreInstruction && el.type === 'instruction');
      }).map(function (el) {
        return manipulate(el, pathKey);
      });
    } else if (typeof obj === 'object') {
      for (key in obj) {
        fullKey = (pathKey ? pathKey + '.' : '') + key;
        if (
          options.compact &&
          (isArray(options.alwaysArray) ? options.alwaysArray.indexOf(key) !== -1 : options.alwaysArray) &&
          !(obj[key] instanceof Array) &&
          key !== '_declaration' &&
          (key === '_instruction' || fullKey.indexOf('_instruction') < 0) &&
          fullKey.indexOf('_attributes') < 0
        ) {
          obj[key] = [obj[key]];
        }
        key = applyNameCallbacks(obj, key, pathKey.split('.').pop());
        key = applyAttributesCallback(obj, key, pathKey.split('.').pop());
        if (key.indexOf('_') === 0 && obj[key] instanceof Array) {
          obj[key] = obj[key].map(function (el) {
            return manipulate(el, fullKey);
          });
        } else {
          if (key !== 'parent' && key !== '_parent') {
            obj[key] = manipulate(obj[key], fullKey);
            if (obj[key] instanceof Array && obj[key].length === 0) {
              delete obj[key];
            }
          }
        }
        if (options.addParent /*&& key.indexOf('declaration') === -1*/ && key.indexOf('attributes') === -1 && key.indexOf('instruction') === -1) {
          if (obj[key] instanceof Array) {
            obj[key].forEach(function (el) {
              if (options.compact) { if (typeof el === 'object') el._parent = obj; } else { el.parent = obj; }
            });
          } else if (typeof obj[key] === 'object') {
            if (options.compact) { if (typeof obj[key] === 'object') obj[key]._parent = obj; } else { obj[key].parent = obj; }
          }
        }
        if (options.ignoreText && key === '_text' || options.ignoreComment && key === '_comment' || options.ignoreCdata && key === '_cdata'
        || options.ignoreDoctype && key === '_doctype' || options.ignoreDeclaration && (key === '_declaration' || key === 'declaration') || options.ignoreInstruction && key === '_instruction') {
          delete obj[key];
        }
      }
      if (!options.compact && options.addParent && obj.elements) {
        obj.elements.forEach(function (el) {
          el.parent = obj;
        });
      }
      if (!options.compact && options.alwaysChildren && obj.type === 'element' && !obj.elements) {
        obj.elements = [];
      }
      // if (!options.compact && options.trim && obj.type in obj) {
      //     obj[obj.type] = obj[obj.type].trim();
      // }
    }
    return obj;
    function manipulate(x, fullKey) {
      if (x instanceof Array) {
        return applyOptions(x, fullKey);
      } if (typeof x === 'object') {
        return applyOptions(x, fullKey);
      } else if (typeof x === 'string') {
        x = applyValueCallbacks(x, fullKey.split('.').pop(), fullKey.split('.')[fullKey.split('.').length - 2] || '');
        return options.trim? x.trim() : x;
      } else if (typeof x === 'number' || typeof x === 'boolean') {
        return options.nativeType? x.toString() : x;
      } else {
        return x;
      }
    }
  }
  function applyKeyNames(js) {
    var key;
    for (key in options) {
      if (key.match(/Key$/)) {
        var keyName = (options.compact ? '_' : '') + key.replace('Key', '');
        js = JSON.parse(JSON.stringify(js).replace(new RegExp('"' + keyName + '":', 'g'), '"' + options[key] + '":'));
      }
    }
    return js;
  }
  function applyNameCallbacks(obj, key, parentKey) {
    if ('instructionNameFn' in options && (options.compact && parentKey === '_instruction' || !options.compact && obj.type === 'instruction')
      || 'elementNameFn' in options && (options.compact && key.indexOf('_') < 0 && parentKey !== '_attributes' && parentKey !== '_instruction' || !options.compact && obj.type === 'element')) {
      if (options.compact) {
        var temp = obj[key];
        delete obj[key];
        key = 'elementNameFn' in options ? options.elementNameFn(key) : options.instructionNameFn(key);
        obj[key] = temp;
      } else {
        obj.name = 'elementNameFn' in options ? options.elementNameFn(obj.name) : options.instructionNameFn(obj.name);
      }
    }
    return key;
  }
  function applyAttributesCallback(obj, key, parentKey) {
    if (('attributeNameFn' in options || 'attributeValueFn' in options) && (parentKey === '_attributes' || parentKey === 'attributes')) {
      if ('attributeNameFn' in options) {
        var temp = obj[key];
        delete obj[key];
        key = options.attributeNameFn(key);
        obj[key] = temp;
      }
      if ('attributeValueFn' in options) {
        obj[key] = options.attributeValueFn(obj[key]);
      }
    }
    if ('attributesFn' in options && (key === '_attributes' || key === 'attributes')) {
      obj[key] = options.attributesFn(obj[key]);
    }
    return key;
  }
  function applyValueCallbacks(value, key, parentKey) {
    var fn;
    for (fn in options) {
      if (fn.match(/Fn$/) && !fn.match(/NameFn$/)) {
        var callbackName = (options.compact ? '_' : '') + fn.replace('Fn', '');
        if (key === callbackName || parentKey === callbackName) {
          value = options[fn](value);
        }
      }
    }
    return value;
  }
  for (i = 0; i < cases.length; ++i) {
    tests.push({desc: cases[i].desc, xml: null, js: null});
    tests[i].js = options.compact ? cases[i].js1 : cases[i].js2;
    tests[i].xml = cases[i].xml;
    if (direction === 'xml2js') {
      tests[i].js = applyOptions(JSON.parse(JSON.stringify(tests[i].js)));
      tests[i].js = applyKeyNames(tests[i].js);
    } else if (direction === 'js2xml') {
      if (!('spaces' in options) || options.spaces === 0 || typeof options.spaces === 'boolean') { tests[i].xml = tests[i].xml.replace(/>\n\v*/gm, '>'); }
      if ('spaces' in options && options.spaces !== 0 && typeof options.spaces === 'number') { tests[i].xml = tests[i].xml.replace(/\v/g, Array(options.spaces + 1).join(' ')); }
      if ('spaces' in options && typeof options.spaces === 'string') { tests[i].xml = tests[i].xml.replace(/\v/g, options.spaces); }
      if (options.ignoreText) { tests[i].xml = tests[i].xml.replace(/>([\s\S]*?)</gm, '><'); }
      if (options.ignoreComment) { tests[i].xml = tests[i].xml.replace(/<!--.*?-->/gm, ''); }
      if (options.ignoreCdata) { tests[i].xml = tests[i].xml.replace(/<!\[CDATA\[.*?\]\]>/gm, ''); }
      if (options.ignoreDoctype) { tests[i].xml = tests[i].xml.replace(/<!DOCTYPE[\s\S]*>/gm, ''); }
      if (options.ignoreDeclaration) { tests[i].xml = tests[i].xml.replace(/<\?xml[\s\S]*\?>/gm, ''); }
      if (options.ignoreInstruction) { tests[i].xml = tests[i].xml.replace(/<\?(?!xml)[\s\S]*\?>/gm, ''); }
      if (options.fullTagEmptyElement) { tests[i].xml = tests[i].xml.replace('<a/>', '<a></a>').replace('<b/>', '<b></b>').replace('<c/>', '<c></c>').replace('/>', '></a>'); }
    }
  }
  if ('onlyItem' in options) {
    tests = [tests[options.onlyItem]];
  }
  return tests;
};

},{"../lib/array-helper":2}],51:[function(require,module,exports){
var convert = require('../lib');
var testItems = require('./test-items');

/*global describe,it,expect*/

var args;

function manipulate(val) {
  args = arguments;
  args[0] = val.toUpperCase();
  return val.toUpperCase();
}

function manipulateAttribute(obj) {
  args = arguments;
  var key, temp;
  for (key in obj) {
    try {
      temp = obj[key];
      delete obj[key];
      obj[key.toUpperCase()] = temp.toUpperCase();
    } catch (e) {}
  }
  return obj;
}

describe('Testing xml2js.js:', function () {

  describe('Adding function callbacks, options = {compact: false}', function () {

    describe('options = {doctypeFn: manipulate}', function () {

      var options = {compact: false, doctypeFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
        if (test.js.elements && test.js.elements[0].doctype) {
          it('should provide correct arguments', function () {
            expect(args).toContain(test.js.elements[test.js.elements.length-1].doctype, test.js);
          });
        }
      });

    });

    describe('options = {instructionFn: manipulate}', function () {

      var options = {compact: false, instructionFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
          // console.log(JSON.stringify(convert.xml2js(test.xml, options)));
        });
        if (test.js.elements && test.js.elements[0].instruction) {
          it('should provide correct arguments', function () {
            expect(args).toContain(test.js.elements[test.js.elements.length-1].instruction, test.js);
            // console.log(JSON.stringify(args), '---------', test.js.elements[0].instruction);
          });
        }
      });

    });

    describe('options = {cdataFn: manipulate}', function () {

      var options = {compact: false, cdataFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
        if (test.js.elements && test.js.elements[0].cdata) {
          it('should provide correct arguments', function () {
            expect(args).toContain(test.js.elements[test.js.elements.length-1].cdata, test.js);
          });
        }
      });

    });

    describe('options = {commentFn: manipulate}', function () {

      var options = {compact: false, commentFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
        if (test.js.elements && test.js.elements[0].comment) {
          it('should provide correct arguments', function () {
            expect(args).toContain(test.js.elements[test.js.elements.length-1].comment, test.js);
          });
        }
      });

    });

    describe('options = {textFn: manipulate}', function () {

      var options = {compact: false, textFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
        if (test.js.elements && test.js.elements[0].text) {
          it('should provide correct arguments', function () {
            expect(args).toContain(test.js.elements[test.js.elements.length-1].text, test.js);
          });
        }
      });

    });

    describe('options = {instructionNameFn: manipulate}', function () {

      var options = {compact: false, instructionNameFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
        if (test.js.elements && test.js.elements[0].instruction) {
          it('should provide correct arguments', function () {
            expect(args).toContain(test.js.elements[test.js.elements.length-1].name, test.js);
          });
        }
      });

    });

    describe('options = {elementNameFn: manipulate}', function () {

      var options = {compact: false, elementNameFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
        if (test.js.elements && test.js.elements[test.js.elements.length-1].type === 'element' && !test.js.elements[test.js.elements.length-1].elements) {
          it('should provide correct arguments', function () {
            expect(args).toContain(test.js.elements[test.js.elements.length-1].name, test.js);
          });
        }
      });

    });

    describe('options = {attributeNameFn: manipulate}', function () {

      var options = {compact: false, attributeNameFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {attributeValueFn: manipulate}', function () {

      var options = {compact: false, attributeValueFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {attributesFn: manipulateAttribute}', function () {

      var options = {compact: false, attributesFn: manipulateAttribute};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
        if (test.js.elements && test.js.elements[test.js.elements.length-1].attributes) {
          it('should provide correct arguments', function () {
            expect(args).toContain(test.js.elements[test.js.elements.length-1].attributes, test.js);
          });
        }
      });

    });

    describe('options = {doctypeFn: manipulate, instructionFn: manipulate, cdataFn: manipulate, commentFn: manipulate, textFn: manipulate}', function () {

      var options = {compact: false, doctypeFn: manipulate, instructionFn: manipulate, cdataFn: manipulate, commentFn: manipulate, textFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {instructionNameFn: manipulate, elementNameFn: manipulate, attributeNameFn: manipulate, attributeValueFn: manipulate}', function () {

      var options = {compact: false, instructionNameFn: manipulate, elementNameFn: manipulate, attributeNameFn: manipulate, attributeValueFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

  });

  describe('Adding function callbacks, options = {compact: true}', function () {

    describe('options = {doctypeFn: manipulate}', function () {

      var options = {compact: true, doctypeFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
        if (test.js._doctype) {
          it('should provide correct arguments', function () {
            expect(args).toContain(test.js._doctype instanceof Array ? test.js._doctype[1] : test.js._doctype, test.js);
          });
        }
      });

    });

    describe('options = {instructionFn: manipulate}', function () {

      var options = {compact: true, instructionFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {cdataFn: manipulate}', function () {

      var options = {compact: true, cdataFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
        if (test.js._cdata) {
          it('should provide correct arguments', function () {
            expect(args).toContain(test.js._cdata instanceof Array ? test.js._cdata[1] : test.js._cdata, test.js);
          });
        }
      });

    });

    describe('options = {commentFn: manipulate}', function () {

      var options = {compact: true, commentFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
        if (test.js._comment) {
          it('should provide correct arguments', function () {
            expect(args).toContain(test.js._comment instanceof Array ? test.js._comment[1] : test.js._comment, test.js);
          });
        }
      });

    });

    describe('options = {textFn: manipulate}', function () {

      var options = {compact: true, textFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
        if (test.js.a && test.js.a._text) {
          it('should provide correct arguments', function () {
            expect(args).toContain(test.js.a._text, test.js.a);
          });
        }
      });

    });

    describe('options = {instructionNameFn: manipulate}', function () {

      var options = {compact: true, instructionNameFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {elementNameFn: manipulate}', function () {

      var options = {compact: true, elementNameFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {attributeNameFn: manipulate}', function () {

      var options = {compact: true, attributeNameFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {attributeValueFn: manipulate}', function () {

      var options = {compact: true, attributeValueFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {attributesFn: manipulateAttribute}', function () {

      var options = {compact: true, attributesFn: manipulateAttribute};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
        if (test.js.a && test.js.a._attributes) {
          it('should provide correct arguments', function () {
            expect(args).toContain(test.js.a._attributes, test.js);
          });
        }
      });

    });

    describe('options = {doctypeFn: manipulate, instructionFn: manipulate, cdataFn: manipulate, commentFn: manipulate, textFn: manipulate}', function () {

      var options = {compact: true, doctypeFn: manipulate, instructionFn: manipulate, cdataFn: manipulate, commentFn: manipulate, textFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {instructionNameFn: manipulate, elementNameFn: manipulate, attributeNameFn: manipulate, attributeValueFn: manipulate}', function () {

      var options = {compact: true, instructionNameFn: manipulate, elementNameFn: manipulate, attributeNameFn: manipulate, attributeValueFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

  });

});

},{"../lib":3,"./test-items":50}],52:[function(require,module,exports){
var convert = require('../lib');

/*global describe,it,expect*/

describe('Testing xml2js.js:', function () {

  describe('User reported issues on github:', function () {

    describe('case by Mark Pareja', function () {
      // see https://github.com/nashwaan/xml-js/issues/3
      var xml =
        '<?xml version="1.0" encoding="utf-8"?>\n' +
        '<dp:ListServicesReply ReturnCode="0" xmlns:dp="http://www.cisco.com/vtg/diagnosticportal">\n' +
        '  <dp:Schema Version="1.0" />\n' +
        '  <dp:ServiceList>\n' +
        '    <dp:Service Name="Cisco ICM usgd1 LoggerA" Description="Provides Call Logging services for Instance usgd1" Status="Running" StartupType="Auto" LogOnAs="****" />\n' +
        '    <dp:Service Name="Cisco ICM Diagnostic Framework" Description="Provides a web-based diagnostic service for Cisco Unified ICM, Contact Center Enterprise application." Status="Running" StartupType="Auto" LogOnAs="LocalSystem" />\n' +
        '  </dp:ServiceList>\n' +
        '</dp:ListServicesReply>';
      var json = {
        "_declaration": {
          "_attributes": {
            "version": "1.0",
            "encoding": "utf-8"
          }
        },
        "dp:ListServicesReply": {
          "_attributes": {
            "ReturnCode": "0",
            "xmlns:dp": "http://www.cisco.com/vtg/diagnosticportal"
          },
          "dp:Schema": {
            "_attributes": {
              "Version": "1.0"
            }
          },
          "dp:ServiceList": {
            "dp:Service": [
              {
                "_attributes": {
                  "Name": "Cisco ICM usgd1 LoggerA",
                  "Description": "Provides Call Logging services for Instance usgd1",
                  "Status": "Running",
                  "StartupType": "Auto",
                  "LogOnAs": "****"
                }
              },
              {
                "_attributes": {
                  "Name": "Cisco ICM Diagnostic Framework",
                  "Description": "Provides a web-based diagnostic service for Cisco Unified ICM, Contact Center Enterprise application.",
                  "Status": "Running",
                  "StartupType": "Auto",
                  "LogOnAs": "LocalSystem"
                }
              }
            ]
          }
        }
      };

      it('should output as expected json', function () {
        expect(convert.xml2json(xml, {compact: true})).toEqual(JSON.stringify(json));
      });

    });

    describe('case by Félix Dion Robidoux', function () {
      // see https://github.com/nashwaan/xml-js/issues/6
      var xml =
        '<ZohoCreator>\n' +
        '    <applicationslist>\n' +
        '        <application name="testapp">\n' +
        '            <formlist>\n' +
        '                <form name="Untitled_Form">\n' +
        '                    <add>\n' +
        '                        <field name="Subform_Single_Line">\n' +
        '                            <value>BEUHBALUGU</value>\n' +
        '                        </field>\n' +
        '                    </add>\n' +
        '                </form>\n' +
        '                <form name="Untitled_Form">\n' +
        '                    <add>\n' +
        '                        <field name="Subform_Single_Line">\n' +
        '                            <value>IF YOU CAN SEE THIS YOU DESERVE THE SUCC</value>\n' +
        '                        </field>\n' +
        '                    </add>\n' +
        '                </form>\n' +
        '            </formlist>\n' +
        '        </application>\n' +
        '        <application name="derp">\n' +
        '            <formlist></formlist>\n' +
        '        </application>\n' +
        '    </applicationslist>\n' +
        '</ZohoCreator>';

      var json = convert.xml2json(xml, {compact: true, spaces: 4});

      it('should output json and reverse it back to xml', function () {
        expect(convert.json2xml(json, {compact: true, spaces: 4, fullTagEmptyElement: true})).toEqual(xml);
      });

    });

    describe('case by misitoth', function () {
      // see https://github.com/nashwaan/xml-js/issues/13
      var xml = '<!DOCTYPE svc_init SYSTEM "MLP_SVC_INIT_300.DTD" [<!ENTITY % extension SYSTEM "PIF_EXTENSION_100.DTD">%extension;]>';
      var json = {"_doctype" : "svc_init SYSTEM \"MLP_SVC_INIT_300.DTD\" [<!ENTITY % extension SYSTEM \"PIF_EXTENSION_100.DTD\">%extension;]"};

      it('should output as expected json', function () {
        expect(convert.xml2js(xml, {compact: true})).toEqual(json);
      });

    });

    describe('case by adamgcraig', function () {
      // see https://github.com/nashwaan/xml-js/issues/26
      var xml =
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<note>\n' +
        '\v<to>xml-js</to>\n' +
        '\v<from>ACraig</from>\n' +
        '\v<heading>Min Example</heading>\n' +
        '\v<body>Here are some characters that get sanitized: " \'</body>\n' +
        '</note>';
      var js = {
        "_declaration": {
          "_attributes": {
            "version": "1.0",
            "encoding": "UTF-8"
          }
        },
        "note": {
          "to": {
            "_text": "xml-js"
          },
          "from": {
            "_text": "ACraig"
          },
          "heading": {
            "_text": "Min Example"
          },
          "body": {
            "_text": "Here are some characters that get sanitized: \" '"
          }
        }
      };

      it('should convert xml object to js and back to xml correctly', function () {
        xml = xml.replace(/\v/g, '  ');
        var js_ = convert.xml2js(xml, {compact: true});
        expect(js_).toEqual(js);
        expect(convert.js2xml(js_, {spaces: 2, compact: true})).toEqual(xml);
      });

    });

    describe('case by bidiu', function () {
      // see https://github.com/nashwaan/xml-js/issues/26
      var xml = '<title>Support &amp; resistance</title>';
      var js = {
        elements: [{
          type: 'element',
          name: 'title',
          elements: [{
            type: 'text',
            text: 'Support & resistance'
          }]
        }]
      };

      it('should convert xml object to js and back to xml correctly', function () {
        var js_ = convert.xml2js(xml);
        expect(js_).toEqual(js);
        expect(convert.js2xml(js_)).toEqual(xml);
      });

    });

    describe('case by Daniel \'yngwi\'', function () {
      // see https://github.com/nashwaan/xml-js/issues/29
      var xml = '<outer> This is <inner> some</inner> <inner>Text </inner> </outer>';
      var js = {
        elements: [{
          type: 'element',
          name: 'outer',
          elements: [{
            type: 'text',
            text: ' This is '
          }, {
            type: 'element',
            name: 'inner',
            elements: [{
              type: 'text',
              text: ' some'
            }]
          }, {
            type: 'text',
            text: ' '
          }, {
            type: 'element',
            name: 'inner',
            elements: [{
              type: 'text',
              text: 'Text '
            }]
          }, {
            type: 'text',
            text: ' '
          }]
        }]
      };

      it('should convert xml object to js and back to xml correctly', function () {
        var js_ = convert.xml2js(xml, {captureSpacesBetweenElements: true});
        expect(js_).toEqual(js);
        expect(convert.js2xml(js_)).toEqual(xml);
      });

    });

    describe('case by Nuno Martins', function () {
      // see https://github.com/nashwaan/xml-js/issues/34
      var xml = '<?xml version=\'1.0\' encoding=\'UTF-8\'?>';
      var js = {
        declaration: {
          attributes: {
            version: '1.0',
            encoding: 'UTF-8'
          }
        }
      };

      it('should accept XML declarations that use single quotes', function () {
        expect(convert.xml2js(xml)).toEqual(js);
      });

    });

    xdescribe('case by \'ultimate-tester\'', function () {
      // see https://github.com/nashwaan/xml-js/issues/41
      var xml1 =
        '<d:multistatus xmlns="DAV:">\n' +
        '  <response>\n' +
        '    <href>/</href>\n' +
        '        <propstat>\n' +
        '          <prop>\n' +
        '          <current-user-principal>\n' +
        '            <href>/principals/users/johndoe/</href>\n' +
        '          </current-user-principal>\n' +
        '          </prop>\n' +
        '      <status>HTTP/1.1 200 OK</status>\n' +
        '    </propstat>\n' +
        '  </response>\n' +
        '</d:multistatus>';
      var xml2 =
        '<d:multistatus xmlns:d="DAV:">\n' +
        '  <d:response>\n' +
        '      <d:href>/</d:href>\n' +
        '      <d:propstat>\n' +
        '          <d:prop>\n' +
        '              <d:current-user-principal>\n' +
        '                  <d:href>/principals/users/johndoe/</d:href>\n' +
        '              </d:current-user-principal>\n' +
        '          </d:prop>\n' +
        '          <d:status>HTTP/1.1 200 OK</d:status>\n' +
        '      </d:propstat>\n' +
        '  </d:response>\n' +
        '</d:multistatus>';
      var js1 = {
        "d:multistatus": {
          "_attributes": {
            "xmlns": "DAV:"
          },
          "response": {
            "href": {
              "_text": "/"
            },
            "propstat": {
              "prop": {
                "current-user-principal": {
                  "href": {
                    "_text": "/principals/users/johndoe/"
                  }
                }
              },
              "status": {
                "_text": "HTTP/1.1 200 OK"
              }
            }
          }
        }
      };
      var js2 = {
        "d:multistatus": {
          "_attributes": {
            "xmlns:d": "DAV:"
          },
          "d:response": {
            "d:href": {
              "_text": "/"
            },
            "d:propstat": {
              "d:prop": {
                "d:current-user-principal": {
                  "d:href": {
                    "_text": "/principals/users/johndoe/"
                  }
                }
              },
              "d:status": {
                "_text": "HTTP/1.1 200 OK"
              }
            }
          }
        }
      };
      var js = {
        "d:multistatus": {
          "_attributes": {
            "xmlns:d": "DAV:"
          },
          "DAV:response": {
            "DAV:href": {
              "_text": "/"
            },
            "DAV:propstat": {
              "DAV:prop": {
                "DAV:current-user-principal": {
                  "DAV:href": {
                    "_text": "/principals/users/johndoe/"
                  }
                }
              },
              "DAV:status": {
                "_text": "HTTP/1.1 200 OK"
              }
            }
          }
        }
      };

      it('should convert without resolving namespace', function () {
        expect(convert.xml2js(xml1, {compact: true, resolveNamespace: false})).toEqual(js1);
        expect(convert.xml2js(xml2, {compact: true, resolveNamespace: false})).toEqual(js2);
      });

      it('should convert and resolve namespace', function () {
        expect(convert.xml2js(xml1, {compact: true, resolveNamespace: true})).toEqual(js);
      });

    });

    describe('case by austin-laney', function () {
      // see https://github.com/nashwaan/xml-js/issues/26
      var xml = '<parser start="^\\s*?&lt;name&gt;regex&lt;/name&gt;$"/>';
      var js = {
        parser: {
          _attributes: {
            start: '^\\s*?<name>regex</name>$'
          }
        }
      };

      it('should xml to json and back to xml', function () {
        expect(convert.xml2js(xml, {compact: true})).toEqual(js);
        expect(convert.js2xml(js, {compact: true, attributeValueFn: function(value) {
          return value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }})).toEqual(xml);
      });

    });

  });

});

},{"../lib":3}],53:[function(require,module,exports){
var convert = require('../lib');
var testItems = require('./test-items');

/*global describe,it,expect*/

describe('Testing xml2js.js:', function () {

  describe('Changing default key names, options = {compact: false}', function () {

    describe('Changing options.declarationKey', function () {

      var options = {compact: false, declarationKey: 'declaration'.slice(0,3)};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('Changing options.instructionKey', function () {

      var options = {compact: false, instructionKey: 'instruction'.slice(0,3)};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('Changing options.attributesKey', function () {

      var options = {compact: false, attributesKey: 'attributes'.slice(0,3)};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('Changing options.textKey', function () {

      var options = {compact: false, textKey: 'text'.slice(0,3)};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('Changing options.cdataKey', function () {

      var options = {compact: false, cdataKey: 'cdata'.slice(0,3)};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('Changing options.doctypeKey', function () {

      var options = {compact: false, doctypeKey: 'doctype'.slice(0,3)};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('Changing options.commentKey', function () {

      var options = {compact: false, commentKey: 'comment'.slice(0,3)};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('Changing options.parentKey', function () {

      var options = {compact: false, parentKey: 'parent'.slice(0,3)};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('Changing options.typeKey', function () {

      var options = {compact: false, typeKey: 'type'.slice(0,3)};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('Changing options.nameKey', function () {

      var options = {compact: false, nameKey: 'name'.slice(0,3)};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('Changing options.elementsKey', function () {

      var options = {compact: false, elementsKey: 'elements'.slice(0,3)};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

  });

  describe('Changing default key names, options = {compact: true}', function () {

    describe('Changing options.declarationKey', function () {

      var options = {compact: true, declarationKey: 'declaration'.slice(0,3)};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('Changing options.instructionKey', function () {

      var options = {compact: true, instructionKey: 'instruction'.slice(0,3)};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('Changing options.attributesKey', function () {

      var options = {compact: true, attributesKey: 'attributes'.slice(0,3)};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('Changing options.textKey', function () {

      var options = {compact: true, textKey: 'text'.slice(0,3)};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('Changing options.cdataKey', function () {

      var options = {compact: true, cdataKey: 'cdata'.slice(0,3)};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('Changing options.doctypeKey', function () {

      var options = {compact: true, doctypeKey: 'doctype'.slice(0,3)};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('Changing options.commentKey', function () {

      var options = {compact: true, commentKey: 'comment'.slice(0,3)};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('Changing options.parentKey', function () {

      var options = {compact: true, parentKey: 'parent'.slice(0,3)};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('Changing options.typeKey', function () {

      var options = {compact: true, typeKey: 'type'.slice(0,3)};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('Changing options.nameKey', function () {

      var options = {compact: true, nameKey: 'name'.slice(0,3)};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('Changing options.elementsKey', function () {

      var options = {compact: true, elementsKey: 'elements'.slice(0,3)};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

  });

});

},{"../lib":3,"./test-items":50}],54:[function(require,module,exports){
var convert = require('../lib');
var testItems = require('./test-items');

/*global describe,it,expect*/

describe('Testing xml2js.js:', function () {

  //var books = require('fs').readFileSync('test/fixtures/books.xml', 'utf8');

  describe('No options supplied (fallback to defaults):', function () {

    var options = {};
    testItems('xml2js', options).forEach(function (test) {
      it(test.desc, function () {
        expect(convert.xml2js(test.xml, options)).toEqual(test.js);
      });
    });

  });

  describe('options = {compact: false}', function () {

    describe('Options set to default values explicitly:', function () {

      var options = {singleLine: false, compact: false, trim: false, sanitize: false, nativeType: false, alwaysChildren: false, addParent: false};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {compact: false}', function () {

      var options = {compact: false};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {trim: true}', function () {

      var options = {compact: false, trim: true};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {sanitize: true}', function () {

      var options = {compact: false, sanitize: true};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {nativeType: true}', function () {

      var options = {compact: false, nativeType: true};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {alwaysChildren: true}', function () {

      var options = {compact: false, alwaysChildren: true};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {addParent: true}', function () {

      var options = {compact: false, addParent: true};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {ignoreText: true}', function () {

      var options = {compact: false, ignoreText: true};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {ignoreComment: true}', function () {

      var options = {compact: false, ignoreComment: true};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {ignoreCdata: true}', function () {

      var options = {compact: false, ignoreCdata: true};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {ignoreDoctype: true}', function () {

      var options = {compact: false, ignoreDoctype: true};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {ignoreDeclaration: true}', function () {

      var options = {compact: false, ignoreDeclaration: true};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {ignoreInstruction: true}', function () {

      var options = {compact: false, ignoreInstruction: true};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

  });

  describe('options = {compact: true}', function () {

    describe('Options set to default values explicitly:', function () {

      var options = {compact: true, trim: false, sanitize: false, nativeType: false, alwaysChildren: false, addParent: false};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {compact: true}', function () {

      var options = {compact: true};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {trim: true}', function () {

      var options = {compact: true, trim: true};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {sanitize: true}', function () {

      var options = {compact: true, sanitize: true};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {alwaysArray: true}', function () {

      var options = {compact: true, alwaysArray: true};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {alwaysArray: ["a", "c"]}', function () {

      var options = {compact: true, alwaysArray: ['a', 'c']};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {addParent: true}', function () {

      var options = {compact: true, addParent: true};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {ignoreText: true}', function () {

      var options = {compact: true, ignoreText: true};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {ignoreComment: true}', function () {

      var options = {compact: true, ignoreComment: true};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {ignoreCdata: true}', function () {

      var options = {compact: true, ignoreCdata: true};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {ignoreDoctype: true}', function () {

      var options = {compact: true, ignoreDoctype: true};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {ignoreDeclaration: true}', function () {

      var options = {compact: true, ignoreDeclaration: true};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {ignoreInstruction: true}', function () {

      var options = {compact: true, ignoreInstruction: true};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

  });

  describe('Varying spaces', function () {

    describe('options = {}', function () {

      var options = {};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {spaces: true}', function () {

      var options = {spaces: true};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {spaces: 2}', function () {

      var options = {spaces: 2};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {spaces: 4}', function () {

      var options = {spaces: 4};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {spaces: \'  \'}', function () {

      var options = {spaces: '  '};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {spaces: \\t}', function () {

      var options = {spaces: '\t'};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

  });

  describe('Various options:', function () {

    describe('options = {trim: true}', function () {

      var options = {trim: true};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {nativeType: true}', function () {

      var options = {nativeType: true};

      it('Parse number', function () {
        expect(convert.xml2js('<a>123</a>', options)).toEqual({"elements":[{"type":"element","name":"a","elements":[{"type":"text","text":123}]}]});
      });
      it('Parse true', function () {
        expect(convert.xml2js('<a>true</a>', options)).toEqual({"elements":[{"type":"element","name":"a","elements":[{"type":"text","text":true}]}]});
      });
      it('Parse false', function () {
        expect(convert.xml2js('<a>false</a>', options)).toEqual({"elements":[{"type":"element","name":"a","elements":[{"type":"text","text":false}]}]});
      });
      convert.xml2js('<a>x', {});
      /*it('Parse improper XML', function () {
        expect(convert.xml2js('<a>x', {})).toEqual({"elements":[{"type":"element","name":"a","elements":[{"type":"text","text":"x"}]}]});
      });*/

    });

    describe('options = {instructionHasAttributes: true}', function () {

      var options = {compact: true, instructionHasAttributes: true};

      it('Parse attributes in processing instruction', function () {
        expect(convert.xml2js('<?go to="there"?>', options)).toEqual({"_instruction":{"go":{"_attributes":{"to":"there"}}}});
      });

      it('Parse attributes in processing instruction', function () {
        expect(convert.xml2js('<?go to="there"?>', {instructionHasAttributes: true})).toEqual({"elements":[{"type":"instruction","name":"go","attributes":{"to":"there"}}]});
      });

    });

  });

  describe('xml2json:', function () {

    describe('No options supplied (fallback to defaults):', function () {

      var options = {};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2json(test.xml, options)).toEqual(JSON.stringify(test.js));
        });
      });

    });

    describe('options = {compact: true, addParent: true}:', function () {

      var options = {onlyItem: 6, compact: true, addParent: true};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2json(test.xml, options)).toBe(JSON.stringify(test.js, function (k, v) { return k === '_parent'? '_' : v; }));
        });
      });

    });

  });

  describe('User reported issues:', function () {

    describe('case by Mark Pareja', function () {
      // see https://github.com/nashwaan/xml-js/issues/3
      var xml =
        '<?xml version="1.0" encoding="utf-8"?>\n' +
        '<dp:ListServicesReply ReturnCode="0" xmlns:dp="http://www.cisco.com/vtg/diagnosticportal">\n' +
        '  <dp:Schema Version="1.0" />\n' +
        '  <dp:ServiceList>\n' +
        '    <dp:Service Name="Cisco ICM usgd1 LoggerA" Description="Provides Call Logging services for Instance usgd1" Status="Running" StartupType="Auto" LogOnAs="****" />\n' +
        '    <dp:Service Name="Cisco ICM Diagnostic Framework" Description="Provides a web-based diagnostic service for Cisco Unified ICM, Contact Center Enterprise application." Status="Running" StartupType="Auto" LogOnAs="LocalSystem" />\n' +
        '  </dp:ServiceList>\n' +
        '</dp:ListServicesReply>';
      var json = {
        "_declaration": {
          "_attributes": {
            "version": "1.0",
            "encoding": "utf-8"
          }
        },
        "dp:ListServicesReply": {
          "_attributes": {
            "ReturnCode": "0",
            "xmlns:dp": "http://www.cisco.com/vtg/diagnosticportal"
          },
          "dp:Schema": {
            "_attributes": {
              "Version": "1.0"
            }
          },
          "dp:ServiceList": {
            "dp:Service": [
              {
                "_attributes": {
                  "Name": "Cisco ICM usgd1 LoggerA",
                  "Description": "Provides Call Logging services for Instance usgd1",
                  "Status": "Running",
                  "StartupType": "Auto",
                  "LogOnAs": "****"
                }
              },
              {
                "_attributes": {
                  "Name": "Cisco ICM Diagnostic Framework",
                  "Description": "Provides a web-based diagnostic service for Cisco Unified ICM, Contact Center Enterprise application.",
                  "Status": "Running",
                  "StartupType": "Auto",
                  "LogOnAs": "LocalSystem"
                }
              }
            ]
          }
        }
      };

      it('should output as expected json', function () {
        expect(convert.xml2json(xml, {compact: true})).toEqual(JSON.stringify(json));
      });

    });

    describe('case by Félix Dion Robidoux', function () {
      // see https://github.com/nashwaan/xml-js/issues/6
      var xml =
        '<ZohoCreator>\n' +
        '    <applicationslist>\n' +
        '        <application name="testapp">\n' +
        '            <formlist>\n' +
        '                <form name="Untitled_Form">\n' +
        '                    <add>\n' +
        '                        <field name="Subform_Single_Line">\n' +
        '                            <value>BEUHBALUGU</value>\n' +
        '                        </field>\n' +
        '                    </add>\n' +
        '                </form>\n' +
        '                <form name="Untitled_Form">\n' +
        '                    <add>\n' +
        '                        <field name="Subform_Single_Line">\n' +
        '                            <value>IF YOU CAN SEE THIS YOU DESERVE THE SUCC</value>\n' +
        '                        </field>\n' +
        '                    </add>\n' +
        '                </form>\n' +
        '            </formlist>\n' +
        '        </application>\n' +
        '        <application name="derp">\n' +
        '            <formlist></formlist>\n' +
        '        </application>\n' +
        '    </applicationslist>\n' +
        '</ZohoCreator>';

      var json = convert.xml2json(xml, {compact: true, spaces: 4});

      it('should output json and reverse it back to xml', function () {
        expect(convert.json2xml(json, {compact: true, spaces: 4, fullTagEmptyElement: true})).toEqual(xml);
      });

    });

    describe('case by misitoth', function () {
      // see https://github.com/nashwaan/xml-js/issues/13
      var xml = '<!DOCTYPE svc_init SYSTEM "MLP_SVC_INIT_300.DTD" [<!ENTITY % extension SYSTEM "PIF_EXTENSION_100.DTD">%extension;]>';
      var json = {"_doctype" : "svc_init SYSTEM \"MLP_SVC_INIT_300.DTD\" [<!ENTITY % extension SYSTEM \"PIF_EXTENSION_100.DTD\">%extension;]"};

      it('should output as expected json', function () {
        expect(convert.xml2js(xml, {compact: true})).toEqual(json);
      });

    });

    describe('case by adamgcraig', function () {
      // see https://github.com/nashwaan/xml-js/issues/26
      var xml =
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<note>\n' +
        '\v<to>xml-js</to>\n' +
        '\v<from>ACraig</from>\n' +
        '\v<heading>Min Example</heading>\n' +
        '\v<body>Here are some characters that get sanitized: " \'</body>\n' +
        '</note>';
      var js = {
        "_declaration": {
          "_attributes": {
            "version": "1.0",
            "encoding": "UTF-8"
          }
        },
        "note": {
          "to": {
            "_text": "xml-js"
          },
          "from": {
            "_text": "ACraig"
          },
          "heading": {
            "_text": "Min Example"
          },
          "body": {
            "_text": "Here are some characters that get sanitized: \" '"
          }
        }
      };

      it('should convert xml object to js and back to xml correctly', function () {
        xml = xml.replace(/\v/g, '  ');
        var js_ = convert.xml2js(xml, {compact: true});
        expect(js_).toEqual(js);
        expect(convert.js2xml(js_, {spaces: 2, compact: true})).toEqual(xml);
      });

    });

    describe('case by bidiu', function () {
      // see https://github.com/nashwaan/xml-js/issues/26
      var xml = '<title>Support &amp; resistance</title>';
      var js = {
        elements: [{
          type: 'element',
          name: 'title',
          elements: [{
            type: 'text',
            text: 'Support & resistance'
          }]
        }]
      };

      it('should convert xml object to js and back to xml correctly', function () {
        var js_ = convert.xml2js(xml);
        expect(js_).toEqual(js);
        expect(convert.js2xml(js_)).toEqual(xml);
      });

    });

    describe('case by Daniel \'yngwi\'', function () {
      // see https://github.com/nashwaan/xml-js/issues/29
      var xml = '<outer> This is <inner> some</inner> <inner>Text </inner> </outer>';
      var js = {
        elements: [{
          type: 'element',
          name: 'outer',
          elements: [{
            type: 'text',
            text: ' This is '
          }, {
            type: 'element',
            name: 'inner',
            elements: [{
              type: 'text',
              text: ' some'
            }]
          }, {
            type: 'text',
            text: ' '
          }, {
            type: 'element',
            name: 'inner',
            elements: [{
              type: 'text',
              text: 'Text '
            }]
          }, {
            type: 'text',
            text: ' '
          }]
        }]
      };

      it('should convert xml object to js and back to xml correctly', function () {
        var js_ = convert.xml2js(xml, {captureSpacesBetweenElements: true});
        expect(js_).toEqual(js);
        expect(convert.js2xml(js_)).toEqual(xml);
      });

    });

    describe('case by Nuno Martins', function () {
      // see https://github.com/nashwaan/xml-js/issues/34
      var xml = '<?xml version=\'1.0\' encoding=\'UTF-8\'?>';
      var js = {
        declaration: {
          attributes: {
            version: '1.0',
            encoding: 'UTF-8'
          }
        }
      };

      it('should accept XML declarations that use single quotes', function () {
        expect(convert.xml2js(xml)).toEqual(js);
      });

    });

  });

});

},{"../lib":3,"./test-items":50}]},{},[43,44,45,46,47,48,49,51,52,53,54]);
