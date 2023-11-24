import memoize from "memoizee";
type TCategory = "adjective" | "adverb" | "noun" | "verb";
/**
 * Class for word objects
 */
declare class Word {
    word: string;
    category: TCategory;
    definitions: string[];
    constructor(word: string, category: TCategory, definitions: string[]);
}
/**
 *
 * @returns
 */
declare function list(): Promise<string[]>;
export declare const listWords: typeof list & memoize.Memoized<typeof list>;
/**
 *
 * @param word
 * @returns
 */
export declare function lookup(word: string): Promise<Word[] | undefined>;
export {};
