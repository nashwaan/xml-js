/*jslint node:true */
var fs = require('fs');
var common = require('./common');
var xml2json = require('./xml2json');
var json2xml = require('./json2xml');

var possibleArguments = [
    {arg: 'help', type: 'flag', option: 'help', desc: 'Display help content.'},
    {arg: 'src', type: 'file', option: 'src', desc: 'Input file that need to be processed.'},
    {arg: 'out', type: 'file', option: 'out', desc: 'Output file where result should be written.'},
    {arg: 'spaces', type: 'number', option:'spaces', desc: 'Specifies amount of space indentation in the output.'},
    {arg: 'full-tag', type: 'flag', option:'fullTagEmptyElement', desc: 'XML elements will always be in <a></a> form.'},
    {arg: 'no-decl', type: 'flag', option:'ignoreDeclaration', desc: 'Declaration instruction <?xml ..?> will be ignored.'},
    {arg: 'no-attr', type: 'flag', option:'ignoreAttributes', desc: 'Attributes of elements will be ignored.'},
    {arg: 'no-text', type: 'flag', option:'ignoreText', desc: 'Texts of elements will be ignored.'},
    {arg: 'no-cdata', type: 'flag', option:'ignoreCdata', desc: 'Cdata of elements will be ignored.'},
    {arg: 'no-comment', type: 'flag', option:'ignoreComment', desc: 'Comments of elements will be ignored.'},
    {arg: 'trim', type: 'flag', option:'trim', desc: 'Whitespaces surrounding texts will be trimmed.'},
    {arg: 'compact', type: 'flag', option:'compact', desc: 'Compact JSON form (see www.npmjs.com/package/xml-js).'},
    {arg: 'sanitize', type: 'flag', option:'sanitize', desc: 'Special xml characters will be replaced with entity codes.'},
    {arg: 'native-type', type: 'flag', option:'nativeType', desc: 'Text will be converted to native type.'},
    {arg: 'always-children', type: 'flag', option:'alwaysChildren', desc: 'Every element will always contain sub-elements (applicable if --compact is not set).'},
    {arg: 'text-key', type: 'string', option:'textKey', desc: 'To change the default \'text\' key.'},
    {arg: 'cdata-key', type: 'string', option:'cdataKey', desc: 'To change the default \'cdata\' key.'},
    {arg: 'comment-key', type: 'string', option:'commentKey', desc: 'To change the default \'comment\' key.'},
    {arg: 'attributes-key', type: 'string', option:'attributesKey', desc: 'To change the default \'attributes\' key.'},
    {arg: 'declaration-key', type: 'string', option:'declarationKey', desc: 'To change the default \'declaration\' key.'},
    {arg: 'type-key', type: 'string', option:'typeKey', desc: 'To change the default \'type\' key. (applicable if --compact is not set)'},
    {arg: 'cdata-key', type: 'string', option:'name', desc: 'To change the default \'name\' key. (applicable if --compact is not set)'},
    {arg: 'elements-key', type: 'string', option:'elements', desc: 'To change the default \'elements\' key. (applicable if --compact is not set)'}
];

module.exports = function () {
    var output, options = common.mapCommandLineArgs(possibleArguments);
    if (options.help) {
        common.printCommandLineHelp ('xml-js', possibleArguments);
    } else if (fs.statSync(options.src).isFile()) {
        if (options.src.split('.').pop() === 'xml') {
            output = xml2json(fs.readFileSync(options.src, 'utf8'), options);
        } else if (options.src.split('.').pop() === 'json') {
            output = json2xml(fs.readFileSync(options.src, 'utf8'), options);
        }
        if (options.out) {
            fs.writeFileSync(options.out, output, 'utf8');
        } else {
            console.log(output);
        }
    } else {
        return -1;
    }    
};