var fs = require('fs');
var path = require('path');
var parser = require('../lib');
var assert = require('assert');

var data = fs.readFileSync('./fixtures/reorder.json');
var result = parser.toXml(data);
console.log(result);

var expected = fs.readFileSync('./fixtures/reorder.xml') + '';

if (expected) {
    expected = expected.trim();
}

//console.log(result + '<---');
assert.deepEqual(result, expected, 'reorder.json and reorder.xml are different');
console.log('[json2xml: reoder.json -> roerder.xml] passed!');
