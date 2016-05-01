var sanitizer = require('./sanitize.js')

module.exports = function (json, options) {
    if (json instanceof Buffer) {
        json = json.toString();
    }

    var obj = null;
    if (typeof(json) == 'string') {
        try {
            obj = JSON.parse(json);
        } catch(e) {
            throw new Error("The JSON structure is invalid");
        }
    } else {
        obj = json;
    }
    var toXml = new ToXml(options);
    toXml.parse(obj);
    return toXml.xml;
}

ToXml.prototype.parse = function(obj) {
    var self = this;
    var keys = Object.keys(obj);
    var len = keys.length;

    // First pass, extract strings only
    for (var i = 0; i < len; i++) {
        var key = keys[i], value = obj[key], isArray = Array.isArray(value);
        var type = typeof(value);
        if (type == 'string' || type == 'number' || type == 'boolean' || isArray) {
            var it = isArray ? value : [value];

            it.forEach(function(subVal) {
                if (typeof(subVal) != 'object') {
                    if (key == '$t') {
                        self.addTextContent(subVal);
                    } else {
                        self.addAttr(key, subVal);
                    }
                }
            });
        }
    }

    // Second path, now handle sub-objects and arrays
    for (var i = 0; i < len; i++) {
        var key = keys[i];

        if (Array.isArray(obj[key])) {
            var elems = obj[key];
            var l = elems.length;
            for (var j = 0; j < l; j++) {
                var elem = elems[j];

                if (typeof(elem) == 'object') {
                    self.openTag(key);
                    self.parse(elem);
                    self.closeTag(key);
                }
            }
        } else if (typeof(obj[key]) == 'object') {
            self.openTag(key);
            self.parse(obj[key]);
            self.closeTag(key);
        }
    }

};

ToXml.prototype.openTag = function(key) {
    this.completeTag();
    this.xml += '<' + key;
    this.tagIncomplete = true;
}
ToXml.prototype.addAttr = function(key, val) {
    if (this.options.sanitize) {
        val = sanitizer.sanitize(val)
    }
    this.xml += ' ' + key + '="' + val + '"';
}
ToXml.prototype.addTextContent = function(text) {
    this.completeTag();
    this.xml += text;
}
ToXml.prototype.closeTag = function(key) {
    this.completeTag();
    this.xml += '</' + key + '>';
}
ToXml.prototype.completeTag = function() {
    if (this.tagIncomplete) {
        this.xml += '>';
        this.tagIncomplete = false;
    }
}
function ToXml(options) {
    var defaultOpts = {
        sanitize: false
    };

    if (options) {
        for (var opt in options) {
            defaultOpts[opt] = options[opt];
        }
    }

    this.options = defaultOpts;
    this.xml = '';
    this.tagIncomplete = false;
}
