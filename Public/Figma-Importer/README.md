If you are looking to deploy the plugin locally from this repository, you can follow the steps below:

1. Open the terminal and navigate to this directory.

2. Run `tsc` to compile the TypeScript files. Now you will have the JavaScript files needed to run the plugin.

3. (If you don't have `tsc` installed, you can install it by running `npm install -g typescript`)

4. Due to the quirkiness of the plugin system, we have to create a higher-level directory to host this directory. Create an empty directory, for the sake of the demonstration we will call it 'figma-importer-wrapper', and move this directory (figma-importer) inside it.

5. Now you should have this structure:

```
figma-importer-wrapper
│ figma-importer
│ │ README.md
│ │ module.json
│ │ dist
│ │ │ main.js
│ │ │ ...
```

6. Now you can add the 'figma-importer-wrapper' directory to the plugin manager in Lens Studio.
