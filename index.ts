import htmltags from 'html-tags'

export function matchAll(re:RegExp, text:string, matchProcessor: MatchProcessor):string[] {
  let match, list = []
  while (match = re.exec(text)) {
    match = matchProcessor ? matchProcessor(match) : match[0]
    if (Array.isArray(match))
      list.push.apply(list, match)
    else
      list.push(match)
  }
  return list
}

export type MatchProcessor = (match:string[]) => string|string[]
export type PurgecssExtractor = {
  extract(content:string): string[]
}
export type CustomExtractorOptions = {
  regex:RegExp|string
  matchProcessor?: MatchProcessor
  contentProcessor?: (content:string) => string
}

export function custom({regex, matchProcessor = null, contentProcessor = null}:CustomExtractorOptions):PurgecssExtractor {
  return {
    extract(content:string) {
      if (contentProcessor)
        content = contentProcessor(content)
      let flags
      if (typeof regex === 'string') {
        if (regex.charAt(0) === '/') {
          let lastSlash = regex.lastIndexOf('/')
          flags = regex.substring(lastSlash + 1)
          regex = regex.substring(1, lastSlash)
        }
        regex = new RegExp(regex, flags)
      } else {
        regex = new RegExp(regex)
      }
      let list = matchAll(regex, content, matchProcessor)
      console.log(content.substr(0, 20))
      console.log({list})
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
