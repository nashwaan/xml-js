var convert = require('../lib');

/*global jasmine,describe,it,expect*/

var args;

function manipulate(val) {
  args = arguments;
  return val.toUpperCase();
}

function manipulateAttribute(obj) {
  args = arguments;
  var key, temp;
  for (key in obj) {
    temp = obj[key];
    delete obj[key];
    obj[key.toUpperCase()] = temp.toUpperCase();
  }
  return obj;
}

function fullTag(name) {
  args = arguments;
  return name === 'b';
}

describe('Testing js2xml.js:', function () {

  describe('Adding function callbacks, options = {compact: false}', function () {

    describe('options = {doctypeFn: manipulate}', function () {

      var js = {"elements":[{"type":"doctype","doctype":"note [\n<!ENTITY foo \"baa\">]"}]};
      var xml = '<!DOCTYPE ' + manipulate('note [\n<!ENTITY foo "baa">]') + '>';
      it('<!DOCTYPE note [\\n<!ENTITY foo "baa">]>', function () {
        expect(convert.js2xml(js, {compact: false, doctypeFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toEqual(jasmine.arrayContaining(['note [\n<!ENTITY foo "baa">]', '_root_', js]));
      });

    });

    describe('options = {instructionFn: manipulate}', function () {

      var js = {"elements":[{"type":"instruction","name":"go","instruction":"there"}]};
      var xml = '<?go ' + manipulate('there') + '?>';
      it('<?go there?>', function () {
        expect(convert.js2xml(js, {compact: false, instructionFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toEqual(jasmine.arrayContaining(['there', 'go', '_root_', js]));
      });

    });

    describe('options = {cdataFn: manipulate}', function () {

      var js = {"elements":[{"type":"cdata","cdata":" \t <foo></bar> \t "}]};
      var xml = '<![CDATA[' + manipulate(' \t <foo></bar> \t ') + ']]>';
      it('<![CDATA[ \t <foo></bar> \t ]]>', function () {
        expect(convert.js2xml(js, {compact: false, cdataFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toEqual(jasmine.arrayContaining([' \t <foo></bar> \t ', '_root_', js]));
        // console.log(JSON.stringify(args));
      });

    });

    describe('options = {commentFn: manipulate}', function () {

      var js = {"elements":[{"type":"comment","comment":" \t Hello, World! \t "}]};
      var xml = '<!--' + manipulate(' \t Hello, World! \t ') + '-->';
      it('<!-- \t Hello, World! \t -->', function () {
        expect(convert.js2xml(js, {compact: false, commentFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toEqual(jasmine.arrayContaining([' \t Hello, World! \t ', '_root_', js]));
      });

    });

    describe('options = {textFn: manipulate}', function () {

      var js = {"elements":[{"type":"element","name":"a","elements":[{"type":"text","text":" \t Hi \t "}]}]};
      var xml = '<a>' + manipulate(' \t Hi \t ') + '</a>';
      it('<a> \t Hi \t </a>', function () {
        expect(convert.js2xml(js, {compact: false, textFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toEqual(jasmine.arrayContaining([' \t Hi \t ', 'a', js.elements[0]]));
      });

    });

    describe('options = {instructionNameFn: manipulate}', function () {

      var js = {"elements":[{"type":"instruction","name":"go","instruction":"there"}]};
      var xml = '<?' + manipulate('go') + ' there?>';
      it('<?go there?>', function () {
        expect(convert.js2xml(js, {compact: false, instructionNameFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toEqual(jasmine.arrayContaining(['go', '_root_', js]));
      });

    });

    describe('options = {elementNameFn: manipulate}', function () {

      var js = {"elements":[{"type":"element","name":"a","attributes":{"x":"hello"}}]};
      var xml = '<' + manipulate('a') + ' x="hello"/>';
      it('<a x="hello"/>', function () {
        expect(convert.js2xml(js, {compact: false, elementNameFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toEqual(jasmine.arrayContaining(['a', js.elements[0]]));
      });

    });

    describe('options = {attributeNameFn: manipulate}', function () {

      var js = {"elements":[{"type":"element","name":"a","attributes":{"x":"1.234","y":"It\'s"}}]};
      var xml = '<a ' + manipulate('x') + '="1.234" ' + manipulate('y') + '="It\'s"/>';
      it('<a x="1.234" y="It\'s"/>', function () {
        expect(convert.js2xml(js, {compact: false, attributeNameFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toEqual(jasmine.arrayContaining(['y', 'It\'s', 'a', js.elements[0]]));
      });

    });

    describe('options = {attributeValueFn: manipulate}', function () {

      var js = {"elements":[{"type":"element","name":"a","attributes":{"x":"1.234","y":"It\'s"}}]};
      var xml = '<a x="' + manipulate('1.234') + '" y="' + manipulate('It\'s') + '"/>';
      it('<a x="1.234" y="It\'s"/>', function () {
        expect(convert.js2xml(js, {compact: false, attributeValueFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toEqual(jasmine.arrayContaining(['It\'s', 'y', 'a', js.elements[0]]));
      });

    });

    describe('options = {attributesFn: manipulateAttribute}', function () {

      var js = {"elements":[{"type":"element","name":"a","attributes":{"x":"1.234","y":"It\'s"}}]};
      var xml = '<a ' + manipulate('x="1.234" y="It\'s"') + '/>';
      it('<a x="1.234" y="It\'s"/>', function () {
        expect(convert.js2xml(js, {compact: false, attributesFn: manipulateAttribute})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toEqual(jasmine.arrayContaining([{"X":"1.234","Y":"IT\'S"}, 'a', js.elements[0]]));
      });

    });

  });

  describe('Adding function callbacks, options = {compact: true}', function () {

    describe('options = {doctypeFn: manipulate}', function () {

      var js = {"_doctype":"note [\n<!ENTITY foo \"baa\">]"};
      var xml = '<!DOCTYPE ' + manipulate('note [\n<!ENTITY foo "baa">]') + '>';
      it('<!DOCTYPE note [\\n<!ENTITY foo "baa">]>', function () {
        expect(convert.js2xml(js, {compact: true, doctypeFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toEqual(jasmine.arrayContaining(['note [\n<!ENTITY foo "baa">]', '_root_', js]));
      });

    });

    describe('options = {instructionFn: manipulate}', function () {

      var js = {"_instruction":{"go": "there"}};
      var xml = '<?go ' + manipulate('there') + '?>';
      it('<?go there?>', function () {
        expect(convert.js2xml(js, {compact: true, instructionFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toEqual(jasmine.arrayContaining(['there', 'go', '_root_', js]));
      });

    });

    describe('options = {cdataFn: manipulate}', function () {

      var js = {"_cdata":" \t <foo></bar> \t "};
      var xml = '<![CDATA[' + manipulate(' \t <foo></bar> \t ') + ']]>';
      it('<![CDATA[ \t <foo></bar> \t ]]>', function () {
        expect(convert.js2xml(js, {compact: true, cdataFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toEqual(jasmine.arrayContaining([' \t <foo></bar> \t ', '_root_', js]));
      });

    });

    describe('options = {commentFn: manipulate}', function () {

      var js = {"_comment":" \t Hello, World! \t "};
      var xml = '<!--' + manipulate(' \t Hello, World! \t ') + '-->';
      it('<!-- \t Hello, World! \t -->', function () {
        expect(convert.js2xml(js, {compact: true, commentFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toEqual(jasmine.arrayContaining([' \t Hello, World! \t ', '_root_', js]));
      });

    });

    describe('options = {textFn: manipulate}', function () {

      var js = {"a":{"_text":" \t Hi \t "}};
      var xml = '<a>' + manipulate(' \t Hi \t ') + '</a>';
      it('<a> \t Hi \t </a>', function () {
        expect(convert.js2xml(js, {compact: true, textFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toEqual(jasmine.arrayContaining([' \t Hi \t ', 'a', js.a]));
      });

    });

    describe('options = {instructionNameFn: manipulate}', function () {

      var js = {"_instruction":{"go": "there"}};
      var xml = '<?' + manipulate('go') + ' there?>';
      it('<?go there?>', function () {
        expect(convert.js2xml(js, {compact: true, instructionNameFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toEqual(jasmine.arrayContaining(['go', 'there', '_root_', js]));
      });

    });

    describe('options = {elementNameFn: manipulate}', function () {

      var js = {"a":{_attributes:{"x":"hello"}}};
      var xml = '<' + manipulate('a') + ' x="hello"/>';
      it('<a x="hello"/>', function () {
        expect(convert.js2xml(js, {compact: true, elementNameFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toEqual(jasmine.arrayContaining(['a', js.a]));
      });

    });

    describe('options = {attributeNameFn: manipulate}', function () {

      var js = {"a":{_attributes:{"x":"1.234","y":"It\'s"}}};
      var xml = '<a ' + manipulate('x') + '="1.234" ' + manipulate('y') + '="It\'s"/>';
      it('<a x="1.234" y="It\'s"/>', function () {
        expect(convert.js2xml(js, {compact: true, attributeNameFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toEqual(jasmine.arrayContaining(['y', 'It\'s', 'a', js.a]));
      });

    });

    describe('options = {attributeValueFn: manipulate}', function () {

      var js = {"a":{_attributes:{"x":"1.234","y":"It\'s"}}};
      var xml = '<a x="' + manipulate('1.234') + '" y="' + manipulate('It\'s') + '"/>';
      it('<a x="1.234" y="It\'s"/>', function () {
        expect(convert.js2xml(js, {compact: true, attributeValueFn: manipulate})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toEqual(jasmine.arrayContaining(['It\'s', 'y', 'a', js.a]));
      });

    });

    describe('options = {attributesFn: manipulateAttribute}', function () {

      var js = {"a":{_attributes:{"x":"1.234","y":"It\'s"}}};
      var xml = '<a ' + manipulate('x="1.234" y="It\'s"') + '/>';
      it('<a x="1.234" y="It\'s"/>', function () {
        expect(convert.js2xml(js, {compact: true, attributesFn: manipulateAttribute})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toEqual(jasmine.arrayContaining([{"X":"1.234","Y":"IT\'S"}, 'a', js.a]));
      });

    });

  });

  describe('options = {fullTagEmptyElementFn: fullTag}', function () {

    describe('options = {compact: false}', function () {

      var js = {"elements":[{"type":"element","name":"a"},{"type":"element","name":"b"}]};
      var xml = '<a/><b></b>';
      it('<a/><b/>', function () {
        expect(convert.js2xml(js, {compact: false, fullTagEmptyElementFn: fullTag})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toEqual(jasmine.arrayContaining(['b', js.elements[1]]));
      });

    });

    describe('options = {compact: true}', function () {

      var js = {"a":{},"b":{}};
      var xml = '<a/><b></b>';
      it('<a/><b/>', function () {
        expect(convert.js2xml(js, {compact: true, fullTagEmptyElementFn: fullTag})).toEqual(xml);
      });
      it('should provide correct arguments', function () {
        expect(args).toEqual(jasmine.arrayContaining(['b', js.b]));
      });

    });

  });

});
