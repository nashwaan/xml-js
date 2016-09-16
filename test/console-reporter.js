var util = require('util');
var jasmineNpm = require('jasmine');

var options = {
    showColors: true,
    print: function() {
        process.stdout.write(util.format.apply(this, arguments));
    }
};

jasmine.getEnv().addReporter(new jasmineNpm.ConsoleReporter(options));