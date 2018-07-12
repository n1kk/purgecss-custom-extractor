"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const html_tags_1 = require("html-tags");
function matchAll(re, text, matchProcessor) {
    let match, list = [];
    while (match = re.exec(text)) {
        match = matchProcessor ? matchProcessor(match) : match[0];
        if (Array.isArray(match))
            list.push.apply(list, match);
        else
            list.push(match);
    }
    return list;
}
exports.matchAll = matchAll;
function custom({ regex, matchProcessor = null, contentProcessor = null }) {
    return {
        extract(content) {
            if (contentProcessor)
                content = contentProcessor(content);
            let flags;
            if (typeof regex === 'string') {
                if (regex.charAt(0) === '/') {
                    let lastSlash = regex.lastIndexOf('/');
                    flags = regex.substring(lastSlash + 1);
                    regex = regex.substring(1, lastSlash);
                }
                regex = new RegExp(regex, flags);
            }
            else {
                regex = new RegExp(regex);
            }
            let list = matchAll(regex, content, matchProcessor);
            console.log(content.substr(0, 20));
            console.log({ list });
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