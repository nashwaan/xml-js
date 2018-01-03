var convert = require('../lib');
var testItems = require('./test-items');

/*global describe,it,expect*/

describe('Testing js2xml.js:', function () {

  describe('No options supplied (fallback to defaults):', function () {

    var options = {};
    testItems('js2xml', options).forEach(function (test) {
      it(test.desc, function () {
        expect(convert.js2xml(test.js, options)).toEqual(test.xml);
      });
    });

  });

  describe('options = {compact: false}', function () {

    describe('Options set to default values explicitly:', function () {

      var options = {compact: false, spaces: 0, ignoreText: false, ignoreComment: false, ignoreCdata: false, fullTagEmptyElement: false};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 4}', function () {

      var options = {spaces: 4, onlyItem: 8};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0}', function () {

      var options = {spaces: 0};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0, ignoreText: true}', function () {

      var options = {spaces: 0, ignoreText: true};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0, ignoreComment: true}', function () {

      var options = {spaces: 0, ignoreComment: true};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0, ignoreCdata: true}', function () {

      var options = {spaces: 0, ignoreCdata: true};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0, ignoreDoctype: true}', function () {

      var options = {spaces: 0, ignoreDoctype: true};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0, ignoreDeclaration: true}', function () {

      var options = {spaces: 0, ignoreDeclaration: true};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0, ignoreInstruction: true}', function () {

      var options = {spaces: 0, ignoreInstruction: true};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0, fullTagEmptyElement: true}', function () {

      var options = {spaces: 0, fullTagEmptyElement: true};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

  });

  describe('options = {compact: true}', function () {

    describe('Options set to default values explicitly:', function () {

      var options = {compact: true, spaces: 0, ignoreText: false, ignoreComment: false, ignoreCdata: false, fullTagEmptyElement: false};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 4}', function () {

      var options = {compact: true, spaces: 4};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0}', function () {

      var options = {compact: true, spaces: 0};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0, ignoreText: true}', function () {

      var options = {compact: true, spaces: 0, ignoreText: true};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0, ignoreComment: true}', function () {

      var options = {compact: true, spaces: 0, ignoreComment: true};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0, ignoreCdata: true}', function () {

      var options = {compact: true, spaces: 0, ignoreCdata: true};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0, ignoreDoctype: true}', function () {

      var options = {compact: true, spaces: 0, ignoreDoctype: true};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0, ignoreDeclaration: true}', function () {

      var options = {compact: true, spaces: 0, ignoreDeclaration: true};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0, ignoreInstruction: true}', function () {

      var options = {compact: true, spaces: 0, ignoreInstruction: true};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 0, fullTagEmptyElement: true}', function () {

      var options = {compact: true, spaces: 0, fullTagEmptyElement: true};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

  });

  describe('Varying spaces', function () {

    describe('options = {}', function () {

      var options = {};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: true}', function () {

      var options = {spaces: true};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 2}', function () {

      var options = {spaces: 2};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: 4}', function () {

      var options = {spaces: 4};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: \'  \'}', function () {

      var options = {spaces: '  '};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('options = {spaces: \\t}', function () {

      var options = {spaces: '\t'};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.js2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

  });

  describe('json2xml:', function () {

    describe('using default options', function () {

      var options = {};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.json2xml(JSON.stringify(test.js), options)).toEqual(test.xml);
        });
      });

    });

    describe('submitting json as javascript object', function () {

      var options = {};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.json2xml(test.js, options)).toEqual(test.xml);
        });
      });

    });

    describe('using buffer', function () {

      var options = {};
      testItems('js2xml', options).forEach(function (test) {
        it(test.desc, function () {
          expect(convert.json2xml(new Buffer(JSON.stringify(test.js)), options)).toEqual(test.xml);
        });
      });

    });

    describe('improper json', function () {

      try {
        convert.json2xml('{a:', {});
      } catch (e) {
        e.note = 'ignore me';
      }

    });

  });

  describe('Various options:', function () {

    describe('options = {instructionHasAttributes: true}', function () {

      it('Write processing instruction attributes, {compact: true}', function () {
        expect(convert.js2xml({"_instruction":{"go":{"_attributes":{"to":"there"}}}}, {compact: true})).toEqual('<?go to="there"?>');
      });

      it('Write processing instruction attributes, {compact: false}', function () {
        expect(convert.js2xml({"elements":[{"type":"instruction","name":"go","attributes":{"to":"there"}}]})).toEqual('<?go to="there"?>');
      });

    });

  });

});
