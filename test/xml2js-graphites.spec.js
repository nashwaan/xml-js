var convert = require("../lib");

/*eslint quotes: 0*/ // --> turn off error of strings surrounded by double quotes
/*global describe,xdescribe,it,expect*/

describe("Testing xml2js.js:", function () {
  describe("Graphite enhancements:", function () {
    describe("encodes & and < characters in attributes", function () {
      var xml = '<button hidden="{x > 10 &amp;&amp; x &lt; 20}"/>';
      var js = {
        elements: [
          {
            type: "element",
            name: "button",
            attributes: { hidden: "{x > 10 && x < 20}" },
          },
        ],
      };
      it("should xml to json and back to xml", function () {
        expect(convert.js2xml(js, { compact: false })).toEqual(xml);
      });
    });

    describe("Can wrap attributes at given width", function () {
      var xml =
        '<page><button hidden="{x > 10 &amp;&amp; x &lt; 20}" on-click="soSomethingReallyCool" kind="primary" icon="carbon:add" fillera="fillera" fillerb="fillerb" fillerc="fillerc" fillerd="fillerd" /></page>';
      var xml2 = `
<page>
  <button hidden="{x > 10 &amp;&amp; x &lt; 20}" on-click="soSomethingReallyCool"
    kind="primary" icon="carbon:add" fillera="fillera" fillerb="fillerb"
    fillerc="fillerc" fillerd="fillerd"
  />
</page>`;

      it("should xml to json and back to xml", function () {
        expect(
          convert.js2xml(
            convert.xml2js(xml, {
              compact: false,
            }),
            {
              compact: false,
              spaces: 2,
              indentAttributesMaxSize: 80,
              indentAttributes: true,
            }
          )
        ).toEqual(xml2.trim());
      });
    });

    describe("Can wrap attributes at given width and doesn't add extra newline for long attribute", function () {
      var xml =
        '<page><button hidden="{x > 10 &amp;&amp; x &lt; 20}" on-click="soSomethingReallyCool" filler1="filler1" description1="xxxxxxxxx xxxxxxxxx xxxxxxxxx xxxxxxxxx xxxxxxxxx xxxxxxxxx xxxxxxxxx xxxxxxxxx xxxxxxxxx xxxxxxxxx " description2="xxxxxxxxx xxxxxxxxx xxxxxxxxx xxxxxxxxx xxxxxxxxx xxxxxxxxx xxxxxxxxx xxxxxxxxx xxxxxxxxx xxxxxxxxx " filler2="filler2" /></page>';
      var xml2 = `
<page>
  <button hidden="{x > 10 &amp;&amp; x &lt; 20}" on-click="soSomethingReallyCool"
    filler1="filler1"
    description1="xxxxxxxxx xxxxxxxxx xxxxxxxxx xxxxxxxxx xxxxxxxxx xxxxxxxxx xxxxxxxxx xxxxxxxxx xxxxxxxxx xxxxxxxxx "
    description2="xxxxxxxxx xxxxxxxxx xxxxxxxxx xxxxxxxxx xxxxxxxxx xxxxxxxxx xxxxxxxxx xxxxxxxxx xxxxxxxxx xxxxxxxxx "
    filler2="filler2"
  />
</page>`;

      it("should xml to json and back to xml", function () {
        expect(
          convert.js2xml(
            convert.xml2js(xml, {
              compact: false,
            }),
            {
              compact: false,
              spaces: 2,
              indentAttributesMaxSize: 80,
              indentAttributes: true,
            }
          )
        ).toEqual(xml2.trim());
      });
    });

    describe("Doesnt wrap single line attributes if they fit", function () {
      var xml = '<page><button kind="primary" /></page>';
      var xml2 = `
<page>
  <button kind="primary" />
</page>`;

      it("should xml to json and back to xml", function () {
        expect(
          convert.js2xml(
            convert.xml2js(xml, {
              compact: false,
            }),
            {
              compact: false,
              spaces: 2,
              indentAttributesMaxSize: 80,
              indentAttributes: true,
              indentAttributesCloseSingleLine: true,
            }
          )
        ).toEqual(xml2.trim());
      });
    });
  });
});
