var fs = require('fs');
var path = require('path');
var parser = require('../lib');
var assert = require('assert');

var xml = fs.readFileSync(__dirname + '/fixtures/spacetext.xml');
var json = parser.toJson(xml, {object: true, space: true});
console.log('xml => json: \n%j', json);

console.log('---------------------\njson => xml: \n%j\n', 
  parser.toXml(fs.readFileSync(__dirname + '/fixtures/spacetext.json')));
function eql(a, b) {
  for (var k in a) {
    assert.deepEqual(a[k], b[k], JSON.stringify(a) + ' should equal ' + JSON.stringify(b));
  }
}

assert.deepEqual(json.doc.Column.length, 5, 'should have 5 Columns');
eql(json.doc.Column[0], {Name: 'shit', Value: {type: 'STRING', $t: '  abc\nasdf\na '}});
eql(json.doc.Column[1], {Name: 'foo', Value: {type: 'STRING'}});
eql(json.doc.Column[2], {Name: 'foo2', Value: {type: 'STRING'}});
eql(json.doc.Column[3], {Name: 'bar', Value: {type: 'STRING', $t: ' '}});
eql(json.doc.Column[4], {PK: 'true', Name: 'uid', Value: {type: 'STRING', $t: 'god'}});

console.log('xml2json options.space passed!');
