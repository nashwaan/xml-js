var convert = require('../lib');

/*global describe,it,expect*/

describe('Serializing CDATA terminators:', function () {
  [false, true].forEach(function (compact) {
    function serialize(value, options) {
      var js = compact ? {root: {_cdata: value}} : {
        elements: [{type: 'element', name: 'root', elements: [{type: 'cdata', cdata: value}]}]
      };
      options = options || {};
      options.compact = compact;
      return convert.js2xml(js, options);
    }

    function content(xml) {
      var elements = convert.xml2js(xml).elements[0].elements || [];
      return elements.map(function (element) { return element.cdata || ''; }).join('');
    }

    describe('compact = ' + compact, function () {
      [
        ['', '<root><![CDATA[]]></root>'],
        ['<a>&value</a>', '<root><![CDATA[<a>&value</a>]]></root>'],
        ['a]]>b', '<root><![CDATA[a]]]]><![CDATA[>b]]></root>'],
        ['a]]>b]]>c', '<root><![CDATA[a]]]]><![CDATA[>b]]]]><![CDATA[>c]]></root>'],
        [']]>]]>', '<root><![CDATA[]]]]><![CDATA[>]]]]><![CDATA[>]]></root>'],
        [']]]>x]]]>]]', '<root><![CDATA[]]]]]><![CDATA[>x]]]]]><![CDATA[>]]]]></root>']
      ].forEach(function (testCase) {
        it('preserves the content ' + JSON.stringify(testCase[0]), function () {
          var xml = serialize(testCase[0]);
          expect(xml).toEqual(testCase[1]);
          expect(content(xml)).toEqual(testCase[0]);
        });
      });

      it('passes the original content to cdataFn for custom splitting', function () {
        var input = 'a]]>b]]>c';
        var received;
        var xml = serialize(input, {cdataFn: function (value) {
          received = value;
          return 'a]]]]><![CDATA[>b]]]]><![CDATA[>c';
        }});
        expect(received).toEqual(input);
        expect(xml).toEqual('<root><![CDATA[a]]]]><![CDATA[>b]]]]><![CDATA[>c]]></root>');
        expect(content(xml)).toEqual(input);
      });

      it('preserves callback output that introduces split boundaries', function () {
        var xml = serialize('plain', {cdataFn: function () {
          return 'x]]]]><![CDATA[>]]]]><![CDATA[>y';
        }});
        expect(xml).toEqual('<root><![CDATA[x]]]]><![CDATA[>]]]]><![CDATA[>y]]></root>');
        expect(content(xml)).toEqual('x]]>]]>y');
      });

      it('allows cdataFn to remove terminators from the original content', function () {
        var xml = serialize('a]]>b]]>c', {cdataFn: function (value) {
          return value.split(']]>').join('');
        }});
        expect(xml).toEqual('<root><![CDATA[abc]]></root>');
        expect(content(xml)).toEqual('abc');
      });

      it('does not invoke cdataFn when CDATA is ignored', function () {
        var called = false;
        var xml = serialize(']]>]]>', {ignoreCdata: true, cdataFn: function () {
          called = true;
          return 'unused';
        }});
        expect(called).toEqual(false);
        expect(xml).toEqual('<root></root>');
      });
    });
  });
});
