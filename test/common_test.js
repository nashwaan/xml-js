/*global describe,it,expect,beforeEach,afterEach*/

var convert = require('../lib/common');

describe('Testing common.js:', function () {
    'use strict';
    
    describe('Common:', function () {
        
        describe('Copy Options:', function () {

            it('Copy no provided options', function () {
                expect(convert.copyOptions()).toEqual({});
            });

            it('Copy provided options', function () {
                var options = {ignoreText: true, textKey: true};
                expect(convert.copyOptions(options)).toEqual(options);
            });

        });

        describe('Ensure Flag Existance:', function () {

            it('New flag', function () {
                var options = {};
                convert.ensureFlagExists('foo', options);
                expect(options).toEqual({foo: false});
            });

            it('Existing flag, not boolean', function () {
                var options = {foo: 123};
                convert.ensureFlagExists('foo', options);
                expect(options).toEqual({foo: false});
            });

            it('Existing flag', function () {
                var options = {foo: true};
                convert.ensureFlagExists('foo', options);
                expect(options).toEqual({foo: true});
            });

        });

        describe('Ensure Key Existance:', function () {

            it('New key', function () {
                var options = {};
                convert.ensureKeyExists('foo', options);
                expect(options).toEqual({fooKey: 'foo'});
            });

            it('Existing key, not string', function () {
                var options = {fooKey: 123};
                convert.ensureKeyExists('foo', options);
                expect(options).toEqual({fooKey: 'foo'});
            });

            it('Existing key, string', function () {
                var options = {fooKey: 'baa'};
                convert.ensureKeyExists('foo', options);
                expect(options).toEqual({fooKey: 'baa'});
            });

        });

        describe('Command Line Help:', function () {

            it('Return help content', function () {
                var requiredArgs = [{arg: 'src', type: 'any', option: 'src', desc: 'Input file that need to be converted.'}];
                var possibleArgs = [{arg: 'help', alias: 'h', type: 'flag', option: 'help', desc: 'Display help content.'}];
                var help = 'Usage: foo <src> [options]\n' +
                           '  <src>                Input file that need to be converted.\n' +
                           '\nOptions:\n' +
                           '  --help               Display help content.\n';
                expect(convert.getCommandLineHelp('foo', requiredArgs, possibleArgs)).toEqual(help);
            });

        });

        describe('Map Command Line Argument:', function () {

            if (typeof jasmineRequire === 'undefined') {
                
                it('Flag argument, alias', function () {
                    var possibleArgs = [{arg: 'version', alias: 'v', type: 'flag', option: 'version', desc: 'Display version.'}];
                    process.argv.push('-v');
                    expect(convert.mapCommandLineArgs({}, possibleArgs)).toEqual({version: true});
                    process.argv.pop();
                });

                it('Number argument, long form', function () {
                    var possibleArgs = [{arg: 'spaces', type: 'number', option: 'spaces', desc: 'Specify spaces.'}];
                    process.argv.push('--spaces'); process.argv.push('5');
                    expect(convert.mapCommandLineArgs({}, possibleArgs)).toEqual({spaces: 5});
                    process.argv.pop(); process.argv.pop();
                });

                it('String argument, long form', function () {
                    var possibleArgs = [{arg: 'name', type: 'string', option: 'name', desc: 'Specify name.'}];
                    process.argv.push('--name'); process.argv.push('Foo');
                    expect(convert.mapCommandLineArgs({}, possibleArgs)).toEqual({name: 'Foo'});
                    process.argv.pop(); process.argv.pop();
                });

                it('File argument, long form', function () {
                    var possibleArgs = [{arg: 'input', type: 'file', option: 'input', desc: 'Specify file.'}];
                    process.argv.push('--input'); process.argv.push('test.txt');
                    expect(convert.mapCommandLineArgs({}, possibleArgs)).toEqual({input: 'test.txt'});
                    process.argv.pop(); process.argv.pop();
                });

                it('Argument not proceeded with dash', function () {
                    var possibleArgs = [{arg: 'version', alias: 'v', type: 'flag', option: 'version', desc: 'Display version.'}];
                    process.argv.push('v');
                    expect(convert.mapCommandLineArgs({}, possibleArgs)).not.toEqual({version: true});
                    process.argv.pop();
                });

                it('Incomplete compound argument, long form', function () {
                    var possibleArgs = [{arg: 'input', type: 'file', option: 'input', desc: 'Specify file.'}];
                    process.argv.push('--input');
                    expect(convert.mapCommandLineArgs({}, possibleArgs)).toEqual({});
                    process.argv.pop();
                });
                
            }

        });

    });
    
});