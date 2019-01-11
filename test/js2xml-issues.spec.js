var convert = require('../lib');
var Script = require('vm').Script;

/*global describe,it,expect*/

describe('Testing js2xml.js:', function () {

  describe('User reported issues:', function () {

    describe('case by Jan T. Sott', function () {
      // see https://github.com/nashwaan/xml-js/issues/2
      var js = {
        _comment: ' Released under The MIT License ',
        snippet: {
          content: {
            _cdata: 'console.log($1)'
          },
          tabTrigger: {
            _text: 'log'
          },
          scope: {
            _text: 'source.js'
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

    describe('case 1 by Denis Carriere ', function () {
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

    describe('case 2 by Denis Carriere', function () {
      // see https://github.com/nashwaan/xml-js/issues/13
      var json =  {
        "_declaration": {
          "_attributes": {
            "version": "1.0",
            "encoding": "utf-8"
          }
        },
        "ServiceExceptionReport": {
          "_attributes": {
            "version": "1.1.1"
          },
          "_doctype": 'ServiceExceptionReport SYSTEM "http://schemas.opengis.net/wms/1.1.1/exception_1_1_1.dtd"',
          "ServiceException": {
            "_text": "foo"
          }
        }
      };
      var xml =
        '<?xml version="1.0" encoding="utf-8"?>\n' +
        '<ServiceExceptionReport version="1.1.1">\n' +
        '  <!DOCTYPE ServiceExceptionReport SYSTEM "http://schemas.opengis.net/wms/1.1.1/exception_1_1_1.dtd">\n' +
        '  <ServiceException>foo</ServiceException>\n' +
        '</ServiceExceptionReport>';

      it('should output as expected xml', function () {
        expect(convert.js2xml(json, {compact: true, spaces: 2})).toEqual(xml);
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

      it('should output cdata without proceeding indentation', function () {
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

      it('should output cdata without proceeding indentation', function () {
        expect(convert.js2xml(js, {compact: false, spaces: 4})).toEqual(xml.replace(/\v/g, '    '));
      });

    });

    describe('case by John ', function () {
      // see https://github.com/nashwaan/xml-js/issues/20
      // var js = {
      //     request: {
      //         user: 'username',
      //         pass: 'password',
      //         numbers: {
      //             number: 1,
      //             number: 2
      //         }
      //     }
      // };
      var js = {
        request: {
          user: {
            _text: 'username'
          },
          pass: {
            _text: 'password'
          },
          numbers: {
            number: [
              {
                _text: 1
              },
              {
                _text: 2
              }
            ]
          }
        }
      };
      var xml =
        '<request>\n' +
        '\v<user>username</user>\n' +
        '\v<pass>password</pass>\n' +
        '\v<numbers>\n' +
        '\v\v<number>1</number>\n' +
        '\v\v<number>2</number>\n' +
        '\v</numbers>\n' +
        '</request>';

      it('should convert javascript object to xml correctly', function () {
        expect(convert.js2xml(js, {spaces: 4, compact: true})).toEqual(xml.replace(/\v/g, '    '));
        // expect(convert.xml2js(xml, {compact: true, nativeType: true})).toEqual(js);
      });

    });

    describe('case by yverenoir', function () {
      // see https://github.com/nashwaan/xml-js/issues/21
      // var js = {
      //     "vertical": {
      //         "-display_name": "Exercise",
      //         "html": {
      //             "-url_name": "12345"
      //         },
      //         "lti_consumer": {
      //             "-url_name": "12345",
      //             "-xblock-family": "xblock.v1",
      //             "-accept_grades_past_due": "false",
      //             "-weight": "14.0",
      //             "-has_score": "true",
      //             "-display_name": "Exercise",
      //             "-ask_to_send_username": "true",
      //             "-ask_to_send_email": "true",
      //             "-button_text": "Launch Exercise",
      //             "-custom_parameters": "none",
      //             "-lti_id": "id",
      //             "-launch_target": "new_window",
      //             "-launch_url": "url"
      //         }
      //     }
      // };
      var js = {
        "vertical": {
          "_attributes": {
            "-display_name": "Exercise"
          },
          "html": {
            "_attributes": {
              "-url_name": "12345"
            }
          },
          "lti_consumer": {
            "_attributes": {
              "-url_name": "12345",
              "-xblock-family": "xblock.v1",
              "-accept_grades_past_due": "false",
              "-weight": "14.0",
              "-has_score": "true",
              "-display_name": "Exercise",
              "-ask_to_send_username": "true",
              "-ask_to_send_email": "true",
              "-button_text": "Launch Exercise",
              "-custom_parameters": "none",
              "-lti_id": "id",
              "-launch_target": "new_window",
              "-launch_url": "url"
            }
          }
        }
      };
      var xml =
        '<vertical -display_name="Exercise">\n' +
        '\v<html -url_name="12345"/>\n' +
        '\v<lti_consumer -url_name="12345" -xblock-family="xblock.v1" -accept_grades_past_due="false" -weight="14.0" -has_score="true" -display_name="Exercise" -ask_to_send_username="true" -ask_to_send_email="true" -button_text="Launch Exercise" -custom_parameters="none" -lti_id="id" -launch_target="new_window" -launch_url="url"/>\n' +
        '</vertical>';

      it('should convert javascript object to xml correctly', function () {
        expect(convert.js2xml(js, {spaces: 4, compact: true})).toEqual(xml.replace(/\v/g, '    '));
      });

    });

    describe('case by mariotsi ', function () {
      // see https://github.com/nashwaan/xml-js/issues/28
      var js = {
        a: {
          _attributes: {
            num: 123
          }
        }
      };
      var xml = '<a num="123"/>';

      it('should process attribute number without issue', function () {
        expect(convert.js2xml(js, {compact: true})).toEqual(xml);
      });

    });

    describe('case by zaesnet ', function () {
      // see https://github.com/nashwaan/xml-js/issues/30
      var js = {
        a: {_text:'Hi There'}
      };
      var xml = '<a>Hi There</a>';
      it('should convert js object to xml', function () {
        expect(convert.js2xml(js, {spaces: 3, fullTagEmptyElement: true, compact: true})).toEqual(xml);
      });

    });

    describe('case by kolis ', function () {
      // see https://github.com/nashwaan/xml-js/issues/31
      var js = {
        parent: {
          _attributes: {
            bar: 1,
            baz: 'hello'
          },
          child: {
            _attributes: {
              attr1: 'a',
              attr2: 'b'
            }
          }
        }
      };
      var xml =
      '<parent\n' +
      '\vbar=1\n' +
      '\vbaz="hello"\n' +
      '>\n' +
      '\v<child\n' +
      '\v\vattr1="a"\n' +
      '\v\vattr2="b"\n' +
      '\v/>\n' +
      '</parent>';
      it('should be able to indent attributes', function () {
        expect(convert.js2xml(js, {indentAttributes: true, spaces: 2, compact: true})).toEqual(xml.replace(/\v/g, '  ').replace('=1', '="1"'));
      });
      it('should be able to indent attributes and no quotes for native attributes', function () {
        expect(convert.js2xml(js, {indentAttributes: true, spaces: 2, compact: true, noQuotesForNativeAttributes: true})).toEqual(xml.replace(/\v/g, '  '));
      });

    });

    describe('case by techborn ', function () {
      // see https://github.com/nashwaan/xml-js/pull/32
      // var js = {
      //     example: {
      //         _text: 'value'
      //     }
      // };
      var js = {
        example: 'value'
      };
      var xml = '<example>value</example>';
      it('should convert element text without _text property', function () {
        expect(convert.js2xml(js, {compact: true})).toEqual(xml);
      });

    });

    describe('case by silentgert', function() {
      // see https://github.com/nashwaan/xml-js/issues/42
      var context = {
        convert: convert,
        output: undefined,
      };
      var scriptCode =
      '(function() {\n' +
      '  const obj = {\n' +
      '    customers : {\n' +
      '      customer: [\n' +
      '        {\n' +
      '          _text: \'John Doe\',\n' +
      '          _attributes: {\n' +
      '            status: \'silver\'\n' +
      '          }\n' +
      '        },\n' +
      '        {\n' +
      '          _text: \'Alice Allgood\',\n' +
      '          _attributes: {\n' +
      '            status: \'gold\'\n' +
      '          }\n' +
      '        }\n' +
      '      ]\n' +
      '    }\n' +
      '  };\n' +
      '  output = convert.js2xml(obj, { compact: true });\n' +
      '})()\n';

      var executableScript = new Script(scriptCode, {
        displayErrors: true,
      });

      it ('should convert Arrays in a different context', function() {
        executableScript.runInNewContext(context);
        expect(context.output).toEqual('<customers><customer status="silver">John Doe</customer><customer status="gold">Alice Allgood</customer></customers>');
      });
    });

    describe('case by Cy-Tek', function() {
      // see https://github.com/nashwaan/xml-js/issues/59
      var js = {
        textless: {
          calling_offer_code: '',
          mailing_code: '',
          vcpi: '' },
      };
      var xml =
      '<textless>\n' +
      '  <calling_offer_code/>\n' +
      '  <mailing_code/>\n' +
      '  <vcpi/>\n' +
      '</textless>';
      it ('should not create full tag for empty elements', function() {
        expect(convert.js2xml(js, {compact: true, spaces: 2, fullTagEmptyElement: false})).toEqual(xml);
      });
    });


  });

});
