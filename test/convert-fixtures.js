var fs = require('fs');
var convertor = require('..');

function getFixtureFiles(type) {
    return fs.readdirSync('fixtures/')
        .filter(function (file) {
            return file.slice(-4) === type;})
        .map(function (file) {
            return 'fixtures/' + file;})
        .filter(function (file) {
            return fs.statSync(file).isFile();});
}

getFixtureFiles('.xml').map(function (file) {
    console.log('converting %s to %s', file, file.replace('.xml','1.json'));
    var options = {compact: true, spaces: 4};
    fs.writeFileSync(file.replace('.xml','1.json'), convertor.xml2json(fs.readFileSync(file, 'utf8'), options), 'utf8');
});

getFixtureFiles('.xml').map(function (file) {
    console.log('converting %s to %s', file, file.replace('.xml','2.json'));
    var options = {compact: false, spaces: 4};
    fs.writeFileSync(file.replace('.xml','2.json'), convertor.xml2json(fs.readFileSync(file, 'utf8'), options), 'utf8');
});