export declare type MatchProcessor = (match: string[]) => string | string[];
export declare type PurgecssExtractor = {
    extract(content: string): string[];
};
export declare type RegexOrStr = RegExp | string;
export declare type RegexPair = [RegexOrStr, MatchProcessor];
export declare type RegexOrPairs = Array<RegexOrStr | RegexPair>;
export declare type AcceptedRegex = RegexOrStr | RegexPair | RegexOrPairs;
export declare type PostMatchProcessor = (match: string | string[]) => string;
export declare type ContentProcessor = (match: string) => string;
export declare type CustomExtractorOptions = {
    regex: AcceptedRegex;
    matchProcessor?: PostMatchProcessor;
    contentProcessor?: ContentProcessor;
};
export declare function matchAll(re: RegexOrStr, text: string, matchProcessor?: MatchProcessor): string[];
export declare function custom(opts: CustomExtractorOptions | AcceptedRegex): PurgecssExtractor;
export declare const regex: {
    simple: () => RegExp;
    extended: () => RegExp;
    lazyTag: (tag: string) => RegExp;
    greedyTag: (tag: string) => RegExp;
    comment: () => RegExp;
};
export declare const simple: () => PurgecssExtractor;
export declare const extended: () => PurgecssExtractor;
export declare const whitelist: {
    htmltags: any;
};
