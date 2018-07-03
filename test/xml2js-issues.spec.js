var convert = require('../lib');

/*eslint quotes: 0*/  // --> turn off error of strings surrounded by double quotes
/*global describe,xdescribe,it,expect*/

describe('Testing xml2js.js:', function () {

  describe('User reported issues on github:', function () {

    describe('case by Mark Pareja', function () {
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

    });

    xdescribe('case by \'ultimate-tester\'', function () {
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
        "d:multistatus": {
          "_attributes": {
            "xmlns": "DAV:"
          },
          "response": {
            "href": {
              "_text": "/"
            },
            "propstat": {
              "prop": {
                "current-user-principal": {
                  "href": {
                    "_text": "/principals/users/johndoe/"
                  }
                }
              },
              "status": {
                "_text": "HTTP/1.1 200 OK"
              }
            }
          }
        }
      };
      var js2 = {
        "d:multistatus": {
          "_attributes": {
            "xmlns:d": "DAV:"
          },
          "d:response": {
            "d:href": {
              "_text": "/"
            },
            "d:propstat": {
              "d:prop": {
                "d:current-user-principal": {
                  "d:href": {
                    "_text": "/principals/users/johndoe/"
                  }
                }
              },
              "d:status": {
                "_text": "HTTP/1.1 200 OK"
              }
            }
          }
        }
      };
      var js = {
        "d:multistatus": {
          "_attributes": {
            "xmlns:d": "DAV:"
          },
          "DAV:response": {
            "DAV:href": {
              "_text": "/"
            },
            "DAV:propstat": {
              "DAV:prop": {
                "DAV:current-user-principal": {
                  "DAV:href": {
                    "_text": "/principals/users/johndoe/"
                  }
                }
              },
              "DAV:status": {
                "_text": "HTTP/1.1 200 OK"
              }
            }
          }
        }
      };

      it('should convert without resolving namespace', function () {
        expect(convert.xml2js(xml1, {compact: true, resolveNamespace: false})).toEqual(js1);
        expect(convert.xml2js(xml2, {compact: true, resolveNamespace: false})).toEqual(js2);
      });

      it('should convert and resolve namespace', function () {
        expect(convert.xml2js(xml1, {compact: true, resolveNamespace: true})).toEqual(js);
      });

    });

    describe('case by austin-laney', function () {
      // see https://github.com/nashwaan/xml-js/issues/26
      var xml = '<parser start="^\\s*?&lt;name&gt;regex&lt;/name&gt;$"/>';
      var js = {
        parser: {
          _attributes: {
            start: '^\\s*?<name>regex</name>$'
          }
        }
      };

      it('should xml to json and back to xml', function () {
        expect(convert.xml2js(xml, {compact: true})).toEqual(js);
        expect(convert.js2xml(js, {compact: true, attributeValueFn: function(value) {
          return value.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }})).toEqual(xml);
      });

    });

    describe('case by SergeyAlexsandrovich', function () {
      // see https://github.com/nashwaan/xml-js/issues/44
      var xml = '<material><font size="14"/></material><material><font size="14"/></material>';
      var js = {
        "material": [{
          "font": {
            "_attributes": {"size":"14"}
          }
        }, {
          "font": {
            "_attributes": {"size":"14"}
          }
        }]
      };
      it('should json to xml and back to json', function () {
        // console.log(convert.xml2json(xml, {compact: true}));
        // expect(convert.js2xml(js, {compact: true})).toEqual(xml);
        expect(convert.xml2json(xml, {compact: true})).toEqual(JSON.stringify(js));
      });

    });

  });

});
