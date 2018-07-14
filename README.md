A tool to easily create custom extractors for [purgecss](https://github.com/FullHuman/purgecss).

- [Install](#install)
- [Usage](#usage)
- [API](#api)

## Install
```bash
npm i purgecss-custom-extractor
```

## Usage
Accepts regex as a RegExp or string with it (`'\w+'`, `'/\w+/g'`)
First argument can be regex or an array of regex and match processor or a list with a mix of both.
```javascript
const purgeCss = new Purgecss({
  content: ['**/*.html'],
  css: ['**/*.css'],
  extractors: [{
      // 'g' flag will be enforced.
      extractor: Extractor.custom(/[a-zA-Z0-9\-_]+/),
      extensions: ['html']
    }]
})
```

By default purgecss treats every word in text as potential selector. But what if for example your code contains a lot of text, and as result you get a lot of selectors you don't really use. You can create a simple regular expression to only keep selectors that are mentioned in `class` attribute of html tags. If you pass array of [regex

```javascript
// getting all the tags with class attribute
// taking first group in each match that contains
// class list and splitting it by ' '
Extractor.custom([ /<[\w]+.*?class="(.*?)".*?>/mg, m => m[1].split(' ') ])
```

If you want you can get rid of html comments `<!-- -->` to ignore class names in commented code. To do this you can define `contentProcessor` and remove html comments before looking for matches 

```javascript
// Extractor.regex.comment() == /<!--([\s\S]*?)-->/mg
Extractor.custom({
  regex: [ /<[\w]+.*?class="(.*?)".*?>/mg, m => m[1].split(' ') ],
  contentProcessor: c => c.replace(Extractor.regex.comment(), '')
})
```

You can also trim text to a content of a specific html tag. This also can be useful when working with VueJS single file components, you can isolate `<template>` tag and look for matches only there.

```javascript
Extractor.custom({
  regex: [ /<[\w]+.*?class="(.*?)".*?>/mg, m => m[1].split(' ') ],
  contentProcessor: content => {
    // generate regexp for lazy template tag
    let regex = Extractor.regex.lazyTag('template')
    let match = regex.exec(content)
    // if match found use second group for tags content
    // for reference see api -> regex
    let res = match ? match[2] : content
    return res
  }
})
```

## API

#### `custom(regex | {regex, matchProcessor, contentProcessor})`
Function to create custom extractor

First argument can be either of these: 
- `regex`: a regex, array of regex and match processor or a mixed list of both
  ```javascript
  custom(regex);
  custom([regex, eachMatch]);
  custom([
    [regex, eachMatch],
    [regex],
    regex
  ]);
  custom({regex, matchProcessor, contentProcessor});
  ```
- `opts`: object with options:
  - `regex`: see above
  - _`matchProcessor`_: [optional] will receive result of each match and will return processed value, can return string or array of strings (`m => m[1]`)
  - _`contentProcessor`_: [optional] will receive content before looking for matches (`c => c.toLowerCase()`)
  - __`returns`__: extractor object for purgecss

### `matchAll(re, text, matchProcessor)`
Function to get all the matches from given string

- `re`: RegExp or string with it (`'\w+'`, `'/\w+/g'`)
- `text`: text to match in
- _`matchProcessor`_: [optional] will receive result of each match and will return processed value, can return string or array of strings (`m => m[1]`)
- __`returns`__: array of all the matched strings

### `regex`
Object containing methods to create predefined regular expressions.

- `simple()`: returns regex for simple css selector (`/[a-zA-Z0-9\-_]+/g`) </br>
- `extended()`: returns regex for css selector with `:` and `\` characters (`/[a-zA-Z0-9\-_:\/]+/g`) such css selectors are being used in some frameworks, like [TailwindCSS](https://tailwindcss.com/)</br>
- `lazyTag(tagName)`: returns regex to match multiline html tag with it's content (`/<div(.*?)>([\s\S]*?)<\/divs*>/mg`) group 1 - attributes, group 2 - content</br>
- `greedyTag(tagName)`: same as above but greedy for content group (`/<div(.*?)>([\s\S]*)<\/divs*>/mg`) </br>
- `comment()`: returns regex to match html comments (`/<!--([\s\S]*?)-->/mg`) </br>

### `whitelist`
Object containing whitelist presets

- `htmltags`: array of html tag names </br>

### `simple()`
Predefined Extractor with regex.simple().
```javascript
() => custom({regex: regex.simple()})
```

### `extended()`
Predefined Extractor with regex.extended().
```javascript
() => custom({regex: regex.extended()})
```


