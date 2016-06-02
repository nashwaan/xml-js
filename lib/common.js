/*jslint node:true */

module.exports = {
    printCommandLineHelp: function (command, possibleArguments) {
        var output = 'Usage: ' + command + ' src [options]' + '\n\n';
        output += '  src  ' + Array(20 - 'src'.length).join(' ') + 'Input file that need to be converted.' + '\n';
        output += '    ' + Array(20).join(' ') + 'Conversion type xml->json or json->xml will be inferred from file extension.' + '\n\n';
        output += 'Options:' + '\n';
        possibleArguments.forEach(function (argument) {
            if (argument.arg !== 'src') {
                output += '  --' + argument.arg + Array(20 - argument.arg.length).join(' ') + argument.desc + '\n';
            }
        });
        console.log(output);
    },
    mapCommandLineArgs: function (possibleArguments) {
        var i, j, options = {};
        for (i = 2; i < process.argv.length; ++i) {
            j = -1;
            possibleArguments.forEach(function (argument, index) {
                if (argument.arg === process.argv[i].slice(2)) {
                    j = index;
                } else if (argument.alias === process.argv[i].slice(1)) {
                    j = index;
                }
            });
            if (j >= 0) {
                switch (possibleArguments[j].type) {
                    case 'file': case 'number': case 'string':
                        options[possibleArguments[j].option] = options[possibleArguments[++j].option]; break;
                    case 'flag':
                        options[possibleArguments[j].option] = true; break;
                }
            }
        }
        return options;
    },
    copyOptions: function (options) {
        var key, copy = {};
        for (key in options) {
            if (options.hasOwnProperty(key)) {
                copy[key] = options[key];
            }
        }
        return copy;
    },
    checkOptionExist: function (item, options) {
        if (!(item in options) || typeof options[item] !== 'boolean') {
            options[item] = false;
        }
    },
    checkKeyExist: function (key, options) {
        if (!(key + 'Key' in options) || typeof options[key + 'Key'] !== 'string') {
            options[key + 'Key'] = options.compact ? '_' + key : key;
        }
    }
};