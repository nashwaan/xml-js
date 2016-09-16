var path = require('path');
var jasmine = new (require('jasmine'))();
var config = require(__dirname + '/jasmine.json');

if ('spec_dir' in config) {
    config.spec_dir = path.join(path.relative(process.cwd(), __dirname), '..', config.spec_dir);
}

jasmine.loadConfig(config);

jasmine.onComplete(function (passed) {
    if (passed) {
        console.log('All specs have passed');
    } else {
        console.log('At least one spec has failed');
    }
});

jasmine.execute();