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
  // if (!('attributesKey' in options)) {
  //   options.attributesKey = 'attributes';
  // }
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
      if (options.alwaysAttributes && obj.type === 'element') {
        obj[options.attributesKey] = {};
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
    if (options.nativeTypeAttributes) {
      var parsedNumber = Number(obj[key]);
      if (!Number.isNaN(parsedNumber)) {
        obj[key] = parsedNumber;
      }
    }
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
