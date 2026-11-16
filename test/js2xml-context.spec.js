var convert = require('../lib');

/*global describe,it,expect*/

describe('JS to XML mixed-content callback context', function () {

  it('restores each noncompact parent after nested and empty sibling elements', function () {
    var js = convert.xml2js('<root>before<child>inside<grandchild>deep</grandchild>child-after</child>after<empty/>last</root>');
    var root = js.elements[0];
    var child = root.elements[1];
    var grandchild = child.elements[1];
    var calls = [];
    var xml = convert.js2xml(js, {textFn: function (value, name, element) {
      calls.push([value, name, element]);
      return name + ':' + value;
    }});
    expect(xml).toBe('<root>root:before<child>child:inside<grandchild>grandchild:deep</grandchild>child:child-after</child>root:after<empty/>root:last</root>');
    expect(calls.map(function (call) { return call[1]; })).toEqual(['root', 'child', 'grandchild', 'child', 'root', 'root']);
    [root, child, grandchild, child, root, root].forEach(function (element, i) {
      expect(calls[i][2]).toBe(element);
    });
  });

  it('uses the document object for callbacks after a noncompact root element', function () {
    var js = convert.xml2js('<root/><!--after-->');
    var context;
    expect(convert.js2xml(js, {commentFn: function (value, name, element) {
      context = [name, element];
      return value;
    }})).toBe('<root/><!--after-->');
    expect(context[0]).toBe('_root_');
    expect(context[1]).toBe(js);
  });

  ['cdata', 'comment', 'instruction'].forEach(function (type) {
    it('restores the noncompact parent for ' + type + ' callbacks', function () {
      var js = convert.xml2js('<root><child/>body</root>');
      var root = js.elements[0];
      var content = {type: type};
      content[type] = 'body';
      if (type === 'instruction') content.name = 'go';
      root.elements[1] = content;
      var options = {};
      var calls = [];
      options[type + 'Fn'] = function (value, name, element, instructionElement) {
        calls.push(type === 'instruction' ? [element, instructionElement] : [name, element]);
        return value;
      };
      if (type === 'instruction') {
        options.instructionNameFn = function (name, value, parentName, parent) {
          calls.push([parentName, parent]);
          return name;
        };
      }
      var expected = {cdata: '<![CDATA[body]]>', comment: '<!--body-->', instruction: '<?go body?>'};
      expect(convert.js2xml(js, options)).toBe('<root><child/>' + expected[type] + '</root>');
      calls.forEach(function (call) {
        expect(call[0]).toBe('root');
        expect(call[1]).toBe(root);
      });
    });
  });

  it('restores the noncompact parent after an instruction with attributes', function () {
    var root = {type: 'element', name: 'root', elements: [
      {type: 'instruction', name: 'go', attributes: {mode: 'test'}},
      {type: 'text', text: 'after'}
    ]};
    var calls = [];
    var xml = convert.js2xml({elements: [root]}, {textFn: function (value, name, element) {
      calls.push([name, element]);
      return value;
    }});
    expect(xml).toBe('<root><?go mode="test"?>after</root>');
    expect(calls[0][0]).toBe('root');
    expect(calls[0][1]).toBe(root);
  });

  it('restores compact parents after nested elements and sibling arrays', function () {
    var leaf = {_text: 'inside'};
    var child = {leaf: [leaf, {}], _text: 'child-after'};
    var root = {child: child, _text: 'after'};
    var calls = [];
    var xml = convert.js2xml({root: root}, {compact: true, textFn: function (value, name, element) {
      calls.push([name, element]);
      return name + ':' + value;
    }});
    expect(xml).toBe('<root><child><leaf>leaf:inside</leaf><leaf/>child:child-after</child>root:after</root>');
    expect(calls.map(function (call) { return call[0]; })).toEqual(['leaf', 'child', 'root']);
    [leaf, child, root].forEach(function (element, i) {
      expect(calls[i][1]).toBe(element);
    });
  });

  it('restores compact parents for content after child elements and attributed instructions', function () {
    var root = {child: {}, _instruction: {go: {_attributes: {mode: 'test'}}}, _cdata: 'data', _comment: 'comment', _text: 'after'};
    var calls = [];
    var options = {compact: true};
    ['cdata', 'comment', 'text'].forEach(function (type) {
      options[type + 'Fn'] = function (value, name, element) {
        calls.push([name, element]);
        return value;
      };
    });
    options.instructionNameFn = function (name, value, parentName, parent) {
      calls.push([parentName, parent]);
      return name;
    };
    expect(convert.js2xml({root: root}, options)).toBe('<root><child/><?go mode="test"?><![CDATA[data]]><!--comment-->after</root>');
    expect(calls.length).toBe(4);
    calls.forEach(function (call) {
      expect(call[0]).toBe('root');
      expect(call[1]).toBe(root);
    });
  });

});
