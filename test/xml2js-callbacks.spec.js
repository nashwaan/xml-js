var convert = require('../lib');
var testItems = require('./test-items');

/*global describe,it,expect*/

var args;

function manipulate(val) {
  args = arguments;
  args[0] = val.toUpperCase();
  return val.toUpperCase();
}

function manipulateAttribute(obj) {
  args = arguments;
  var key, temp;
  for (key in obj) {
    try {
      temp = obj[key];
      delete obj[key];
      obj[key.toUpperCase()] = temp.toUpperCase();
    } catch (e) {}
  }
  return obj;
}

describe('Testing xml2js.js:', function () {

  describe('Adding function callbacks, options = {compact: false}', function () {

    describe('options = {doctypeFn: manipulate}', function () {

      var options = {compact: false, doctypeFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
        if (test.js.elements && test.js.elements[0].doctype) {
          it('should provide correct arguments', function () {
            expect(args).toContain(test.js.elements[test.js.elements.length-1].doctype, test.js);
          });
        }
      });

    });

    describe('options = {instructionFn: manipulate}', function () {

      var options = {compact: false, instructionFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
          // console.log(JSON.stringify(convert.xml2js(test.xml, options)));
        });
        if (test.js.elements && test.js.elements[0].instruction) {
          it('should provide correct arguments', function () {
            expect(args).toContain(test.js.elements[test.js.elements.length-1].instruction, test.js);
            // console.log(JSON.stringify(args), '---------', test.js.elements[0].instruction);
          });
        }
      });

    });

    describe('options = {cdataFn: manipulate}', function () {

      var options = {compact: false, cdataFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
        if (test.js.elements && test.js.elements[0].cdata) {
          it('should provide correct arguments', function () {
            expect(args).toContain(test.js.elements[test.js.elements.length-1].cdata, test.js);
          });
        }
      });

    });

    describe('options = {commentFn: manipulate}', function () {

      var options = {compact: false, commentFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
        if (test.js.elements && test.js.elements[0].comment) {
          it('should provide correct arguments', function () {
            expect(args).toContain(test.js.elements[test.js.elements.length-1].comment, test.js);
          });
        }
      });

    });

    describe('options = {textFn: manipulate}', function () {

      var options = {compact: false, textFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
        if (test.js.elements && test.js.elements[0].text) {
          it('should provide correct arguments', function () {
            expect(args).toContain(test.js.elements[test.js.elements.length-1].text, test.js);
          });
        }
      });

    });

    describe('options = {instructionNameFn: manipulate}', function () {

      var options = {compact: false, instructionNameFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
        if (test.js.elements && test.js.elements[0].instruction) {
          it('should provide correct arguments', function () {
            expect(args).toContain(test.js.elements[test.js.elements.length-1].name, test.js);
          });
        }
      });

    });

    describe('options = {elementNameFn: manipulate}', function () {

      var options = {compact: false, elementNameFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
        if (test.js.elements && test.js.elements[test.js.elements.length-1].type === 'element' && !test.js.elements[test.js.elements.length-1].elements) {
          it('should provide correct arguments', function () {
            expect(args).toContain(test.js.elements[test.js.elements.length-1].name, test.js);
          });
        }
      });

    });

    describe('options = {attributeNameFn: manipulate}', function () {

      var options = {compact: false, attributeNameFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {attributeValueFn: manipulate}', function () {

      var options = {compact: false, attributeValueFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {attributesFn: manipulateAttribute}', function () {

      var options = {compact: false, attributesFn: manipulateAttribute};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
        if (test.js.elements && test.js.elements[test.js.elements.length-1].attributes) {
          it('should provide correct arguments', function () {
            expect(args).toContain(test.js.elements[test.js.elements.length-1].attributes, test.js);
          });
        }
      });

    });

    describe('options = {doctypeFn: manipulate, instructionFn: manipulate, cdataFn: manipulate, commentFn: manipulate, textFn: manipulate}', function () {

      var options = {compact: false, doctypeFn: manipulate, instructionFn: manipulate, cdataFn: manipulate, commentFn: manipulate, textFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {instructionNameFn: manipulate, elementNameFn: manipulate, attributeNameFn: manipulate, attributeValueFn: manipulate}', function () {

      var options = {compact: false, instructionNameFn: manipulate, elementNameFn: manipulate, attributeNameFn: manipulate, attributeValueFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

  });

  describe('Adding function callbacks, options = {compact: true}', function () {

    describe('options = {doctypeFn: manipulate}', function () {

      var options = {compact: true, doctypeFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
        if (test.js._doctype) {
          it('should provide correct arguments', function () {
            expect(args).toContain(test.js._doctype instanceof Array ? test.js._doctype[1] : test.js._doctype, test.js);
          });
        }
      });

    });

    describe('options = {instructionFn: manipulate}', function () {

      var options = {compact: true, instructionFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {cdataFn: manipulate}', function () {

      var options = {compact: true, cdataFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
        if (test.js._cdata) {
          it('should provide correct arguments', function () {
            expect(args).toContain(test.js._cdata instanceof Array ? test.js._cdata[1] : test.js._cdata, test.js);
          });
        }
      });

    });

    describe('options = {commentFn: manipulate}', function () {

      var options = {compact: true, commentFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
        if (test.js._comment) {
          it('should provide correct arguments', function () {
            expect(args).toContain(test.js._comment instanceof Array ? test.js._comment[1] : test.js._comment, test.js);
          });
        }
      });

    });

    describe('options = {textFn: manipulate}', function () {

      var options = {compact: true, textFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
        if (test.js.a && test.js.a._text) {
          it('should provide correct arguments', function () {
            expect(args).toContain(test.js.a._text, test.js.a);
          });
        }
      });

    });

    describe('options = {instructionNameFn: manipulate}', function () {

      var options = {compact: true, instructionNameFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {elementNameFn: manipulate}', function () {

      var options = {compact: true, elementNameFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {attributeNameFn: manipulate}', function () {

      var options = {compact: true, attributeNameFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {attributeValueFn: manipulate}', function () {

      var options = {compact: true, attributeValueFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {attributesFn: manipulateAttribute}', function () {

      var options = {compact: true, attributesFn: manipulateAttribute};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
        if (test.js.a && test.js.a._attributes) {
          it('should provide correct arguments', function () {
            expect(args).toContain(test.js.a._attributes, test.js);
          });
        }
      });

    });

    describe('options = {doctypeFn: manipulate, instructionFn: manipulate, cdataFn: manipulate, commentFn: manipulate, textFn: manipulate}', function () {

      var options = {compact: true, doctypeFn: manipulate, instructionFn: manipulate, cdataFn: manipulate, commentFn: manipulate, textFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {instructionNameFn: manipulate, elementNameFn: manipulate, attributeNameFn: manipulate, attributeValueFn: manipulate}', function () {

      var options = {compact: true, instructionNameFn: manipulate, elementNameFn: manipulate, attributeNameFn: manipulate, attributeValueFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

  });

});
