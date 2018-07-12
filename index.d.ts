export declare function matchAll(re: RegExp, text: string, matchProcessor: MatchProcessor): string[];
export declare type MatchProcessor = (match: string[]) => string | string[];
export declare type PurgecssExtractor = {
    extract(content: string): string[];
};
export declare type CustomExtractorOptions = {
    regex: RegExp | string;
    matchProcessor?: MatchProcessor;
    contentProcessor?: (content: string) => string;
};
export declare function custom({regex, matchProcessor, contentProcessor}: CustomExtractorOptions): PurgecssExtractor;
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
