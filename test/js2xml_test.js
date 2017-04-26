/*global describe,it,expect,beforeEach*/

var convert = require('../lib');
var testItems = require('./test-items');

describe('Testing js2xml.js:', function () {
    'use strict';
    
    describe('No options supplied (fallback to defaults):', function () {
        
        var options = {};
        testItems(options).forEach(function (test) {
            it(test.desc, function () {
                expect(convert.js2xml(test.js, options)).toEqual(test.xml);
            });
        });
        
    });
    
    describe('options = {compact: true}', function () {
        
        describe('Options set to default values explicitly:', function () {
            
            var options = {compact: true, spaces: 0, ignoreText: false, ignoreComment: false, ignoreCdata: false, fullTagEmptyElement: false};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.js2xml(test.js, options)).toEqual(test.xml);
                });
            });
            
        });
        
        describe('options = {spaces: 4}', function () {
            
            var options = {compact: true, spaces: 4};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.js2xml(test.js, options)).toEqual(test.xml);
                });
            });
            
        });
        
        describe('options = {spaces: 0}', function () {
            
            var options = {compact: true, spaces: 0};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.js2xml(test.js, options)).toEqual(test.xml);
                });
            });
            
        });
        
        describe('options = {spaces: 0, ignoreText: true}', function () {
            
            var options = {compact: true, spaces: 0, ignoreText: true};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.js2xml(test.js, options)).toEqual(test.xml);
                });
            });
            
        });
        
        describe('options = {spaces: 0, ignoreComment: true}', function () {
            
            var options = {compact: true, spaces: 0, ignoreComment: true};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.js2xml(test.js, options)).toEqual(test.xml);
                });
            });
            
        });
        
        describe('options = {spaces: 0, ignoreCdata: true}', function () {
            
            var options = {compact: true, spaces: 0, ignoreCdata: true};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.js2xml(test.js, options)).toEqual(test.xml);
                });
            });
            
        });
        
        describe('options = {spaces: 0, fullTagEmptyElement: true}', function () {
            
            var options = {compact: true, spaces: 0, fullTagEmptyElement: true};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.js2xml(test.js, options)).toEqual(test.xml);
                });
            });
            
        });
        
    });
        
    describe('options = {compact: false}', function () {
        
        describe('Options set to default values explicitly:', function () {
            
            var options = {compact: false, spaces: 0, ignoreText: false, ignoreComment: false, ignoreCdata: false, fullTagEmptyElement: false};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.js2xml(test.js, options)).toEqual(test.xml);
                });
            });
            
        });
        
        describe('options = {spaces: 4}', function () {
            
            var options = {spaces: 4, onlyItem: 8};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.js2xml(test.js, options)).toEqual(test.xml);
                });
            });
            
        });
        
        describe('options = {spaces: 0}', function () {
            
            var options = {spaces: 0};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.js2xml(test.js, options)).toEqual(test.xml);
                });
            });
            
        });
        
        describe('options = {spaces: 0, ignoreText: true}', function () {
            
            var options = {spaces: 0, ignoreText: true};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.js2xml(test.js, options)).toEqual(test.xml);
                });
            });
            
        });
        
        describe('options = {spaces: 0, ignoreComment: true}', function () {
            
            var options = {spaces: 0, ignoreComment: true};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.js2xml(test.js, options)).toEqual(test.xml);
                });
            });
            
        });
        
        describe('options = {spaces: 0, ignoreCdata: true}', function () {
            
            var options = {spaces: 0, ignoreCdata: true};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.js2xml(test.js, options)).toEqual(test.xml);
                });
            });
            
        });
        
        describe('options = {spaces: 0, fullTagEmptyElement: true}', function () {
            
            var options = {spaces: 0, fullTagEmptyElement: true};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.js2xml(test.js, options)).toEqual(test.xml);
                });
            });
            
        });
        
    });
        
    describe('Varying spaces', function () {
        
        describe('options = {}', function () {
            
            var options = {};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.js2xml(test.js, options)).toEqual(test.xml);
                });
            });
            
        });
        
        describe('options = {spaces: true}', function () {
            
            var options = {spaces: true};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.js2xml(test.js, options)).toEqual(test.xml);
                });
            });
            
        });
        
        describe('options = {spaces: 2}', function () {
            
            var options = {spaces: 2};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.js2xml(test.js, options)).toEqual(test.xml);
                });
            });
            
        });
        
        describe('options = {spaces: 4}', function () {
            
            var options = {spaces: 4};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.js2xml(test.js, options)).toEqual(test.xml);
                });
            });
            
        });
        
        describe('options = {spaces: \'  \'}', function () {
            
            var options = {spaces: '  '};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.js2xml(test.js, options)).toEqual(test.xml);
                });
            });
            
        });
        
        describe('options = {spaces: \\t}', function () {
            
            var options = {spaces: '\t'};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.js2xml(test.js, options)).toEqual(test.xml);
                });
            });
            
        });
        
    });
    
    describe('json2xml:', function () {
        
        describe('using default options', function () {
            
            var options = {};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.json2xml(JSON.stringify(test.js), options)).toEqual(test.xml);
                });
            });
            
        });
        
        describe('submitting json as javascript object', function () {
            
            var options = {};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.json2xml(test.js, options)).toEqual(test.xml);
                });
            });
            
        });
        
        describe('using buffer', function () {
            
            var options = {};
            testItems(options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.json2xml(new Buffer(JSON.stringify(test.js)), options)).toEqual(test.xml);
                });
            });
            
        });
        
        describe('imporper json', function () {
            
            try {
                convert.json2xml('{a:', {});
            } catch (e) {
                e.note = 'ignore me';
            }
            
        });
        
    });

    describe('User reported issues:', function () {
        
        describe('case by Jan T. Sott', function () {
            // see https://github.com/nashwaan/xml-js/issues/2
            var js = {
                _comment: " Released under The MIT License ",
                snippet: {
                    content: {
                        _cdata: "console.log($1)"
                    },
                    tabTrigger: {
                        _text: "log"
                    },
                    scope: {
                        _text: "source.js"
                    }
                }
            };
            var xml = 
                '<!-- Released under The MIT License -->\n' + 
                '<snippet>\n' + 
                '\v<content><![CDATA[console.log($1)]]></content>\n' + 
                '\v<tabTrigger>log</tabTrigger>\n' + 
                '\v<scope>source.js</scope>\n' + 
                '</snippet>';
            
            it('should output cdata and text unformatted', function () {
                expect(convert.js2xml(js, {compact: true})).toEqual(xml.replace(/\v|\n/g, ''));
            });

            it('should output cdata and text formatted', function () {
                expect(convert.js2xml(js, {compact: true, spaces: 4})).toEqual(xml.replace(/\v/g, '    '));
            });

        });
        
        describe('case by Denis Carriere ', function () {
            // see https://github.com/nashwaan/xml-js/issues/5
            var js1 = {
                a: {
                    b: {
                        _text: 'foo bar'
                    }
                }
            };
            var js2 = {
                elements: [{
                    type: 'element',
                    name: 'a',
                    elements: [{
                        type: 'element',
                        name: 'b',
                        elements: [{
                            type: 'text',
                            text: 'foo bar'
                        }]
                    }]
                }]
            };
            var xml = '<a>\n' + 
                '\v<b>foo bar</b>\n' + 
                '</a>';
                
            it('should output xml of compact js input', function () {
                expect(convert.js2xml(js1, {compact: true, spaces: 4})).toEqual(xml.replace(/\v/g, '    '));
            });

            it('should output xml of non-compact js input', function () {
                expect(convert.js2xml(js2, {compact: false, spaces: 4})).toEqual(xml.replace(/\v/g, '    '));
            });

        });
        
        describe('case 1 by Henning Hagmann ', function () {
            // see https://github.com/nashwaan/xml-js/issues/14
            var js = {
                _declaration: {
                    _attributes: {
                        version: '1.0'
                    }
                },
                group: {
                    name: {
                        _cdata: 'An example name'
                    }
                }
            };
            var xml = '<?xml version="1.0"?>\n' + 
                '<group>\n' + 
                '\v<name><![CDATA[An example name]]></name>\n' + 
                '</group>';
                
            it('should output cdata without preceeding indentation', function () {
                expect(convert.js2xml(js, {compact: true, spaces: 4, fullTagEmptyElement: true})).toEqual(xml.replace(/\v/g, '    '));
            });

        });
        
        describe('case 2 by Henning Hagmann ', function () {
            // see https://github.com/nashwaan/xml-js/issues/14
            var js = {
                declaration: {
                    attributes: {
                        version: '1.0'
                    }
                },
                elements: [{
                    type: 'element',
                    name: 'group',
                    elements: [{
                        type: 'element',
                        name: 'name',
                        elements: [{
                            type: 'text',
                            text: 'The url '
                        }, {
                            type: 'cdata',
                            cdata: 'http://www.test.com'
                        }, {
                            type: 'text',
                            text: ' and name '
                        }, {
                            type: 'cdata',
                            cdata: 'examplename'
                        }, {
                            type: 'text',
                            text: ' are wrapped'
                        }]
                    }]
                }]
            };
            var xml = '<?xml version="1.0"?>\n' + 
                '<group>\n' + 
                '\v<name>The url <![CDATA[http://www.test.com]]> and name <![CDATA[examplename]]> are wrapped</name>\n' + 
                '</group>';
                
            it('should output cdata without preceeding indentation', function () {
                expect(convert.js2xml(js, {compact: false, spaces: 4})).toEqual(xml.replace(/\v/g, '    '));
            });

        });
        
    });
    
});
