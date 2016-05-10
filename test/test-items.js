/*jslint node:true */

var xml = '<?xml version="1.0" encoding="utf-8"?>' + '\n' +
          '<note importance="high" logged="true">' + '\n' +
          '    Watch out!' + '\n' +
          '    <time>11:00 am</time>' + '\n' +
          '    <time>11:30 am</time>' + '\n' +
          '</note>';

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
        desc: 'should convert comment',
        xml: '<!-- \t Hello, World! \t -->',
        js1: {"_comment":" \t Hello, World! \t "},
        js2: {"elements":[{"type":"comment","comment":" \t Hello, World! \t "}]},
    }, {
        desc: 'should convert 2 comments',
        xml: '<!-- \t Hello \t --><!-- \t World \t -->',
        js1: {"_comment":" \t Hello \t \n \t World \t "},
        js2: {"elements":[{"type":"comment","comment":" \t Hello \t "},{"type":"comment","comment":" \t World \t "}]},
    }, {
        desc: 'should convert cdata',
        xml: '<![CDATA[ \t <foo>x</bar> \t ]]>',
        js1: {"_cdata":" \t <foo>x</bar> \t "},
        js2: {"elements":[{"type":"cdata","cdata":" \t <foo>x</bar> \t "}]},
    }, {
        desc: 'should convert 2 cdata',
        xml: '<![CDATA[ \t <foo>x</bar> \t ]]><![CDATA[ \t > < " and & \t ]]>',
        js1: {"_cdata":" \t <foo>x</bar> \t \n \t > < \" and & \t "},
        js2: {"elements":[{"type":"cdata","cdata":" \t <foo>x</bar> \t "},{"type":"cdata","cdata":" \t > < \" and & \t "}]},
    }, {
        desc: 'should convert element',
        xml: '<a/>',
        js1: {"a":{}},
        js2: {"elements":[{"type":"element","name":"a","attributes":{}}]},
    }, {
        desc: 'should convert 2 elements',
        xml: '<a/><b/>',
        js1: {"a":{},"b":{}},
        js2: {"elements":[{"type":"element","name":"a","attributes":{}},{"type":"element","name":"b","attributes":{}}]},
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
        desc: 'should convert text in element"',
        xml: '<a> \t Hi \t </a>',
        js1: {"a":{"_text":" \t Hi \t "}},
        js2: {"elements":[{"type":"element","name":"a","attributes":{},"elements":[{"type":"text","text":" \t Hi \t "}]}]},
    }, {
        desc: 'should convert multi-line text',
        xml: '<a> \t Hi There \t </a>',
        js1: {"a":{"_text":" \t Hi There \t "}},
        js2: {"elements":[{"type":"element","name":"a","attributes":{},"elements":[{"type":"text","text":" \t Hi There \t "}]}]},
    }, {
        desc: 'should convert nested elements',
        xml: '<a>\n\t<b/>\n</a>',
        js1: {"a":{"b":{}}},
        js2: {"elements":[{"type":"element","name":"a","attributes":{},"elements":[{"type":"element","name":"b","attributes":{}}]}]},
    }, {
        desc: 'should convert 3 nested elements',
        xml: '<a>\n\t<b>\n\t<c/>\n\t</b>\n</a>',
        js1: {"a":{"b":{"c":{}}}},
        js2: {"elements":[{"type":"element","name":"a","attributes":{},"elements":[{"type":"element","name":"b","attributes":{},"elements":[{"type":"element","name":"c","attributes":{}}]}]}]},
    }
];
    
module.exports = function (options) {
    var i, key, tests = [];
    options = options || {};
    function applyOptions (obj) {
        if (obj instanceof Array) {
            obj.forEach(function (el) {
                el = transform(el);
            });
        } else if (typeof obj === 'object') {
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    obj[key] = transform(obj[key]);
                }
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
        if (options.singleLine) {
            tests[i].xml = cases[i].xml.replace(/\r\n|\r|\n|^\s+/gm, '');
        }
        if (options.compact) {
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