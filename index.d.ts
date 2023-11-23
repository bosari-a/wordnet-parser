/// <reference types="node" />
import { FileHandle } from "fs/promises";
/**
 * Constant declarations along with types
 */
export declare const FILENAMES: string[];
export declare const EXTS: string[];
export declare const DBPATH = "./dict";
export type TCategory = "a" | "r" | "n" | "v";
export declare const CATEGORIES: TCategory[];
/**
 * REGEXP
 */
export declare const bufferOffsetRegexp: RegExp;
export declare const wordRegexp: RegExp;
export declare const zeroFills: RegExp;
/**
 * Class for word objects
 */
export declare class Word {
    word: string;
    category: TCategory;
    definitions: string[];
    constructor(word: string, category: TCategory, definitions: string[]);
}
/**
 *
 * @param filePath
 * @returns
 */
export declare function findMaxLineSize(filePath: string): Promise<number>;
/**
 *
 * @param fd
 * @param bufferOffsets
 * @param maxBufferSize
 * @returns
 */
export declare function lookupDefs(fd: FileHandle, bufferOffsets: string[], maxBufferSize: number): Promise<string[]>;
/**
 *
 * @param indexPath
 * @param dataPath
 * @param maxBufferSize
 * @param category
 * @returns
 */
export declare function dictFromIndex(indexPath: string, dataPath: string, maxBufferSize: number, category: TCategory): Promise<Word[]>;
/**
 *
 * @param dbPath
 * @returns
 */
export declare function wordnetDict(dbPath?: string): Promise<Word[]>;
