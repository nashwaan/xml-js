/*jslint node:true */

var xml = '<?xml version="1.0" encoding="utf-8"?>' + '\n' +
          '<note importance="high" logged="true">' + '\n' +
          '    Watch out!' + '\n' +
          '    <time>11:00 am</time>' + '\n' +
          '    <time>11:30 am</time>' + '\n' +
          '</note>';

module.exports = 
[
    {
        desc: 'declaration <?xml>',
        xml: '<?xml?>',
        js: {"declaration":{},"elements":[]},
    }, {
        desc: 'declaration with attributes',
        xml: '<?xml version="1.0" encoding="utf-8"?>',
        js: {"declaration":{"attributes":{"version":"1.0","encoding":"utf-8"}},"elements":[]},
    }, {
        desc: 'should process comment',
        xml: '<!--Hello, World!-->',
        js: {"elements":[{"type":"comment","text":"Hello, World!"}]},
    }, {
        desc: 'should process 2 comments',
        xml: '<!--Hello--><!--World-->',
        js: {"elements":[{"type":"comment","text":"Hello"},{"type":"comment","text":"World"}]},
    }, {
        desc: 'should process element "<a/>"',
        xml: '<a/>',
        js: {"elements":[{"type":"element","name":"a","attributes":{}}]},
    }, {
        desc: 'should process 2 elements "<a/><b/>"',
        xml: '<a/><b/>',
        js: {"elements":[{"type":"element","name":"a","attributes":{}},{"type":"element","name":"b","attributes":{}}]},
    }, {
        desc: 'should process attribute',
        xml: '<a x="hello"/>',
        js: {"elements":[{"type":"element","name":"a","attributes":{"x":"hello"}}]},
    }, {
        desc: 'should process 2 attributes',
        xml: '<a x="1.234" y="It\'s"/>',
        js: {"elements":[{"type":"element","name":"a","attributes":{"x":"1.234","y":"It\'s"}}]},
    }, {
        desc: 'should convert text "<a>Hi</a>"',
        xml: '<a>Hi</a>',
        js: {"elements":[{"type":"element","name":"a","attributes":{},"elements":[{"type":"text","text":"Hi"}]}]},
    }, {
        desc: 'should convert text with spaces <a> Hi  There   </a>',
        xml: '<a> Hi  There   </a>',
        js: {"elements":[{"type":"element","name":"a","attributes":{},"elements":[{"type":"text","text":" Hi  There   "}]}]},
    }, {
        desc: 'should convert nested elements "<a><b/></a>"',
        xml: '<a><b/></a>',
        js: {"elements":[{"type":"element","name":"a","attributes":{},"elements":[{"type":"element","name":"b","attributes":{}}]}]},
    }, {
        desc: 'should convert 3 nested elements "<a><b/></a>"',
        xml: '<a><b><c/></b></a>',
        js: {"elements":[{"type":"element","name":"a","attributes":{},"elements":[{"type":"element","name":"b","attributes":{},"elements":[{"type":"element","name":"c","attributes":{}}]}]}]},
    }, {
        desc: 'should convert note.xml',
        xml: xml,
        js: {"elements":[{"type":"element","name":"a","attributes":{},"elements":[{"type":"element","name":"b","attributes":{},"elements":[{"type":"element","name":"c","attributes":{}}]}]}]},
    }
];