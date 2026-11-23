var convert = require('../lib');

/*global describe,it,expect*/

describe('Formatting newlines:', function () {
  [false, true].forEach(function (compact) {
    var input = compact ? {
      _declaration: {_attributes: {version: '1.0'}},
      root: {
        _attributes: {id: 'attribute\nvalue'},
        _text: 'text\nvalue',
        _cdata: 'cdata\r\nvalue',
        _comment: 'comment\nvalue',
        _instruction: {probe: 'instruction\nvalue'},
        leaf: {}
      }
    } : {
      declaration: {attributes: {version: '1.0'}},
      elements: [{type: 'element', name: 'root', attributes: {id: 'attribute\nvalue'}, elements: [
        {type: 'text', text: 'text\nvalue'},
        {type: 'cdata', cdata: 'cdata\r\nvalue'},
        {type: 'comment', comment: 'comment\nvalue'},
        {type: 'instruction', name: 'probe', instruction: 'instruction\nvalue'},
        {type: 'element', name: 'leaf'}
      ]}]
    };

    [undefined, '\n', '\r\n', '\r', '\n\n', ''].forEach(function (newline) {
      it('uses ' + JSON.stringify(newline) + ' only for formatting with compact=' + compact, function () {
        var options = {
          compact: compact, spaces: 2, newline: newline,
          indentText: true, indentCdata: true, indentAttributes: true, indentInstruction: true
        };
        var expected = [
          '<?xml', '  version="1.0"', '?>', '<root', '  id="attribute\nvalue"', '>',
          '  text\nvalue', '  <![CDATA[cdata\r\nvalue]]>', '  <!--comment\nvalue-->',
          '  <?probe instruction\nvalue?>', '  <leaf/>', '</root>'
        ].join(newline === undefined ? '\n' : newline);
        expect(convert.js2xml(input, options)).toBe(expected);
        expect(convert.json2xml(JSON.stringify(input), options)).toBe(expected);
        expect(options.newline).toBe(newline);
      });
    });

    it('does not add formatting when spaces are disabled, compact=' + compact, function () {
      expect(convert.js2xml(input, {compact: compact, newline: '\r\n'})).toBe(
        '<?xml version="1.0"?><root id="attribute\nvalue">text\nvalue' +
        '<![CDATA[cdata\r\nvalue]]><!--comment\nvalue--><?probe instruction\nvalue?><leaf/></root>'
      );
    });

    it('falls back to LF for invalid option types, compact=' + compact, function () {
      [null, false, 42, {}].forEach(function (newline) {
        expect(convert.js2xml(input, {compact: compact, spaces: 2, newline: newline})).toBe(
          convert.js2xml(input, {compact: compact, spaces: 2})
        );
      });
    });
  });
});
