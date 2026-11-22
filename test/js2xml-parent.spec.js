var convert = require('../lib');

/*global describe,it,expect*/

describe('Serializing parsed parent references (#79):', function () {
  [true, false].forEach(function (compact) {
    [undefined, '$parent'].forEach(function (parentKey) {
      it('roundtrips parent links with compact=' + compact + ' and parentKey=' + parentKey, function () {
        var xml = '<?xml version="1.0"?><root><item/><item>value</item></root>';
        var options = {compact: compact, addParent: true};
        if (parentKey) options.parentKey = parentKey;
        var js = convert.xml2js(xml, options);
        var root = compact ? js.root : js.elements[0];
        var item = compact ? root.item[0] : root.elements[0];
        var key = parentKey || (compact ? '_parent' : 'parent');
        expect(item[key]).toBe(root);
        expect(convert.js2xml(js, options)).toEqual(xml);
        expect(item[key]).toBe(root);
        expect(root[key]).toBe(js);
      });
    });
  });

  it('ignores default parent links when formatting empty compact elements', function () {
    var js = convert.xml2js('<root><child/></root>', {compact: true, addParent: true});
    expect(convert.js2xml(js, {compact: true, spaces: 2})).toEqual('<root>\n  <child/>\n</root>');
  });
});
