/**
 * Simple sanitization. It is not intended to sanitize
 * malicious element values.
 *
 * character | escaped
 *      <       &lt;
 *      >       &gt;
 *      (       &#40;
 *      )       &#41;
 *      #       &#35;
 *      &       &amp;
 *      "       &quot;
 *      '       &apos;
 */
var chars = {
    '&': '&amp;',
    '#': '&#35;',
    '<': '&lt;',
    '>': '&gt;',
    '(': '&#40;',
    ')': '&#41;',
    '"': '&quot;',
    "'": '&apos;'
};

function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

exports.sanitize = function sanitize(value) {
    if (typeof value !== 'string') {
        return value;
    }

    Object.keys(chars).forEach(function(key) {
        value = value.replace(new RegExp(escapeRegExp(key), 'g'), chars[key]);
    });

    return value;
}
