import { createReadStream } from "fs";
import { FileHandle, open } from "fs/promises";
import * as readline from "node:readline/promises";
import { join } from "path/posix";
import { writeFileSync } from "fs";
/**
 * Constant declarations along with types
 */
export const FILENAMES = ["index", "data"];
export const EXTS = [".adj", ".adv", ".noun", ".verb"];
export const DBPATH = "./dict";
export type TCategory = "a" | "r" | "n" | "v";
export const CATEGORIES: TCategory[] = ["a", "r", "n", "v"];
/**
 * REGEXP
 */
export const bufferOffsetRegexp = /\b\d{8}\b/g; // matches buffer offset values in data files (data.ext)
export const wordRegexp = /^[\w_\-.]+\b/; // matches compound words with '-' or '_' separators
export const zeroFills = /^0*/g; // regexp for using replace on buffer offset

/**
 * Class for word objects
 */
export class Word {
  word: string;
  category: TCategory;
  definitions: string[];

  constructor(word: string, category: TCategory, definitions: string[]) {
    this.word = word;
    this.category = category;
    this.definitions = definitions;
  }
}
/**
 *
 * @param filePath
 * @returns
 */
export async function findMaxLineSize(filePath: string) {
  const reader = createReadStream(filePath);
  const rl = readline.createInterface({
    input: reader,
    terminal: false,
    crlfDelay: Infinity,
  });
  let max = 0;
  for await (const line of rl) {
    const size = new Blob([line]).size;
    size > max ? (max = size) : null;
  }
  rl.close();
  reader.close();
  return max;
}
/**
 *
 * @param fd
 * @param bufferOffsets
 * @param maxBufferSize
 * @returns
 */
export async function lookupDefs(
  fd: FileHandle,
  bufferOffsets: string[],
  maxBufferSize: number
) {
  const definitions = bufferOffsets.map(async (bufferOffset) => {
    const pos = Number(bufferOffset.replace(zeroFills, ""));
    const result = await fd.read(
      Buffer.alloc(maxBufferSize),
      0,
      maxBufferSize,
      pos
    );
    const line = result.buffer.toString().split("\n")[0].split("|");
    return line[line.length - 1].trim();
  });
  return await Promise.all(definitions);
}
/**
 *
 * @param indexPath
 * @param dataPath
 * @param maxBufferSize
 * @param category
 * @returns
 */
export async function dictFromIndex(
  indexPath: string,
  dataPath: string,
  maxBufferSize: number,
  category: TCategory
) {
  const words: Word[] = [];
  const reader = createReadStream(indexPath);
  const fd = await open(dataPath, "r");
  const rl = readline.createInterface({
    input: reader,
    crlfDelay: Infinity,
    terminal: false,
  });
  for await (let line of rl) {
    line = line.trim();
    const wordMatch = line.match(wordRegexp);
    const bufferOffsets = line.match(bufferOffsetRegexp);
    if (wordMatch === null || bufferOffsets === null) continue;
    const definitions = await lookupDefs(fd, bufferOffsets, maxBufferSize);
    const word = wordMatch[0];
    words.push(new Word(word, category, definitions));
  }
  await fd.close();
  rl.close();
  reader.close();
  return words;
}
/**
 *
 * @param dbPath
 * @returns
 */
export async function wordnetDict(dbPath: string = DBPATH): Promise<Word[]> {
  const dict: Promise<Word[]>[] = [];
  for (const cat of CATEGORIES) {
    const ext = EXTS[CATEGORIES.indexOf(cat as TCategory)];
    const index = FILENAMES[0];
    const data = FILENAMES[1];
    const indexPath = join(dbPath, index + ext);
    const dataPath = join(dbPath, data + ext);
    const maxBufferSize = await findMaxLineSize(dataPath);
    dict.push(dictFromIndex(indexPath, dataPath, maxBufferSize, cat));
  }
  return (await Promise.all(dict)).flat();
}
