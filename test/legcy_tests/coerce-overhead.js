var fs = require('fs');
var parser = require('../lib');

var file = __dirname + '/fixtures/large.xml';

var data = fs.readFileSync(file);

// With coercion
var t0 = Date.now();
for(var i = 0; i < 10000; i++) {
    var result = parser.toJson(data, {reversible: true, coerce: true, object: true});
}
console.log(Date.now() - t0);

// Without coercion
var t0 = Date.now();
for(var i = 0; i < 10000; i++) {
    result = parser.toJson(data, {reversible: true, object: true});
}
console.log(Date.now() - t0);
