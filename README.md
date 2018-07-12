A tool to create custom extractors for [purgecss](https://github.com/FullHuman/purgecss).

## Install
```bash
npm i purgecss-custom-extractor
```

## Usage

```javascript
const purgeCss = new Purgecss({
  content: ['**/*.html'],
  css: ['**/*.css'],
  extractors: [{
      extractor: Extractor.custom({
        // Use 'g' flag in regular expression to find all matches.
        regex: /[a-zA-Z0-9\-_]+/g
      }),
      extensions: ['html']
    }]
})
```

By default purgecss treats every word in text as potential selector. But what if for example your code contains a lot of text, and as result you get a lot of selectors you don't really use. You can create a simple regular expression to only keep selectors that are mentioned in `class` attribute of html tags.

```javascript
Extractor.custom({
  // getting all the tags with class attribute
  regex: /<[\w]+.*?class="(.*?)".*?>/mg,
  // taking first group in each match that contains
  // class list and splitting it by ' '
  matchProcessor: m => m[1].split(' ')
})
```

If you want you can get rid of html comments `<!-- -->` to ignore class names in commented code. To do this you can define `contentProcessor` and remove html comments before looking for matches 

```javascript
Extractor.custom({
  regex: /<[\w]+.*?class="(.*?)".*?>/mg, 
  matchProcessor: m => m[1].split(' '),
  contentProcessor: c => c.replace(extractor.regex.comment(), '')
})
```

You can also trim text to a content of a specific html tag. This also can be useful when working with VueJS single file components, you can isolate `<template>` tag and look for matches only there.

```javascript
Extractor.custom({
  regex: /<[\w]+.*?class="(.*?)".*?>/mg, 
  matchProcessor: m => m[1].split(' '),
  contentProcessor: content => {
    // generate regexp for lazy template tag
    let regex = extractor.regex.lazyTag('template')
    let match = regex.exec(content)
    // if match found use second group for tags content
    // for reference see api -> regex
    let res = match ? match[2] : content
    return res
  }
})
```

## API

#### `custom({regex, matchProcessor, contentProcessor})`
Function to create custom extractor

`regex`: RegExp or string (`/\w+/g`, `"\w+"`, `"/\w+/g"`) </br>
_`matchProcessor`_: [optional] will receive result of each match and will return processed value, can return string or array of strings (`m => m[1]`) </br>
_`contentProcessor`_: [optional] will receive content before looking for matches (`c => c.toLowerCase()`) </br>
__`returns`__: extractor object for purgecss

### `matchAll(re, text, matchProcessor)`
Function to get all the matches from given string

`re`: RegExp </br>
`text`: text to match in </br>
_`matchProcessor`_: [optional] will receive result of each match and will return processed value, can return string or array of strings (`m => m[1]`) </br>
__`returns`__: array of all the matched strings

### `regex`
Object containing methods to create predefined regular expressions.

`simple()`: returns regex for simple css selector (`/[a-zA-Z0-9\-_]+/g`) </br>
`extended()`: returns regex for css selector with `:` and `\` characters (`/[a-zA-Z0-9\-_:\/]+/g`) such css selectors are being used in some frameworks, like [TailwindCSS](https://tailwindcss.com/)</br>
`lazyTag(tagName)`: returns regex to match multiline html tag with it's content (`/<div(.*?)>([\s\S]*?)<\/divs*>/mg`) group 1 - attributes, group 2 - content</br>
`greedyTag(tagName)`: same as above but greedy for content group (`/<div(.*?)>([\s\S]*)<\/divs*>/mg`) </br>
`comment()`: returns regex to match html comments (`/<!--([\s\S]*?)-->/mg`) </br>

### `whitelist`
Object containing whitelist presets

`htmltags`: array of html tag names </br>

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


