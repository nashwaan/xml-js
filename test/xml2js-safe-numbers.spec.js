var convert = require('../lib');

/*global describe,it,expect*/

describe('Native number precision:', function () {
  [false, true].forEach(function (compact) {
    [
      ['15932618675018011', '15932618675018011'],
      ['-15932618675018011', '-15932618675018011'],
      ['9007199254740991', 9007199254740991],
      ['-9007199254740991', -9007199254740991],
      ['9007199254740992', '9007199254740992'],
      ['-9007199254740992', '-9007199254740992'],
      ['9007199254740993', '9007199254740993'],
      ['1.5932618675018011e16', '1.5932618675018011e16'],
      ['9.007199254740991e15', 9007199254740991],
      ['0', 0],
      ['42', 42],
      ['-42', -42],
      ['1.25', 1.25],
      ['-1.25', -1.25],
      ['1.25e2', 125],
      ['true', true],
      ['false', false],
      ['word', 'word']
    ].forEach(function (item) {
      it('converts text ' + item[0] + ' with compact=' + compact, function () {
        var result = convert.xml2js('<value>' + item[0] + '</value>', {
          compact: compact, nativeType: true
        });
        expect(compact ? result.value._text : result.elements[0].elements[0].text).toBe(item[1]);
      });

      it('converts attribute ' + item[0] + ' with compact=' + compact, function () {
        var result = convert.xml2js('<value id="' + item[0] + '"/>', {
          compact: compact, nativeTypeAttributes: true
        });
        expect(compact ? result.value._attributes.id : result.elements[0].attributes.id).toBe(item[1]);
      });
    });

    it('preserves whitespace on unsafe numbers unless trim is enabled, compact=' + compact, function () {
      var xml = '<value id=" 15932618675018011 "> 15932618675018011 </value>';
      [false, true].forEach(function (trim) {
        var result = convert.xml2js(xml, {
          compact: compact, trim: trim, nativeType: true, nativeTypeAttributes: true
        });
        var expected = trim ? '15932618675018011' : ' 15932618675018011 ';
        expect(compact ? result.value._text : result.elements[0].elements[0].text).toBe(expected);
        expect(compact ? result.value._attributes.id : result.elements[0].attributes.id).toBe(expected);
      });
    });
  });
});
