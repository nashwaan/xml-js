/*global describe,it,expect,beforeEach,afterEach*/

var convert = require('../lib');
var testItems = require('./test-items');

describe('Testing xml2js.js:', function () {
    'use strict';

    //var books = require('fs').readFileSync('test/fixtures/books.xml', 'utf8');

    describe('No options supplied (fallback to defaults):', function () {

        var options = {};
        testItems('xml2js', options).forEach(function (test) {
            it(test.desc, function () {
                expect(convert.xml2js(test.xml, options)).toEqual(test.js);
            });
        });

    });

    describe('options = {compact: false}', function () {

        describe('Options set to default values explicitly:', function () {

            var options = {singleLine: false, compact: false, trim: false, sanitize: false, nativeType: false, alwaysChildren: false, addParent: false};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

        describe('options = {compact: false}', function () {

            var options = {compact: false};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

        describe('options = {trim: true}', function () {

            var options = {compact: false, trim: true};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

        describe('options = {sanitize: true}', function () {

            var options = {compact: false, sanitize: true};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

        describe('options = {nativeType: true}', function () {

            var options = {compact: false, nativeType: true};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

        describe('options = {alwaysChildren: true}', function () {

            var options = {compact: false, alwaysChildren: true};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

        describe('options = {addParent: true}', function () {

            var options = {compact: false, addParent: true};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

        describe('options = {ignoreText: true}', function () {

            var options = {compact: false, ignoreText: true};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

        describe('options = {ignoreComment: true}', function () {

            var options = {compact: false, ignoreComment: true};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

        describe('options = {ignoreCdata: true}', function () {

            var options = {compact: false, ignoreCdata: true};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

        describe('options = {ignoreDoctype: true}', function () {

            var options = {compact: false, ignoreDoctype: true};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

        describe('options = {ignoreDeclaration: true}', function () {

            var options = {compact: false, ignoreDeclaration: true};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

        describe('options = {ignoreInstruction: true}', function () {

            var options = {compact: false, ignoreInstruction: true};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

    });

    describe('options = {compact: true}', function () {

        describe('Options set to default values explicitly:', function () {

            var options = {compact: true, trim: false, sanitize: false, nativeType: false, alwaysChildren: false, addParent: false};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

        describe('options = {compact: true}', function () {

            var options = {compact: true};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

        describe('options = {trim: true}', function () {

            var options = {compact: true, trim: true};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

        describe('options = {sanitize: true}', function () {

            var options = {compact: true, sanitize: true};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

        describe('options = {alwaysArray: true}', function () {

            var options = {compact: true, alwaysArray: true};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

        describe('options = {addParent: true}', function () {

            var options = {compact: true, addParent: true};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

        describe('options = {ignoreText: true}', function () {

            var options = {compact: true, ignoreText: true};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

        describe('options = {ignoreComment: true}', function () {

            var options = {compact: true, ignoreComment: true};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

        describe('options = {ignoreCdata: true}', function () {

            var options = {compact: true, ignoreCdata: true};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

        describe('options = {ignoreDoctype: true}', function () {

            var options = {compact: true, ignoreDoctype: true};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

        describe('options = {ignoreDeclaration: true}', function () {

            var options = {compact: true, ignoreDeclaration: true};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

        describe('options = {ignoreInstruction: true}', function () {

            var options = {compact: true, ignoreInstruction: true};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

    });

    describe('Varying spaces', function () {

        describe('options = {}', function () {

            var options = {};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

        describe('options = {spaces: true}', function () {

            var options = {spaces: true};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

        describe('options = {spaces: 2}', function () {

            var options = {spaces: 2};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

        describe('options = {spaces: 4}', function () {

            var options = {spaces: 4};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

        describe('options = {spaces: \'  \'}', function () {

            var options = {spaces: '  '};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

        describe('options = {spaces: \\t}', function () {

            var options = {spaces: '\t'};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

    });

    describe('Various options:', function () {

        describe('options = {trim: true}', function () {

            var options = {trim: true};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2js(test.xml, options)).toEqual(test.js);
                });
            });

        });

        describe('options = {nativeType: true}', function () {

            var options = {nativeType: true};

            it('Parse number', function () {
                expect(convert.xml2js('<a>123</a>', options)).toEqual({"elements":[{"type":"element","name":"a","elements":[{"type":"text","text":123}]}]});
            });
            it('Parse true', function () {
                expect(convert.xml2js('<a>true</a>', options)).toEqual({"elements":[{"type":"element","name":"a","elements":[{"type":"text","text":true}]}]});
            });
            it('Parse false', function () {
                expect(convert.xml2js('<a>false</a>', options)).toEqual({"elements":[{"type":"element","name":"a","elements":[{"type":"text","text":false}]}]});
            });
            convert.xml2js('<a>x', {});
            /*it('Parse improper XML', function () {
                expect(convert.xml2js('<a>x', {})).toEqual({"elements":[{"type":"element","name":"a","elements":[{"type":"text","text":"x"}]}]});
            });*/

        });

        describe('options = {instructionHasAttributes: true}', function () {

            var options = {compact: true, instructionHasAttributes: true};

            it('Parse attributes in processing instruction', function () {
                expect(convert.xml2js('<?go to="there"?>', options)).toEqual({"_instruction":{"go":{"_attributes":{"to":"there"}}}});
            });

            it('Parse attributes in processing instruction', function () {
                expect(convert.xml2js('<?go to="there"?>', {instructionHasAttributes: true})).toEqual({"elements":[{"type":"instruction","name":"go","attributes":{"to":"there"}}]});
            });

        });

    });

    describe('xml2json:', function () {

        describe('No options supplied (fallback to defaults):', function () {

            var options = {};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2json(test.xml, options)).toEqual(JSON.stringify(test.js));
                });
            });

        });

        describe('options = {compact: true, addParent: true}:', function () {

            var options = {onlyItem: 6, compact: true, addParent: true};
            testItems('xml2js', options).forEach(function (test) {
                it(test.desc, function () {
                    expect(convert.xml2json(test.xml, options)).toBe(JSON.stringify(test.js, function (k, v) { return k === '_parent'? '_' : v; }));
                });
            });

        });

    });

    describe('User reported issues:', function () {

        describe('case by Mark Pareja', function () {
            // see https://github.com/nashwaan/xml-js/issues/3
            var xml = '<?xml version="1.0" encoding="utf-8"?>\n' +
                      '<dp:ListServicesReply ReturnCode="0" xmlns:dp="http://www.cisco.com/vtg/diagnosticportal">\n' +
                      '  <dp:Schema Version="1.0" />\n' +
                      '  <dp:ServiceList>\n' +
                      '    <dp:Service Name="Cisco ICM usgd1 LoggerA" Description="Provides Call Logging services for Instance usgd1" Status="Running" StartupType="Auto" LogOnAs="****" />\n' +
                      '    <dp:Service Name="Cisco ICM Diagnostic Framework" Description="Provides a web-based diagnostic service for Cisco Unified ICM, Contact Center Enterprise application." Status="Running" StartupType="Auto" LogOnAs="LocalSystem" />\n' +
                      '  </dp:ServiceList>\n' +
                      '</dp:ListServicesReply>';
            var json = {
                "_declaration": {
                    "_attributes": {
                        "version": "1.0",
                        "encoding": "utf-8"
                    }
                },
                "dp:ListServicesReply": {
                    "_attributes": {
                        "ReturnCode": "0",
                        "xmlns:dp": "http://www.cisco.com/vtg/diagnosticportal"
                    },
                    "dp:Schema": {
                        "_attributes": {
                            "Version": "1.0"
                        }
                    },
                    "dp:ServiceList": {
                        "dp:Service": [
                            {
                                "_attributes": {
                                    "Name": "Cisco ICM usgd1 LoggerA",
                                    "Description": "Provides Call Logging services for Instance usgd1",
                                    "Status": "Running",
                                    "StartupType": "Auto",
                                    "LogOnAs": "****"
                                }
                            },
                            {
                                "_attributes": {
                                    "Name": "Cisco ICM Diagnostic Framework",
                                    "Description": "Provides a web-based diagnostic service for Cisco Unified ICM, Contact Center Enterprise application.",
                                    "Status": "Running",
                                    "StartupType": "Auto",
                                    "LogOnAs": "LocalSystem"
                                }
                            }
                        ]
                    }
                }
            };

            it('should output as expected json', function () {
                expect(convert.xml2json(xml, {compact: true})).toEqual(JSON.stringify(json));
            });

        });

        describe('case by Félix Dion Robidoux', function () {
            // see https://github.com/nashwaan/xml-js/issues/6
            var xml = '<ZohoCreator>\n' +
                      '    <applicationslist>\n' +
                      '        <application name="testapp">\n' +
                      '            <formlist>\n' +
                      '                <form name="Untitled_Form">\n' +
                      '                    <add>\n' +
                      '                        <field name="Subform_Single_Line">\n' +
                      '                            <value>BEUHBALUGU</value>\n' +
                      '                        </field>\n' +
                      '                    </add>\n' +
                      '                </form>\n' +
                      '                <form name="Untitled_Form">\n' +
                      '                    <add>\n' +
                      '                        <field name="Subform_Single_Line">\n' +
                      '                            <value>IF YOU CAN SEE THIS YOU DESERVE THE SUCC</value>\n' +
                      '                        </field>\n' +
                      '                    </add>\n' +
                      '                </form>\n' +
                      '            </formlist>\n' +
                      '        </application>\n' +
                      '        <application name="derp">\n' +
                      '            <formlist></formlist>\n' +
                      '        </application>\n' +
                      '    </applicationslist>\n' +
                      '</ZohoCreator>';

            var json = convert.xml2json(xml, {compact: true, spaces: 4});

            it('should output json and reverse it back to xml', function () {
                expect(convert.json2xml(json, {compact: true, spaces: 4, fullTagEmptyElement: true})).toEqual(xml);
            });

        });

        describe('case by misitoth', function () {
            // see https://github.com/nashwaan/xml-js/issues/13
            var xml = '<!DOCTYPE svc_init SYSTEM "MLP_SVC_INIT_300.DTD" [<!ENTITY % extension SYSTEM "PIF_EXTENSION_100.DTD">%extension;]>';
            var json = {"_doctype" : "svc_init SYSTEM \"MLP_SVC_INIT_300.DTD\" [<!ENTITY % extension SYSTEM \"PIF_EXTENSION_100.DTD\">%extension;]"};

            it('should output as expected json', function () {
                expect(convert.xml2js(xml, {compact: true})).toEqual(json);
            });

        });

        describe('case by adamgcraig', function () {
            // see https://github.com/nashwaan/xml-js/issues/26
            var xml =
                '<?xml version="1.0" encoding="UTF-8"?>\n' +
                '<note>\n' +
                '\v<to>xml-js</to>\n' +
                '\v<from>ACraig</from>\n' +
                '\v<heading>Min Example</heading>\n' +
                '\v<body>Here are some characters that get sanitized: " \'</body>\n' +
                '</note>';
            var js = {
                "_declaration": {
                    "_attributes": {
                        "version": "1.0",
                        "encoding": "UTF-8"
                    }
                },
                "note": {
                    "to": {
                        "_text": "xml-js"
                    },
                    "from": {
                        "_text": "ACraig"
                    },
                    "heading": {
                        "_text": "Min Example"
                    },
                    "body": {
                        "_text": "Here are some characters that get sanitized: \" '"
                    }
                }
            };

            it('should convert xml object to js and back to xml correctly', function () {
                xml = xml.replace(/\v/g, '  ');
                var js_ = convert.xml2js(xml, {compact: true});
                expect(js_).toEqual(js);
                expect(convert.js2xml(js_, {spaces: 2, compact: true})).toEqual(xml);
            });

        });

        describe('case by bidiu', function () {
            // see https://github.com/nashwaan/xml-js/issues/26
            var xml = '<title>Support &amp; resistance</title>';
            var js = {
                elements: [{
                    type: 'element',
                    name: 'title',
                    elements: [{
                        type: 'text',
                        text: 'Support & resistance'
                    }]
                }]
            };

            it('should convert xml object to js and back to xml correctly', function () {
                var js_ = convert.xml2js(xml);
                expect(js_).toEqual(js);
                expect(convert.js2xml(js_)).toEqual(xml);
            });

        });

        describe('case by Daniel \'yngwi\'', function () {
            // see https://github.com/nashwaan/xml-js/issues/29
            var xml = '<outer> This is <inner> some</inner> <inner>Text </inner> </outer>';
            var js = {
                elements: [{
                    type: 'element',
                    name: 'outer',
                    elements: [{
                        type: 'text',
                        text: ' This is '
                    }, {
                        type: 'element',
                        name: 'inner',
                        elements: [{
                            type: 'text',
                            text: ' some'
                        }]
                    }, {
                        type: 'text',
                        text: ' '
                    }, {
                        type: 'element',
                        name: 'inner',
                        elements: [{
                            type: 'text',
                            text: 'Text '
                        }]
                    }, {
                        type: 'text',
                        text: ' '
                    }]
                }]
            };

            it('should convert xml object to js and back to xml correctly', function () {
                var js_ = convert.xml2js(xml, {captureSpacesBetweenElements: true});
                expect(js_).toEqual(js);
                expect(convert.js2xml(js_)).toEqual(xml);
            });

        });

        describe('case by Nuno Martins', function () {
            // see https://github.com/nashwaan/xml-js/issues/34
            var xml = '<?xml version=\'1.0\' encoding=\'UTF-8\'?>';
            var js = {
                declaration: {
                    attributes: {
                        version: '1.0',
                        encoding: 'UTF-8'
                    }
                }
            };

            it('should accept XML declarations that use single quotes', function () {
                expect(convert.xml2js(xml)).toEqual(js);
            });
        })

    });

});
