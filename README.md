# tagparser
A simple toy project [![CircleCI](https://circleci.com/gh/eduardonunesp/tagparser.svg?style=svg)](https://circleci.com/gh/eduardonunesp/tagparser)

Requirements
----

- load `tags.txt` to get an array of tags
- for each of these tags, find out how many times that tag appears within the objects in `data/*.json` (_note:_ objects can be nested).
- final output should look something like this (sorted by most popular tag first):

```
pizza 15
spoon 2
umbrella 0
cats 0
```

- use only core modules.
- use the asynchronous variants of the file IO functions (eg. use `fs.readFile` not `fs.readFileSync`).
- if any of the data files contain invalid JSON, log the error with `console.error` and continue, ignoring that file.



