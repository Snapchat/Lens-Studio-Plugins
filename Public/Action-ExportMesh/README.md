# Action-ExportMesh

This plugin adds a menu action for `.mesh` assets that allows converting and saving meshes to disk as `.glb` files.

The conversion process doesn't rely on any LensCore functionality for parsing or writing meshes. The mesh is read straight from disk as a binary file and the output is written to disk as a binary file. In this sense, this tool could be turned into a command-line program with no dependencies on Lens Studio.

## Not yet supported

Joints and skinning weights won't be copied over, but exporting files with this data will otherwise still work.

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
