import { createReadStream } from "fs";
import { FileHandle, open } from "fs/promises";
import * as readline from "node:readline/promises";
import { join } from "path/posix";
import memoize from "memoizee";
import { config } from "dotenv";
config();
/**
 * Constant declarations along with types
 */
const FILENAMES = ["index", "data"];
const EXTS = [".adj", ".adv", ".noun", ".verb"];
const DBPATH = process.env.DBPATH || "./dict";
type TCategory = "adjective" | "adverb" | "noun" | "verb";
const CATEGORIES: TCategory[] = ["adjective", "adverb", "noun", "verb"];
const SIZE = 13000;
/**
 * REGEXP
 */
const bufferOffsetRegexp = /\b\d{8}\b/g; // matches buffer offset values in data files (data.ext)
const wordRegexp = /^[\w_\-.]+\b/; // matches compound words with '-' or '_' separators

/**
 * Class for word objects
 */
class Word {
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
 * @returns
 */
async function list() {
  const list: string[] = [];
  for (let i = 0; i < CATEGORIES.length; i++) {
    const ext = EXTS[i];
    const index = FILENAMES[0];
    const indexPath = join(DBPATH, index + ext);

    const reader = createReadStream(indexPath);
    const rl = readline.createInterface({
      input: reader,
      crlfDelay: Infinity,
      terminal: false,
    });
    for await (let line of rl) {
      const wordMatch = line.match(wordRegexp);
      if (wordMatch === null) continue;
      const word = wordMatch[0];
      list.push(word);
    }
  }
  return list;
}
/**
 * Memoize list words
 */
const memoizedListWords = memoize(list);
await memoizedListWords();
export const listWords = memoizedListWords;
/**
 * Interface of a word map object
 */
interface IWordMap {
  word: string;
  category: TCategory;
  offsets: number[];
}
/**
 *
 * @returns
 */
async function mapWords() {
  const map: IWordMap[] = [];
  for (let i = 0; i < CATEGORIES.length; i++) {
    const category = CATEGORIES[i];
    const ext = EXTS[i];
    const index = FILENAMES[0];
    const indexPath = join(DBPATH, index + ext);

    const reader = createReadStream(indexPath);
    const rl = readline.createInterface({
      input: reader,
      crlfDelay: Infinity,
      terminal: false,
    });
    for await (let line of rl) {
      const wordMatch = line.match(wordRegexp);
      if (wordMatch === null) continue;
      const word = wordMatch[0];
      const bufferOffsets = line.match(bufferOffsetRegexp);
      if (bufferOffsets === null) continue;
      const offsets = bufferOffsets.map((offsets) => parseInt(offsets));
      map.push({ word, offsets, category });
    }
  }
  return map;
}
/**
 * Memoizing map words function
 */
const memoizedMapWords = memoize(mapWords);
await memoizedMapWords();
/**
 *
 * @param fd
 * @param maxBufferSize
 * @param offsets
 * @returns
 */
async function findWordDef(
  fd: FileHandle,
  maxBufferSize: number,
  offsets: number[]
) {
  const definitions = [];
  for (let i = 0; i < offsets.length; i++) {
    const pos = offsets[i];
    const result = await fd.read(
      Buffer.alloc(maxBufferSize),
      0,
      maxBufferSize,
      pos
    );
    const line = result.buffer.toString().split("\n")[0].split("|");
    definitions.push(line[line.length - 1].trim());
  }
  return definitions;
}
/**
 *
 * @param word
 * @returns
 */
export async function lookup(word: string) {
  const map = await memoizedMapWords();
  const wordMaps = map.filter((el) => el.word === word.trim().toLowerCase());
  if (wordMaps.length === 0) {
    console.log(`Could not find definitions for: \x1b[33m${word}\x1b[0m`);
    return;
  }
  const matches: Word[] = [];
  for (let i = 0; i < wordMaps.length; i++) {
    const wordMap = wordMaps[i];
    const category = wordMap.category;
    const catIndex = CATEGORIES.indexOf(category);
    const ext = EXTS[catIndex];

    const data = FILENAMES[1];
    const dataPath = join(DBPATH, data + ext);

    const fd = await open(dataPath);
    const definitions = await findWordDef(fd, SIZE, wordMap.offsets);

    matches.push(new Word(wordMap.word, category, definitions));

    await fd.close();
  }
  return matches;
}
