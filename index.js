"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const html_tags_1 = require("html-tags");
function err(...args) {
    throw new Error(['[purgecss-custom-extractor]'].concat(args).join(' '));
}
function listAdder(list) {
    return function addToList(elems) {
        if (Array.isArray(elems))
            list.push.apply(list, elems);
        else
            list.push(elems);
    };
}
function RegExpOrString(re, f) {
    if (re instanceof RegExp) {
        re = new RegExp(re, f);
    }
    else {
        let flags = f || '';
        if (re.charAt(0) === '/') {
            let lastSlash = re.lastIndexOf('/');
            re.substring(lastSlash + 1).split('').forEach(f => {
                if (!flags.includes(f))
                    flags += f;
            });
            re = re.substring(1, lastSlash);
        }
        re = new RegExp(re, flags);
    }
    return re;
}
function matchAll(re, text, matchProcessor) {
    let match, list = [], add = listAdder(list);
    re = RegExpOrString(re, 'g');
    while (match = re.exec(text)) {
        add(matchProcessor ? matchProcessor(match) : match[0]);
    }
    return list;
}
exports.matchAll = matchAll;
function custom(opts) {
    let regex, matchProcessor = null, contentProcessor = null;
    if (typeof opts === 'string' || opts instanceof RegExp || opts instanceof Array) {
        regex = opts;
    }
    else if (typeof opts === 'object') {
        ({ regex, matchProcessor, contentProcessor } = opts);
        // check args
        if (!regex)
            err(`regex option not set`);
        if (!(typeof regex === 'string' || regex instanceof RegExp || regex instanceof Array))
            err(`Regex option should be string or RegExp or array. got: [${typeof regex}] ${regex}`);
    }
    else {
        err(`First argument should be string or RegExp or array or options object. got: [${typeof opts}] ${opts}`);
    }
    return {
        extract(content) {
            if (contentProcessor)
                content = contentProcessor(content);
            let list = [], add = listAdder(list);
            if (regex instanceof Array) {
                if (regex.length > 1 && regex[1] instanceof Function) {
                    // regex is a pair of [re, each]
                    let [re, each] = regex;
                    add(matchAll(re, content, each));
                }
                else {
                    // regex is array of: regexp or a pair of [re, each]
                    regex.forEach(ri => {
                        if (ri instanceof Array) {
                            // ri is a pair of [re, each]
                            let [re, each] = ri;
                            add(matchAll(re, content, each));
                        }
                        else {
                            // ri is regexp
                            add(matchAll(ri, content));
                        }
                    });
                }
            }
            else {
                // regex is regexp
                add(matchAll(regex, content));
            }
            if (matchProcessor)
                list = list.map(matchProcessor);
            return list;
        }
    };
}
exports.custom = custom;
exports.regex = {
    simple: () => /[a-zA-Z0-9\-_]+/g,
    extended: () => /[a-zA-Z0-9\-_:\/]+/g,
    lazyTag: (tag) => new RegExp(`<${tag}(.*?)>([\\s\\S]*?)<\\/${tag}\s*>`, 'mg'),
    greedyTag: (tag) => new RegExp(`<${tag}(.*?)>([\\s\\S]*)<\\/${tag}s*>`, 'mg'),
    comment: () => /<!--([\s\S]*?)-->/mg,
};
exports.simple = () => custom({
    regex: exports.regex.simple(),
});
exports.extended = () => custom({
    regex: exports.regex.extended(),
});
exports.whitelist = {
    htmltags: html_tags_1.default,
};
//# sourceMappingURL=index.js.map