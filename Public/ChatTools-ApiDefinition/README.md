This package creates a ChatTools plugin which can fuzzy search for api definition.

It takes two steps:

1. Turns d.ts into .json to search from. This is done by [compileSource](./helpers/compileSource.ts).
2. Compile a plugin which exposes this JSON. This is done by [src](./src/index.ts)

## Building

```
npm install
npm run build
```

## Context
Since we don't want to ship Typescript or require users to have node, we have to convert the d.ts to a portable format (.json), which can be easily searched by native js.

## TODO
We should get d.ts automatically from outside this plugin to make sure it is up to date.