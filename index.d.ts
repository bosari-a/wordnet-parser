/// <reference types="node" />
/// <reference types="node" />
import { FileHandle } from "fs/promises";
type TCategory = "a" | "r" | "n" | "v";
/**
 * Class for word objects
 */
declare class Word {
    word: string;
    definitions: string[];
    constructor(word: string, definitions: string[]);
}
/**
 * String manipulation to get definition sentences from a buffer.
 * @param fd
 * @param bufferOffset
 * @returns
 */
export declare function defsForWord(fd: FileHandle, bufferOffset: string, buffer: Buffer): Promise<string>;
/**
 * Generates a dictionary for a given category (e.g. verbs index.verbs and data.verbs)
 * @param category
 * @param dbPath
 * @returns
 */
export declare function dictFromCategory(category: TCategory, dbPath?: string): Promise<Word[]>;
/**
 * Generates the wordnet dictionary
 * @param dbPath
 * @returns
 */
export declare function wordnetDict(dbPath?: string): Promise<Word[]>;
export {};
