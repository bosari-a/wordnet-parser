import {createReadStream}from'fs';import {open}from'fs/promises';import*as readline from'node:readline/promises';import {join}from'path/posix';/******************************************************************************
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
};/**
 * Constant declarations along with types
 */
const FILENAMES = ["index", "data"];
const EXTS = [".adj", ".adv", ".noun", ".verb"];
const DBPATH = "./dict";
const CATEGORIES = ["a", "r", "n", "v"];
/**
 * REGEXP
 */
const bufferOffsetRegexp = /\b\d{8}\b/g; // matches buffer offset values in data files (data.ext)
const wordRegexp = /^[\w_\-.]+\b/; // matches compound words with '-' or '_' separators
const zeroFills = /^0*/g; // regexp for using replace on buffer offset
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
 * @param filePath
 * @returns
 */
function findMaxLineSize(filePath) {
    var _a, e_1, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const reader = createReadStream(filePath);
        const rl = readline.createInterface({
            input: reader,
            terminal: false,
            crlfDelay: Infinity,
        });
        let max = 0;
        try {
            for (var _d = true, rl_1 = __asyncValues(rl), rl_1_1; rl_1_1 = yield rl_1.next(), _a = rl_1_1.done, !_a; _d = true) {
                _c = rl_1_1.value;
                _d = false;
                const line = _c;
                const size = new Blob([line]).size;
                size > max ? (max = size) : null;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = rl_1.return)) yield _b.call(rl_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        rl.close();
        reader.close();
        return max;
    });
}
/**
 *
 * @param fd
 * @param bufferOffsets
 * @param maxBufferSize
 * @returns
 */
function lookupDefs(fd, bufferOffsets, maxBufferSize) {
    return __awaiter(this, void 0, void 0, function* () {
        const definitions = bufferOffsets.map((bufferOffset) => __awaiter(this, void 0, void 0, function* () {
            const pos = Number(bufferOffset.replace(zeroFills, ""));
            const result = yield fd.read(Buffer.alloc(maxBufferSize), 0, maxBufferSize, pos);
            const line = result.buffer.toString().split("\n")[0].split("|");
            return line[line.length - 1].trim();
        }));
        return yield Promise.all(definitions);
    });
}
/**
 *
 * @param indexPath
 * @param dataPath
 * @param maxBufferSize
 * @param category
 * @returns
 */
function dictFromIndex(indexPath, dataPath, maxBufferSize, category) {
    var _a, e_2, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const words = [];
        const reader = createReadStream(indexPath);
        const fd = yield open(dataPath, "r");
        const rl = readline.createInterface({
            input: reader,
            crlfDelay: Infinity,
            terminal: false,
        });
        try {
            for (var _d = true, rl_2 = __asyncValues(rl), rl_2_1; rl_2_1 = yield rl_2.next(), _a = rl_2_1.done, !_a; _d = true) {
                _c = rl_2_1.value;
                _d = false;
                let line = _c;
                line = line.trim();
                const wordMatch = line.match(wordRegexp);
                const bufferOffsets = line.match(bufferOffsetRegexp);
                if (wordMatch === null || bufferOffsets === null)
                    continue;
                const definitions = yield lookupDefs(fd, bufferOffsets, maxBufferSize);
                const word = wordMatch[0];
                words.push(new Word(word, category, definitions));
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = rl_2.return)) yield _b.call(rl_2);
            }
            finally { if (e_2) throw e_2.error; }
        }
        yield fd.close();
        rl.close();
        reader.close();
        return words;
    });
}
/**
 *
 * @param dbPath
 * @returns
 */
function wordnetDict(dbPath = DBPATH) {
    return __awaiter(this, void 0, void 0, function* () {
        const dict = [];
        for (const cat of CATEGORIES) {
            const ext = EXTS[CATEGORIES.indexOf(cat)];
            const index = FILENAMES[0];
            const data = FILENAMES[1];
            const indexPath = join(dbPath, index + ext);
            const dataPath = join(dbPath, data + ext);
            const maxBufferSize = yield findMaxLineSize(dataPath);
            dict.push(dictFromIndex(indexPath, dataPath, maxBufferSize, cat));
        }
        return (yield Promise.all(dict)).flat();
    });
}export{CATEGORIES,DBPATH,EXTS,FILENAMES,Word,bufferOffsetRegexp,dictFromIndex,findMaxLineSize,lookupDefs,wordRegexp,wordnetDict,zeroFills};