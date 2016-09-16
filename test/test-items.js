var cases = [
    {
        desc: 'declaration <?xml>',
        xml: '<?xml?>',
        js1: {"_declaration":{}},
        js2: {"declaration":{}},
    }, {
        desc: 'declaration with attributes',
        xml: '<?xml version="1.0" encoding="utf-8"?>',
        js1: {"_declaration":{"_attributes":{"version":"1.0","encoding":"utf-8"}}},
        js2: {"declaration":{"attributes":{"version":"1.0","encoding":"utf-8"}}},
    }, {
        desc: 'declaration and element',
        xml: '<?xml?>\n<a/>',
        js1: {"_declaration":{},"a":{}},
        js2: {"declaration":{},"elements":[{"type":"element","name":"a"}]},
    }, {
        desc: 'declaration and elements',
        xml: '<?xml?>\n<a>\n\v<b/>\n</a>',
        js1: {"_declaration":{},"a":{"b":{}}},
        js2: {"declaration":{},"elements":[{"type":"element","name":"a","elements":[{"type":"element","name":"b"}]}]},
    }, {
        desc: 'should convert comment',
        xml: '<!-- \t Hello, World! \t -->',
        js1: {"_comment":" \t Hello, World! \t "},
        js2: {"elements":[{"type":"comment","comment":" \t Hello, World! \t "}]},
    }, /*{
        desc: 'should convert 2 comments',
        xml: '<!-- \t Hello \t --><!-- \t World \t -->',
        js1: {"_comment":[" \t Hello \t "," \t World \t "]},
        js2: {"elements":[{"type":"comment","comment":" \t Hello \t "},{"type":"comment","comment":" \t World \t "}]},
    }, */{
        desc: 'should convert cdata',
        xml: '<![CDATA[ \t <foo></bar> \t ]]>',
        js1: {"_cdata":" \t <foo></bar> \t "},
        js2: {"elements":[{"type":"cdata","cdata":" \t <foo></bar> \t "}]},
    }, /*{
        desc: 'should convert 2 cdata',
        xml: '<![CDATA[ \t data]]><![CDATA[< > " and & \t ]]>',
        js1: {"_cdata":[" \t data\n< > \" and & \t "]},
        js2: {"elements":[{"type":"cdata","cdata":" \t data"},{"type":"cdata","cdata":"< > \" and & \t "}]},
    }, */{
        desc: 'should convert element',
        xml: '<a/>',
        js1: {"a":{}},
        js2: {"elements":[{"type":"element","name":"a"}]},
    }, {
        desc: 'should convert 2 elements',
        xml: '<a/><b/>',
        js1: {"a":{},"b":{}},
        js2: {"elements":[{"type":"element","name":"a"},{"type":"element","name":"b"}]},
    }, {
        desc: 'should convert attribute',
        xml: '<a x="hello"/>',
        js1: {"a":{_attributes:{"x":"hello"}}},
        js2: {"elements":[{"type":"element","name":"a","attributes":{"x":"hello"}}]},
    }, {
        desc: 'should convert 2 attributes',
        xml: '<a x="1.234" y="It\'s"/>',
        js1: {"a":{_attributes:{"x":"1.234","y":"It\'s"}}},
        js2: {"elements":[{"type":"element","name":"a","attributes":{"x":"1.234","y":"It\'s"}}]},
    }, {
        desc: 'should convert text in element',
        xml: '<a> \t Hi \t </a>',
        js1: {"a":{"_text":" \t Hi \t "}},
        js2: {"elements":[{"type":"element","name":"a","elements":[{"type":"text","text":" \t Hi \t "}]}]},
    }, {
        desc: 'should convert multi-line text',
        xml: '<a>  Hi \n There \t </a>',
        js1: {"a":{"_text":"  Hi \n There \t "}},
        js2: {"elements":[{"type":"element","name":"a","elements":[{"type":"text","text":"  Hi \n There \t "}]}]},
    }, {
        desc: 'should convert nested elements',
        xml: '<a>\n\v<b/>\n</a>',
        js1: {"a":{"b":{}}},
        js2: {"elements":[{"type":"element","name":"a","elements":[{"type":"element","name":"b"}]}]},
    }, {
        desc: 'should convert 3 nested elements',
        xml: '<a>\n\v<b>\n\v\v<c/>\n\v</b>\n</a>',
        js1: {"a":{"b":{"c":{}}}},
        js2: {"elements":[{"type":"element","name":"a","elements":[{"type":"element","name":"b","elements":[{"type":"element","name":"c"}]}]}]},
    }
];
    
module.exports = function (options) {
    var i, tests = [];
    options = options || {};
    function applyOptions (obj) {
        var key;
        if (obj instanceof Array) {
            obj.forEach(function (el) {
                el = transform(el);
            });
        } else if (typeof obj === 'object') {
            for (key in obj) {
                if (key.indexOf('_') === 0 && obj[key] instanceof Array) {
                    obj[key] = obj[key].reduce(function (res, el) {
                        return (res === '' ? '' : res + '\n') + transform(el);
                    }, '');
                } else {
                    if (key !== 'parent' && key !== '_parent') {
                        obj[key] = transform(obj[key]);
                    }
                }
                if (typeof obj[key] === 'object' && !(obj[key] instanceof Array)) {
                    if (options.compact && options.addParent && key !== '_attributes') {
                        if (options.compact) {obj[key]._parent = obj;} else {obj[key].parent = obj;}
                    }
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
        }
        return obj;
        function transform (x) {
            if (x instanceof Array || typeof x === 'object') {
                return applyOptions(x);
            } else if (typeof x === 'string') {
                return options.trim? x.trim() : x;
            } else if (typeof x === 'number' || typeof x === 'boolean') {
                return options.nativeType? x.toString() : x;
            } else {
                return x;
            }
        }
    }
    for (i = 0; i < cases.length; ++i) {
        tests.push({desc: cases[i].desc, xml: null, js: null});
        //tests[i].xml = options.singleLine ? cases[i].xml.replace(/\r\n|\r|\n|^\s+/gm, '') : cases[i].xml;
        tests[i].xml = cases[i].xml;
        if (!('spaces' in options) || options.spaces === 0 || typeof options.spaces === 'boolean') { tests[i].xml = tests[i].xml.replace(/>\n\v*/gm, '>'); }
        if ('spaces' in options && options.spaces !== 0 && typeof options.spaces === 'number') { tests[i].xml = tests[i].xml.replace(/\v/g, Array(options.spaces + 1).join(' ')); }
        if ('spaces' in options && typeof options.spaces === 'string') { tests[i].xml = tests[i].xml.replace(/\v/g, options.spaces); }
        if (options.ignoreText) { tests[i].xml = tests[i].xml.replace(/>([\s\S]*?)</gm, '><'); }
        if (options.ignoreComment) { tests[i].xml = tests[i].xml.replace(/<!--.*?-->/gm, ''); }
        if (options.ignoreCdata) { tests[i].xml = tests[i].xml.replace(/<!\[CDATA\[.*?\]\]>/gm, ''); }
        if (options.fullTagEmptyElement) { tests[i].xml = tests[i].xml.replace('<a/>', '<a></a>').replace('<b/>', '<b></b>').replace('<c/>', '<c></c>').replace('/>', '></a>'); }
        if ('compact' in options && options.compact) {
            tests[i].js = applyOptions(JSON.parse(JSON.stringify(cases[i].js1)));
        } else {
            tests[i].js = applyOptions(JSON.parse(JSON.stringify(cases[i].js2)));
        }
    }
    if ('onlyItem' in options) {
        tests = [tests[options.onlyItem]];
    }
    return tests;
};