var convert = require('../lib');
var testItems = require('./test-items');

/*global describe,it,expect*/

function manipulate(val) {
  return val.toUpperCase();
}

function manipulateAttribute(obj) {
  var key, temp;
  for (key in obj) {
    temp = obj[key];
    delete obj[key];
    obj[key.toUpperCase()] = temp.toUpperCase();
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
      });

    });

    describe('options = {instructionFn: manipulate}', function () {

      var options = {compact: false, instructionFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
          // console.log(JSON.stringify(convert.xml2js(test.xml, options)));
        });
      });

    });

    describe('options = {cdataFn: manipulate}', function () {

      var options = {compact: false, cdataFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {commentFn: manipulate}', function () {

      var options = {compact: false, commentFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {textFn: manipulate}', function () {

      var options = {compact: false, textFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {instructionNameFn: manipulate}', function () {

      var options = {compact: false, instructionNameFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {elementNameFn: manipulate}', function () {

      var options = {compact: false, elementNameFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
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
      });

    });

    describe('options = {commentFn: manipulate}', function () {

      var options = {compact: true, commentFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
      });

    });

    describe('options = {textFn: manipulate}', function () {

      var options = {compact: true, textFn: manipulate};
      testItems('xml2js', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.xml2js(test.xml, options)).toEqual(test.js);
        });
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
