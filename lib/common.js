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
    checkOptionExist: function (item, options) {
        if (!(item in options) || typeof options[item] !== 'boolean') {
            options[item] = false;
        }
    },
    checkKeyExist: function (key, options) {
        if (!(key + 'Key' in options) || typeof options[key + 'Key'] !== 'string') {
            options[key + 'Key'] = options.compact || options.fromCompact ? '_' + key : key;
        }
    }
};