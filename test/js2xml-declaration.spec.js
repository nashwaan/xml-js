var convert = require('../lib');

/*global describe,it,expect*/

describe('Compact XML declaration ordering (#141):', function () {
  it('writes a late declaration before comments and the root without changing the input', function () {
    var js = {_comment: 'before root', root: {}, _declaration: {_attributes: {version: '1.0'}}};
    var before = JSON.stringify(js);
    expect(convert.js2xml(js, {compact: true})).toEqual('<?xml version="1.0"?><!--before root--><root/>');
    expect(JSON.stringify(js)).toEqual(before);
  });

  it('supports custom keys and indentation through json2xml', function () {
    var js = {data: {foo: 'bar'}, _xmlDeclaration: {_attr: {version: '1.0'}}};
    expect(convert.json2xml(JSON.stringify(js), {
      compact: true, declarationKey: '_xmlDeclaration', attributesKey: '_attr', spaces: 2
    })).toEqual('<?xml version="1.0"?>\n<data>\n  <foo>bar</foo>\n</data>');
  });

  it('does not add a leading newline when the declaration is ignored', function () {
    var js = {_declaration: {_attributes: {version: '1.0'}}, root: {}};
    expect(convert.js2xml(js, {compact: true, ignoreDeclaration: true, spaces: 2})).toEqual('<root/>');
  });

  it('does not serialize an inherited declaration', function () {
    var js = Object.create({_declaration: {_attributes: {version: '1.0'}}});
    js.root = {};
    expect(convert.js2xml(js, {compact: true})).toEqual('<root/>');
  });
});
