# Wordnet Parser

### The fastest WordNet node API out there ⚡

## What is WordNet?
It is a large database for English words, their definitions, and other lexical information. The project is made by Princeton University.

- [WordNet website](https://wordnet.princeton.edu/)

## API

### `listWords():void`
```js
listWords()
.then((list)=>{
    console.log(list)
})
```
### `lookup():Promise<Word[] | undefined>`
```js
lookup("laugh")
.then((result)=>{
    if (result !== undefined)
        console.log(result)
})
// Example output:
[
  Word {
    word: 'laugh',
    category: 'noun',
    definitions: [
      'the sound of laughing',
      'a facial expression characteristic of a person       laughing; "his face wrinkled in a silent laugh of derision"',
      `a humorous anecdote or remark intended to provoke laughter; "he told a very funny joke"; "he knows a million gags"; "thanks for the laugh"; "he laughed unpleasantly at his own jest"; "even a schoolboy's jape is supposed to have some ascertainable point"`
    ]
  },
  Word {
    word: 'laugh',
    category: 'verb',
    definitions: [ 'produce laughter' ]
  }
]
```
## Downloads
- Download the [WordNet dataset](https://wordnet.princeton.edu/download/current-version)

## License
- [WordNet License](https://wordnet.princeton.edu/license-and-commercial-use)