/*jslint node:true */

module.exports = {
    copyOptions: function (options) {
        var key, copy = {};
        for (key in options) {
            if (options.hasOwnProperty(key)) {
                copy[key] = options[key];
            }
        }
        return copy;
    },
    ensureFlagExists: function (item, options) {
        if (!(item in options) || typeof options[item] !== 'boolean') {
            options[item] = false;
        }
    },
    ensureKeyExists: function (key, options) {
        if (!(key + 'Key' in options) || typeof options[key + 'Key'] !== 'string') {
            options[key + 'Key'] = options.compact ? '_' + key : key;
        }
    },
    getCommandLineHelp: function (command, requiredArguments, possibleArguments) {
        var reqArgs = requiredArguments.reduce(function (res, arg) {return res + ' <' + arg.arg + '>';}, '');
        var output = 'Usage: ' + command + reqArgs + ' [options]' + '\n';
        requiredArguments.forEach(function (argument) {
            output += '  <' + argument.arg + '>' + Array(20 - argument.arg.length).join(' ') + argument.desc + '\n';
        });
        output += '\nOptions:' + '\n';
        possibleArguments.forEach(function (argument) {
            output += '  --' + argument.arg + Array(20 - argument.arg.length).join(' ') + argument.desc + '\n';
        });
        return output;
    },
    mapCommandLineArgs: function (possibleArguments) {
        var i, j, options = {};
        for (i = 2; i < process.argv.length; i += 1) {
            j = -1;
            possibleArguments.forEach(function (argument, index) {
                if (argument.alias === process.argv[i].slice(1) || argument.arg === process.argv[i].slice(2)) {
                    j = index;
                }
            });
            if (j >= 0) {
                switch (possibleArguments[j].type) {
                    case 'file': case 'string': case 'number':
                        if (i + 1 < process.argv.length) {
                            options[possibleArguments[j].option] = (possibleArguments[j].type === 'number' ? Number(process.argv[++i]) : process.argv[++i]);
                        }
                        break;
                    case 'flag':
                        options[possibleArguments[j].option] = true; break;
                }
            }
        }
        return options;
    }
};