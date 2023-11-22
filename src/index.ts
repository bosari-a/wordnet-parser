import { readFile, open, FileHandle } from "fs/promises";
import { join } from "path/posix";
/**
 * Constant declarations along with types
 */
const FILENAMES = ["index", "data"];
const EXTS = [".adj", ".adv", ".noun", ".verb"];
type TCategory = "a" | "r" | "n" | "v";
const CATEGORIES: TCategory[] = ["a", "r", "n", "v"];
const SIZE = 16384;
// fallback path of parent directory of database files (default path)
const DBPATH = "./dict";
/**
 * REGEXP
 */
const wordRegexp = /^([a-zA-Z](?![^a-zA-Z\s]))+/i; // matches words at start of line
const bufferOffsetRegexp = /\b\d{8}\b/g; // matches buffer offset values in data files (data.ext)
const compoundRegexp = /(?<=[a-zA-Z])[^a-zA-Z\s]/; // matches compound words with '-' or '_' separators
const zeroFills = /^0*/g; // regexp for using replace on buffer offset

/**
 * Class for word objects
 */
class Word {
  word: string;
  definitions: string[];

  constructor(word: string, definitions: string[]) {
    this.word = word;
    this.definitions = definitions;
  }
}
/**
 * String manipulation to get definition sentences from a buffer.
 * @param fd
 * @param bufferOffset
 * @returns
 */
export async function defsForWord(
  fd: FileHandle,
  bufferOffset: string,
  buffer: Buffer
) {
  const position = Number(bufferOffset.replace(zeroFills, ""));
  const result = await fd.read(buffer, 0, SIZE, position);
  const defLine = result.buffer
    .toString()
    .trim()
    .split("\n")[0]
    .trim()
    .split("|");
  const len = defLine.length;
  return defLine[len - 1].trim();
}
/**
 * Generates a dictionary for a given category (e.g. verbs index.verbs and data.verbs)
 * @param category
 * @param dbPath
 * @returns
 */
export async function dictFromCategory(
  category: TCategory,
  dbPath: string = DBPATH
) {
  const ext = EXTS[CATEGORIES.indexOf(category)];
  const index = FILENAMES[0];
  const data = FILENAMES[1];

  const indexPath = join(dbPath, index + ext);
  const dataPath = join(dbPath, data + ext);

  const indexLines = (await readFile(indexPath, { encoding: "utf-8" })).split(
    "\n"
  );
  const fd = await open(dataPath, "r");
  const buffer = Buffer.alloc(SIZE);

  const wordsPromises = [];

  for (let i = 0; i < indexLines.length; i++) {
    const indexLine = indexLines[i].trim();
    if (indexLine.match(compoundRegexp) !== null) continue;
    const wordMatch = indexLine.match(wordRegexp);
    if (wordMatch === null) continue;
    const defBufferOffsets = indexLine.match(bufferOffsetRegexp);
    if (defBufferOffsets === null) continue;
    const definitions = await Promise.all(
      defBufferOffsets.map((offset) => {
        return defsForWord(fd, offset, buffer);
      })
    );
    wordsPromises.push(new Word(wordMatch[0], definitions));
  }
  await fd.close();
  return await Promise.all(wordsPromises);
}
/**
 * Generates the wordnet dictionary
 * @param dbPath
 * @returns
 */
export async function wordnetDict(dbPath: string = DBPATH) {
  const dictPromises = [];
  for (let i = 0; i < CATEGORIES.length; i++) {
    const category = CATEGORIES[i];
    dictPromises.push(dictFromCategory(category, dbPath));
  }
  return (await Promise.all(dictPromises)).flat();
}
