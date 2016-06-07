/*jslint node:true */

module.exports = {
    sanitize: function (text) {
        return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
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
    ensureFlagExists: function (item, options) {
        if (!(item in options) || typeof options[item] !== 'boolean') {
            options[item] = false;
        }
    },
    ensureSpacesExists: function (options) {
        if (!('spaces' in options) || (typeof options.spaces !== 'number' && typeof options.spaces !== 'string')) {
            options.spaces = 0;
        }
    },
    ensureKeyExists: function (key, options) {
        if (!(key + 'Key' in options) || typeof options[key + 'Key'] !== 'string') {
            options[key + 'Key'] = options.compact ? '_' + key : key;
        }
    },
    getCommandLineHelp: function (command, requiredArgs, optionalArgs) {
        var reqArgs = requiredArgs.reduce(function (res, arg) {return res + ' <' + arg.arg + '>';}, '');
        var output = 'Usage: ' + command + reqArgs + ' [options]' + '\n';
        requiredArgs.forEach(function (argument) {
            output += '  <' + argument.arg + '>' + Array(20 - argument.arg.length).join(' ') + argument.desc + '\n';
        });
        output += '\nOptions:' + '\n';
        optionalArgs.forEach(function (argument) {
            output += '  --' + argument.arg + Array(20 - argument.arg.length).join(' ') + argument.desc + '\n';
        });
        return output;
    },
    mapCommandLineArgs: function (optionalArgs) {
        var r, i, j, raw = [], options = {};
        function findIndex (argument, index) {
            if (argument.alias === process.argv[i].slice(1) || argument.arg === process.argv[i].slice(2)) {
                j = index;
            }
        }
        for (r = 2; r < process.argv.length; r += 1) {
            if (process.argv[r].substr(0, 1) !== '-') {
                if (!('raw' in options)) {
                    options.raw = [];
                }
                options.raw.push(process.argv[r]);
            } else {
                break;
            }
        }
        for (i = r; i < process.argv.length; i += 1) {
            j = -1;
            optionalArgs.forEach(findIndex);
            if (j >= 0) {
                switch (optionalArgs[j].type) {
                    case 'file': case 'string': case 'number':
                        if (i + 1 < process.argv.length) {
                            options[optionalArgs[j].option] = (optionalArgs[j].type === 'number' ? Number(process.argv[++i]) : process.argv[++i]);
                        }
                        break;
                    case 'flag':
                        options[optionalArgs[j].option] = true; break;
                }
            }
        }
        return options;
    }
};