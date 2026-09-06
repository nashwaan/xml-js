import { xml2json, json2xml, xml2js, js2xml } from '../lib';

/*eslint quotes: 0*/ // --> turn off error of strings surrounded by double quotes
/*global describe,xdescribe,it,expect*/

describe('Testing xml2js.js:', () => {
  describe('User reported issues on github:', () => {
    test('case by Mark Pareja should output as expected json', () => {
      // see https://github.com/nashwaan/xml-js/issues/3
      var xml =
        '<?xml version="1.0" encoding="utf-8"?>\n' +
        '<dp:ListServicesReply ReturnCode="0" xmlns:dp="http://www.cisco.com/vtg/diagnosticportal">\n' +
        '  <dp:Schema Version="1.0" />\n' +
        '  <dp:ServiceList>\n' +
        '    <dp:Service Name="Cisco ICM usgd1 LoggerA" Description="Provides Call Logging services for Instance usgd1" Status="Running" StartupType="Auto" LogOnAs="****" />\n' +
        '    <dp:Service Name="Cisco ICM Diagnostic Framework" Description="Provides a web-based diagnostic service for Cisco Unified ICM, Contact Center Enterprise application." Status="Running" StartupType="Auto" LogOnAs="LocalSystem" />\n' +
        '  </dp:ServiceList>\n' +
        '</dp:ListServicesReply>';
      var json = {
        _declaration: {
          _attributes: {
            version: '1.0',
            encoding: 'utf-8',
          },
        },
        'dp:ListServicesReply': {
          _attributes: {
            ReturnCode: '0',
            'xmlns:dp': 'http://www.cisco.com/vtg/diagnosticportal',
          },
          'dp:Schema': {
            _attributes: {
              Version: '1.0',
            },
          },
          'dp:ServiceList': {
            'dp:Service': [
              {
                _attributes: {
                  Name: 'Cisco ICM usgd1 LoggerA',
                  Description:
                    'Provides Call Logging services for Instance usgd1',
                  Status: 'Running',
                  StartupType: 'Auto',
                  LogOnAs: '****',
                },
              },
              {
                _attributes: {
                  Name: 'Cisco ICM Diagnostic Framework',
                  Description:
                    'Provides a web-based diagnostic service for Cisco Unified ICM, Contact Center Enterprise application.',
                  Status: 'Running',
                  StartupType: 'Auto',
                  LogOnAs: 'LocalSystem',
                },
              },
            ],
          },
        },
      };
      expect(xml2json(xml, { compact: true })).toEqual(JSON.stringify(json));
    });

    test('case by Félix Dion Robidoux should output json and reverse it back to xml', () => {
      // see https://github.com/nashwaan/xml-js/issues/6
      var xml =
        '<ZohoCreator>\n' +
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

      var json = xml2json(xml, { compact: true, spaces: 4 });

      expect(
        json2xml(json, {
          compact: true,
          spaces: 4,
          fullTagEmptyElement: true,
        }),
      ).toEqual(xml);
    });

    test('case by misitoth should output as expected json', () => {
      // see https://github.com/nashwaan/xml-js/issues/13
      var xml =
        '<!DOCTYPE svc_init SYSTEM "MLP_SVC_INIT_300.DTD" [<!ENTITY % extension SYSTEM "PIF_EXTENSION_100.DTD">%extension;]>';
      var json = {
        _doctype:
          'svc_init SYSTEM "MLP_SVC_INIT_300.DTD" [<!ENTITY % extension SYSTEM "PIF_EXTENSION_100.DTD">%extension;]',
      };

      expect(xml2js(xml, { compact: true })).toEqual(json);
    });

    test('case by adamgcraig should convert xml object to js and back to xml correctly', () => {
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
        _declaration: {
          _attributes: {
            version: '1.0',
            encoding: 'UTF-8',
          },
        },
        note: {
          to: {
            _text: 'xml-js',
          },
          from: {
            _text: 'ACraig',
          },
          heading: {
            _text: 'Min Example',
          },
          body: {
            _text: 'Here are some characters that get sanitized: " \'',
          },
        },
      };

      xml = xml.replace(/\v/g, '  ');
      var js_ = xml2js(xml, { compact: true });
      expect(js_).toEqual(js);
      expect(js2xml(js_, { spaces: 2, compact: true })).toEqual(xml);
    });

    test('case by bidiu should convert xml object to js and back to xml correctly', () => {
      // see https://github.com/nashwaan/xml-js/issues/26
      var xml = '<title>Support &amp; resistance</title>';
      var js = {
        elements: [
          {
            type: 'element',
            name: 'title',
            elements: [
              {
                type: 'text',
                text: 'Support & resistance',
              },
            ],
          },
        ],
      };
      var js_ = xml2js(xml);
      expect(js_).toEqual(js);
      expect(js2xml(js_)).toEqual(xml);
    });

    test("case by Daniel 'yngwi' 'should convert xml object to js and back to xml correctly'", () => {
      // see https://github.com/nashwaan/xml-js/issues/29
      var xml =
        '<outer> This is <inner> some</inner> <inner>Text </inner> </outer>';
      var js = {
        elements: [
          {
            type: 'element',
            name: 'outer',
            elements: [
              {
                type: 'text',
                text: ' This is ',
              },
              {
                type: 'element',
                name: 'inner',
                elements: [
                  {
                    type: 'text',
                    text: ' some',
                  },
                ],
              },
              {
                type: 'text',
                text: ' ',
              },
              {
                type: 'element',
                name: 'inner',
                elements: [
                  {
                    type: 'text',
                    text: 'Text ',
                  },
                ],
              },
              {
                type: 'text',
                text: ' ',
              },
            ],
          },
        ],
      };

      var js_ = xml2js(xml, { captureSpacesBetweenElements: true });
      expect(js_).toEqual(js);
      expect(js2xml(js_)).toEqual(xml);
    });

    test('case by Nuno Martins should accept XML declarations that use single quotes', () => {
      // see https://github.com/nashwaan/xml-js/issues/34
      var xml = "<?xml version='1.0' encoding='UTF-8'?>";
      var js = {
        declaration: {
          attributes: {
            version: '1.0',
            encoding: 'UTF-8',
          },
        },
      };

      expect(xml2js(xml)).toEqual(js);
    });

    describe.skip("case by 'ultimate-tester'", () => {
      // see https://github.com/nashwaan/xml-js/issues/41
      var xml1 =
        '<d:multistatus xmlns="DAV:">\n' +
        '  <response>\n' +
        '    <href>/</href>\n' +
        '        <propstat>\n' +
        '          <prop>\n' +
        '          <current-user-principal>\n' +
        '            <href>/principals/users/johndoe/</href>\n' +
        '          </current-user-principal>\n' +
        '          </prop>\n' +
        '      <status>HTTP/1.1 200 OK</status>\n' +
        '    </propstat>\n' +
        '  </response>\n' +
        '</d:multistatus>';
      var xml2 =
        '<d:multistatus xmlns:d="DAV:">\n' +
        '  <d:response>\n' +
        '      <d:href>/</d:href>\n' +
        '      <d:propstat>\n' +
        '          <d:prop>\n' +
        '              <d:current-user-principal>\n' +
        '                  <d:href>/principals/users/johndoe/</d:href>\n' +
        '              </d:current-user-principal>\n' +
        '          </d:prop>\n' +
        '          <d:status>HTTP/1.1 200 OK</d:status>\n' +
        '      </d:propstat>\n' +
        '  </d:response>\n' +
        '</d:multistatus>';
      var js1 = {
        'd:multistatus': {
          _attributes: {
            xmlns: 'DAV:',
          },
          response: {
            href: {
              _text: '/',
            },
            propstat: {
              prop: {
                'current-user-principal': {
                  href: {
                    _text: '/principals/users/johndoe/',
                  },
                },
              },
              status: {
                _text: 'HTTP/1.1 200 OK',
              },
            },
          },
        },
      };
      var js2 = {
        'd:multistatus': {
          _attributes: {
            'xmlns:d': 'DAV:',
          },
          'd:response': {
            'd:href': {
              _text: '/',
            },
            'd:propstat': {
              'd:prop': {
                'd:current-user-principal': {
                  'd:href': {
                    _text: '/principals/users/johndoe/',
                  },
                },
              },
              'd:status': {
                _text: 'HTTP/1.1 200 OK',
              },
            },
          },
        },
      };
      var js = {
        'd:multistatus': {
          _attributes: {
            'xmlns:d': 'DAV:',
          },
          'DAV:response': {
            'DAV:href': {
              _text: '/',
            },
            'DAV:propstat': {
              'DAV:prop': {
                'DAV:current-user-principal': {
                  'DAV:href': {
                    _text: '/principals/users/johndoe/',
                  },
                },
              },
              'DAV:status': {
                _text: 'HTTP/1.1 200 OK',
              },
            },
          },
        },
      };

      it('should convert without resolving namespace', () => {
        expect(
          xml2js(xml1, { compact: true, resolveNamespace: false }),
        ).toEqual(js1);
        expect(
          xml2js(xml2, { compact: true, resolveNamespace: false }),
        ).toEqual(js2);
      });

      it('should convert and resolve namespace', () => {
        expect(xml2js(xml1, { compact: true, resolveNamespace: true })).toEqual(
          js,
        );
      });
    });

    test('case by austin-laney should xml to json and back to xml', () => {
      // see https://github.com/nashwaan/xml-js/issues/26
      var xml = '<parser start="^\\s*?&lt;name&gt;regex&lt;/name&gt;$"/>';
      var js = {
        parser: {
          _attributes: {
            start: '^\\s*?<name>regex</name>$',
          },
        },
      };

      expect(xml2js(xml, { compact: true })).toEqual(js);
      expect(
        js2xml(js, {
          compact: true,
          attributeValueFn: function (value) {
            return value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
          },
        }),
      ).toEqual(xml);
    });

    test('case by SergeyAlexsandrovich should json to xml and back to json', () => {
      // see https://github.com/nashwaan/xml-js/issues/44
      var xml =
        '<material><font size="14"/></material><material><font size="14"/></material>';
      var js = {
        material: [
          {
            font: {
              _attributes: { size: '14' },
            },
          },
          {
            font: {
              _attributes: { size: '14' },
            },
          },
        ],
      };
      expect(xml2json(xml, { compact: true })).toEqual(JSON.stringify(js));
    });
  });
});
