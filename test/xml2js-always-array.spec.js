var convert = require('../lib');

/*global describe,it,expect*/

describe('alwaysArray callbacks:', function () {
  it('selects singleton arrays by element name', function () {
    var result = convert.xml2js('<root><CustomerArray><Customer>Jane</Customer></CustomerArray><CommentArray/><Other/></root>', {
      compact: true,
      alwaysArray: function (name) { return name.slice(-5) === 'Array'; }
    });
    expect(result).toEqual({root: {
      CustomerArray: [{Customer: {_text: 'Jane'}}], CommentArray: [{}], Other: {}
    }});
  });

  it('passes the parent object before the new property is assigned', function () {
    var parent;
    var result = convert.xml2js('<root array="yes"><item>value</item></root>', {
      compact: true,
      alwaysArray: function (name, currentElement) {
        if (name === 'item') {
          parent = currentElement;
          expect(currentElement.item).toBeUndefined();
          return currentElement._attributes.array === 'yes';
        }
        return false;
      }
    });
    expect(parent).toBe(result.root);
    expect(result.root.item).toEqual([{_text: 'value'}]);
  });

  it('uses the output name after elementNameFn', function () {
    var names = [];
    var result = convert.xml2js('<root><item/></root>', {
      compact: true,
      elementNameFn: function (name) { return name === 'item' ? 'items' : name; },
      alwaysArray: function (name) {
        names.push(name);
        return name === 'items';
      }
    });
    expect(result.root.items).toEqual([{}]);
    expect(names).toEqual(['root', 'items']);
  });

  it('supports configured field names and transformed values', function () {
    var result = convert.xml2js('<root>text<!--note--><![CDATA[data]]></root>', {
      compact: true, textKey: 'value', commentKey: 'notes', cdataKey: 'raw',
      textFn: function (text) { return text.toUpperCase(); },
      alwaysArray: function (name) { return ['value', 'notes', 'raw'].indexOf(name) !== -1; }
    });
    expect(result).toEqual({root: {value: ['TEXT'], notes: ['note'], raw: ['data']}});
  });

  it('still groups repeated elements when the callback returns false', function () {
    var calls = 0;
    var result = convert.xml2js('<root><item/><item/></root>', {
      compact: true,
      alwaysArray: function (name) {
        if (name === 'item') calls++;
        return false;
      }
    });
    expect(result.root.item).toEqual([{}, {}]);
    expect(calls).toBe(1);
  });

  it('does not visit ignored fields or attribute properties', function () {
    var names = [];
    convert.xml2js('<?xml version="1.0"?><root id="1">text<!--note--></root>', {
      compact: true, ignoreText: true, ignoreComment: true,
      alwaysArray: function (name) { names.push(name); return false; }
    });
    expect(names).toEqual(['root']);
  });

  it('does not call the callback for non-compact output', function () {
    var result = convert.xml2js('<root><item/></root>', {
      compact: false,
      alwaysArray: function () { throw new Error('compact only'); }
    });
    expect(result.elements[0].elements[0].name).toBe('item');
  });

  it('propagates callback errors', function () {
    expect(function () {
      convert.xml2js('<root/>', {
        compact: true,
        alwaysArray: function () { throw new Error('selection failed'); }
      });
    }).toThrowError('selection failed');
  });

  it('supports xml2json and preserves the supplied options', function () {
    var callback = function (name) { return name === 'item'; };
    var options = {compact: true, alwaysArray: callback};
    expect(JSON.parse(convert.xml2json('<root><item/></root>', options))).toEqual({root: {item: [{}]}});
    expect(options.alwaysArray).toBe(callback);
  });
});
