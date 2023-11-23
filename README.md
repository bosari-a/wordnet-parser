# Wordnet Parser

## What is WordNet?
It is a large database for English words, their definitions, and other lexical information. The project is made by Princeton University.

- [WordNet website](https://wordnet.princeton.edu/)
## Usage
**Note**: Before running make sure to run
```sh
export NODE_OPTIONS=--max-old-space-size=3000
```

if you are using linux/ubuntu/WSL in the bash terminal at the root of your project. Otherwise you will get a giant stacktrace with an out of memory error.
- [Guides here for both windows and linux](https://stackoverflow.com/a/64409997/18999644)

```js
const dbPath = "./path/to/dict/folder" // check link below for download
wordnetDict(dbPath)
.then((dict)=>{
    // code to use dictionary...
})
```
Each word in the dictionary (`dict` above) has type of class `Word`:
```js
Word {
    word: string,
    category: "a" | "r" | "n" | "v",
    definitions: string[]
}
```
Each category is:
- n    NOUN
- v    VERB 
- a    ADJECTIVE 
- s    ADJECTIVE SATELLITE 
- r    ADVERB 

For more documentation on the file formats:
- [Reference for dataset file format](https://wordnet.princeton.edu/documentation/wndb5wn)

## The Why (and usecase)
It is surprisingly fast to insert the whole dictionary into a Mongodb database. I don't recommend such bulk uploads but the speed is quite good and acceptable (a few seconds or less). This is also strictly meant as one-time processing/parsing of wordnet database to produce the bulky dictionary object which you can write into a json file or insert in bulk into a database. This is not an api you can look into these if you need an api specifically for wordnet:

- [npm wordnet](https://www.npmjs.com/package/wordnet)
> `wordnet.init([database_dir])`
Loads the WordNet database. Takes an optional folder path (as a String)...
- [npm node-wordnet](https://www.npmjs.com/package/node-wordnet)
> This is an implementation of a Wordnet API in pure JavaScript. It was initially adapted from NaturalNode/natural, which had the original core implementation, but which was very basic and hard to use for higher-level tasks.
## Downloads
- Download the [WordNet dataset](https://wordnet.princeton.edu/download/current-version)

## License
- [WordNet License](https://wordnet.princeton.edu/license-and-commercial-use)