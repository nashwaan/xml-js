const fs = require('fs');
var prism = require('prismjs');
const jsonpath = require('jsonpath');
const convert = require('..');
const htmlFullTags = ['script', 'pre', 'code']

var template = convert.xml2js(fs.readFileSync(__dirname + '/templates/page-template.html'));


fs.writeFileSync(__dirname + '/styles.css', ['general', 'nav', 'page'].reduce((all, style) => all + fs.readFileSync(__dirname + '/templates/' + style + '.css'), ''));

var pages = {};
['index', 'features', 'setup', 'quick', 'api', 'custom', 'cli'].map(pageName => pages[pageName] = convert.xml2js(fs.readFileSync(__dirname + '/templates/' + pageName + '.html')));

Object.keys(pages).forEach(pageName => {
  var page = pages[pageName], fullPage = JSON.parse(JSON.stringify(template));
  jsonpath.value(fullPage, '$.elements[1].elements[0].elements[?(@.name=="title")].elements[0]').text += ' | ' + pageName;
  jsonpath.value(fullPage, '$.elements[1].elements[?(@.name=="body")].elements').push(...page.elements);
  fs.writeFileSync(__dirname + '/' + pageName + '.html', convert.js2xml(fullPage, {spaces: 2, fullTagEmptyElementFn: name => htmlFullTags.indexOf(name) >= 0}));
});

