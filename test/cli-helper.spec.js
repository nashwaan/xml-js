var helper = require('../bin/cli-helper');

/*global describe,it,expect*/

describe('Testing cli.js:', function () {

  describe('Getting help and parse arguments:', function () {

    describe('Command line help:', function () {

      it('Return help content', function () {
        var requiredArgs = [{arg: 'src', type: 'any', option: 'src', desc: 'Input file that need to be converted.'}];
        var possibleArgs = [{arg: 'help', alias: 'h', type: 'flag', option: 'help', desc: 'Display help content.'}];
        var help =
          'Usage: foo <src> [options]\n' +
          '  <src>                Input file that need to be converted.\n' +
          '\nOptions:\n' +
          '  --help               Display help content.\n';
        expect(helper.getCommandLineHelp('foo', requiredArgs, possibleArgs)).toEqual(help);
      });

    });

    describe('Map command line argument:', function () {

      if (typeof jasmineRequire === 'undefined') {

        it('Flag argument, alias', function () {
          var possibleArgs = [{arg: 'version', alias: 'v', type: 'flag', option: 'version', desc: 'Display version.'}];
          process.argv.push('-v');
          expect(helper.mapCommandLineArgs({}, possibleArgs)).toEqual({version: true});
          process.argv.pop();
        });

        it('Number argument, long form', function () {
          var possibleArgs = [{arg: 'spaces', type: 'number', option: 'spaces', desc: 'Specify spaces.'}];
          process.argv.push('--spaces'); process.argv.push('5');
          expect(helper.mapCommandLineArgs({}, possibleArgs)).toEqual({spaces: 5});
          process.argv.pop(); process.argv.pop();
        });

        it('String argument, long form', function () {
          var possibleArgs = [{arg: 'name', type: 'string', option: 'name', desc: 'Specify name.'}];
          process.argv.push('--name'); process.argv.push('Foo');
          expect(helper.mapCommandLineArgs({}, possibleArgs)).toEqual({name: 'Foo'});
          process.argv.pop(); process.argv.pop();
        });

        it('File argument, long form', function () {
          var possibleArgs = [{arg: 'input', type: 'file', option: 'input', desc: 'Specify file.'}];
          process.argv.push('--input'); process.argv.push('test.txt');
          expect(helper.mapCommandLineArgs({}, possibleArgs)).toEqual({input: 'test.txt'});
          process.argv.pop(); process.argv.pop();
        });

        it('Argument not proceeded with dash', function () {
          var possibleArgs = [{arg: 'version', alias: 'v', type: 'flag', option: 'version', desc: 'Display version.'}];
          process.argv.push('v');
          expect(helper.mapCommandLineArgs({}, possibleArgs)).not.toEqual({version: true});
          process.argv.pop();
        });

        it('Incomplete compound argument, long form', function () {
          var possibleArgs = [{arg: 'input', type: 'file', option: 'input', desc: 'Specify file.'}];
          process.argv.push('--input');
          expect(helper.mapCommandLineArgs({}, possibleArgs)).toEqual({});
          process.argv.pop();
        });

      }

    });

  });

});
