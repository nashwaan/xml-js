/*jslint node:true*/
/*global describe,it,expect,beforeEach,afterEach*/

var convert = require('../lib/common');

describe('Testing common.js:', function () {
    'use strict';
    
    describe('Options:', function () {
        
        it('Copy options', function () {
            var options = {ignoreText: true, textKey: true};
            expect(convert.copyOptions(options)).toEqual(options);
        });
        
        it('Ensure flag exists', function () {
            var options = {};
            convert.ensureFlagExists('foo', options);
            expect(options).toEqual({foo: false});
        });
        
        it('Ensure flag exists (not string)', function () {
            var options = {foo: 123};
            convert.ensureFlagExists('foo', options);
            expect(options).toEqual({foo: false});
        });
        
        it('Ensure key exists', function () {
            var options = {};
            convert.ensureKeyExists('foo', options);
            expect(options).toEqual({fooKey: 'foo'});
        });
        
        it('Ensure key exists (not string)', function () {
            var options = {fooKey: 123};
            convert.ensureKeyExists('foo', options);
            expect(options).toEqual({fooKey: 'foo'});
        });
        
        it('Get Command Line Help', function () {
            var RequiredArgs = [{arg: 'src', type: 'any', option: 'src', desc: 'Input file that need to be converted.'}];
            var PossibleArgs = [{arg: 'help', alias: 'h', type: 'flag', option: 'help', desc: 'Display help content.'}];
            var help = 'Usage: foo <src> [options]\n' +
                       '  <src>                Input file that need to be converted.\n' +
                       '\nOptions:\n' +
                       '  --help               Display help content.\n';
            expect(convert.getCommandLineHelp('foo', RequiredArgs, PossibleArgs)).toEqual(help);
        });
        
        it('Map Command Line Arguments', function () {
            var args = [{arg: 'version', alias: 'v', type: 'flag', option: 'version', desc: 'Display version.'}];
            process.argv.push('-v');
            expect(convert.mapCommandLineArgs(args)).toEqual({version: true});
        });
        
        it('Map Command Line Arguments', function () {
            var args = [{arg: 'spaces', type: 'number', option: 'spaces', desc: 'Specify spaces.'}];
            process.argv.push('--spaces');
            process.argv.push('5');
            expect(convert.mapCommandLineArgs(args)).toEqual({spaces: 5});
        });
        
    });
    
});
