import htmltags from 'html-tags'
import {type} from "os";

export type MatchProcessor = (match:string[]) => string|string[]
export type PurgecssExtractor = {
  extract(content:string): string[]
}
export type RegexOrStr = RegExp|string
export type RegexPair = [RegexOrStr, MatchProcessor]
export type RegexOrPairs = Array<RegexOrStr|RegexPair>
export type AcceptedRegex = RegexOrStr|RegexPair|RegexOrPairs
export type PostMatchProcessor = (match:string|string[]) => string
export type ContentProcessor = (match:string) => string
export type CustomExtractorOptions = {
  regex:AcceptedRegex
  matchProcessor?: PostMatchProcessor
  contentProcessor?: ContentProcessor
}

function err(...args:any[]) {
  throw new Error(['[purgecss-custom-extractor]'].concat(args).join(' '))
}

function listAdder(list:any[]) {
  return function addToList(elems:any|any[]) {
    if (Array.isArray(elems))
      list.push.apply(list, elems)
    else
      list.push(elems)
  }
}

function RegExpOrString(re:RegexOrStr, f?:string):RegExp {
  if (re instanceof RegExp) {
    re = new RegExp(re, f)
  } else {
    let flags = f || ''
    if (re.charAt(0) === '/') {
      let lastSlash = re.lastIndexOf('/')
      re.substring(lastSlash + 1).split('').forEach(f => {
        if (!flags.includes(f))
          flags += f
      })
      re = re.substring(1, lastSlash)
    }
    re = new RegExp(re, flags)
  }
  return re
}

export function matchAll(re:RegexOrStr, text:string, matchProcessor?: MatchProcessor):string[] {
  let match, list:string[] = [], add = listAdder(list)
  re = RegExpOrString(re, 'g')
  while (match = re.exec(text)) {
    add(matchProcessor ? matchProcessor(match) : match[0])
  }
  return list
}

export function custom(opts:CustomExtractorOptions|AcceptedRegex):PurgecssExtractor {
  let regex:AcceptedRegex, matchProcessor:PostMatchProcessor = null, contentProcessor:ContentProcessor = null;
  if (typeof opts === 'string' || opts instanceof RegExp || opts instanceof Array) {
    regex = opts
  } else if (typeof opts === 'object') {
    ({regex, matchProcessor, contentProcessor} = opts)
    // check args
    if (!regex) err(`regex option not set`)
    if (!(typeof regex === 'string' || regex instanceof RegExp || regex instanceof Array))
      err(`Regex option should be string or RegExp or array. got: [${typeof regex}] ${regex}`)
  } else {
    err(`First argument should be string or RegExp or array or options object. got: [${typeof opts}] ${opts}`)
  }

  return {
    extract(content:string) {
      if (contentProcessor)
        content = contentProcessor(content)

      let list:string[] = [],
        add = listAdder(list)

      if (regex instanceof Array) {
        if (regex.length > 1 && regex[1] instanceof Function) {
          // regex is a pair of [re, each]
          let [re, each] = <RegexPair>regex
          add(matchAll(re, content, each))
        } else {
          // regex is array of: regexp or a pair of [re, each]
          (<RegexOrPairs>regex).forEach(ri => {
            if (ri instanceof Array) {
              // ri is a pair of [re, each]
              let [re, each] = ri
              add(matchAll(re, content, each))
            } else {
              // ri is regexp
              add(matchAll(ri, content))
            }
          })
        }
      } else {
        // regex is regexp
        add(matchAll(regex, content))
      }
      if (matchProcessor)
        list = list.map(matchProcessor)

      return list
    }
  }
}

export const regex = {
  simple: () => /[a-zA-Z0-9\-_]+/g,
  extended: () => /[a-zA-Z0-9\-_:\/]+/g,
  lazyTag: (tag:string) => new RegExp(`<${tag}(.*?)>([\\s\\S]*?)<\\/${tag}\s*>`, 'mg'),
  greedyTag: (tag:string) => new RegExp(`<${tag}(.*?)>([\\s\\S]*)<\\/${tag}s*>`, 'mg'),
  comment: () => /<!--([\s\S]*?)-->/mg,
}

export const simple = () => custom({
  regex: regex.simple(),
})

export const extended = () => custom({
  regex: regex.extended(),
})

export const whitelist = {
  htmltags,
}
