import {readFile,open}from'fs/promises';import {join}from'path/posix';/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};/**
 * Constant declarations along with types
 */
const FILENAMES = ["index", "data"];
const EXTS = [".adj", ".adv", ".noun", ".verb"];
const CATEGORIES = ["a", "r", "n", "v"];
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
    constructor(word, definitions) {
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
function defsForWord(fd, bufferOffset, buffer) {
    return __awaiter(this, void 0, void 0, function* () {
        const position = Number(bufferOffset.replace(zeroFills, ""));
        const result = yield fd.read(buffer, 0, SIZE, position);
        const defLine = result.buffer
            .toString()
            .trim()
            .split("\n")[0]
            .trim()
            .split("|");
        const len = defLine.length;
        return defLine[len - 1].trim();
    });
}
/**
 * Generates a dictionary for a given category (e.g. verbs index.verbs and data.verbs)
 * @param category
 * @param dbPath
 * @returns
 */
function dictFromCategory(category, dbPath = DBPATH) {
    return __awaiter(this, void 0, void 0, function* () {
        const ext = EXTS[CATEGORIES.indexOf(category)];
        const index = FILENAMES[0];
        const data = FILENAMES[1];
        const indexPath = join(dbPath, index + ext);
        const dataPath = join(dbPath, data + ext);
        const indexLines = (yield readFile(indexPath, { encoding: "utf-8" })).split("\n");
        const fd = yield open(dataPath, "r");
        const buffer = Buffer.alloc(SIZE);
        const wordsPromises = [];
        for (let i = 0; i < indexLines.length; i++) {
            const indexLine = indexLines[i].trim();
            if (indexLine.match(compoundRegexp) !== null)
                continue;
            const wordMatch = indexLine.match(wordRegexp);
            if (wordMatch === null)
                continue;
            const defBufferOffsets = indexLine.match(bufferOffsetRegexp);
            if (defBufferOffsets === null)
                continue;
            const definitions = yield Promise.all(defBufferOffsets.map((offset) => {
                return defsForWord(fd, offset, buffer);
            }));
            wordsPromises.push(new Word(wordMatch[0], definitions));
        }
        yield fd.close();
        return yield Promise.all(wordsPromises);
    });
}
/**
 * Generates the wordnet dictionary
 * @param dbPath
 * @returns
 */
function wordnetDict(dbPath = DBPATH) {
    return __awaiter(this, void 0, void 0, function* () {
        const dictPromises = [];
        for (let i = 0; i < CATEGORIES.length; i++) {
            const category = CATEGORIES[i];
            dictPromises.push(dictFromCategory(category, dbPath));
        }
        return (yield Promise.all(dictPromises)).flat();
    });
}export{defsForWord,dictFromCategory,wordnetDict};