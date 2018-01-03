var helper = require('../lib/options-helper');

/*global describe,it,expect*/

describe('Testing options.js:', function () {

  describe('Helpers:', function () {

    describe('Copy options:', function () {

      it('Copy unprovided options', function () {
        expect(helper.copyOptions()).toEqual({});
      });

      it('Copy provided options', function () {
        var options = {ignoreText: true, textKey: true};
        expect(helper.copyOptions(options)).toEqual(options);
      });

    });

    describe('Ensure flag existance:', function () {

      it('New flag', function () {
        var options = {};
        helper.ensureFlagExists('foo', options);
        expect(options).toEqual({foo: false});
      });

      it('Existing flag, not boolean', function () {
        var options = {foo: 123};
        helper.ensureFlagExists('foo', options);
        expect(options).toEqual({foo: false});
      });

      it('Existing flag', function () {
        var options = {foo: true};
        helper.ensureFlagExists('foo', options);
        expect(options).toEqual({foo: true});
      });

    });

    describe('Ensure key existance:', function () {

      it('New key', function () {
        var options = {};
        helper.ensureKeyExists('foo', options);
        expect(options).toEqual({fooKey: 'foo'});
      });

      it('Existing key, not string', function () {
        var options = {fooKey: 123};
        helper.ensureKeyExists('foo', options);
        expect(options).toEqual({fooKey: 'foo'});
      });

      it('Existing key, string', function () {
        var options = {fooKey: 'baa'};
        helper.ensureKeyExists('foo', options);
        expect(options).toEqual({fooKey: 'baa'});
      });

    });

  });

});
