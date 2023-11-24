import {createReadStream}from'fs';import {open}from'fs/promises';import*as readline from'node:readline/promises';import {join}from'path/posix';import memoize from'memoizee';import {config}from'dotenv';/******************************************************************************
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


function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};config();
/**
 * Constant declarations along with types
 */
const FILENAMES = ["index", "data"];
const EXTS = [".adj", ".adv", ".noun", ".verb"];
const DBPATH = process.env.DBPATH || "./dict";
const CATEGORIES = ["adjective", "adverb", "noun", "verb"];
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
    constructor(word, category, definitions) {
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
    var _a, e_1, _b, _c;
    const list = [];
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
        try {
            for (var _d = true, rl_1 = (e_1 = void 0, __asyncValues(rl)), rl_1_1; rl_1_1 = await rl_1.next(), _a = rl_1_1.done, !_a; _d = true) {
                _c = rl_1_1.value;
                _d = false;
                let line = _c;
                const wordMatch = line.match(wordRegexp);
                if (wordMatch === null)
                    continue;
                const word = wordMatch[0];
                list.push(word);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = rl_1.return)) await _b.call(rl_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    return list;
}
/**
 * Memoize list words
 */
const memoizedListWords = memoize(list);
await memoizedListWords();
const listWords = memoizedListWords;
/**
 *
 * @returns
 */
async function mapWords() {
    var _a, e_2, _b, _c;
    const map = [];
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
        try {
            for (var _d = true, rl_2 = (e_2 = void 0, __asyncValues(rl)), rl_2_1; rl_2_1 = await rl_2.next(), _a = rl_2_1.done, !_a; _d = true) {
                _c = rl_2_1.value;
                _d = false;
                let line = _c;
                const wordMatch = line.match(wordRegexp);
                if (wordMatch === null)
                    continue;
                const word = wordMatch[0];
                const bufferOffsets = line.match(bufferOffsetRegexp);
                if (bufferOffsets === null)
                    continue;
                const offsets = bufferOffsets.map((offsets) => parseInt(offsets));
                map.push({ word, offsets, category });
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = rl_2.return)) await _b.call(rl_2);
            }
            finally { if (e_2) throw e_2.error; }
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
async function findWordDef(fd, maxBufferSize, offsets) {
    const definitions = [];
    for (let i = 0; i < offsets.length; i++) {
        const pos = offsets[i];
        const result = await fd.read(Buffer.alloc(maxBufferSize), 0, maxBufferSize, pos);
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
async function lookup(word) {
    const map = await memoizedMapWords();
    const wordMaps = map.filter((el) => el.word === word.trim().toLowerCase());
    if (wordMaps.length === 0) {
        console.log(`Could not find definitions for: \x1b[33m${word}\x1b[0m`);
        return;
    }
    const matches = [];
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
}export{listWords,lookup};