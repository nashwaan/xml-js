/*jslint node:true */

module.exports = {
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