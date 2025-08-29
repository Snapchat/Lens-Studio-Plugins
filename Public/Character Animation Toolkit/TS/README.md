## Building

This project has a `package.json`, but there are no external source code dependencies. The only thing npm is used for is to install the TypeScript compiler. If you already have `tsc` installed globally, then you don't necessarily need to install TypeScript locally, but doing so ensures that you are using a specific version.

To setup project:

```sh
npm install
```

To compile TypeScript in `src` folder to JavaScript in `dist` folder:

```sh
npx tsc
```

## Testing

To replace builtin LBE plugin refer to [LensBasedEditors Readme](../README.md)
