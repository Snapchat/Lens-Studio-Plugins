Plugins for Lens Studio 5.0
===================================

Examples
--------
This directory contains a collection of plugins. These are designed to demonstrate the utilization of the Editor API in Lens Studio 5.x for creating custom tools and workflows.

1. **Presets**
   - `ComponentPreset`: This adds a new preset to the context menu of the Inspector panel. When clicked, it adds a new component to the selected object.
   - `ObjectMenuPreset`: This adds a new preset to the context menu of the Scene panel. When clicked, it adds a new object or set of objects to the scene.
   - `AssetMenuPreset`: This adds a new preset to the context menu of the Asset Browser panel. When clicked, it creates a new asset.
  

1. **Panel, Screen or Dialog Plugins**
   - `PanelWidgets`: This demonstrates how to create a panel plugin in Lens Studio, which can contain various types of widgets. This example showcases the usage of all types of widgets and UI elements. 
  
2. **Core Services**
   - **Plugins that add new action items to the context menu:**
      - `AssetMenuItem`: This adds a new item "[replace]" to the context menu of the Asset Browser panel. When clicked, it replaces the reference of the selected asset with another asset.
      - `ObjectMenuItem`: This adds a new item "[ungroup]" to the context menu of the Scene panel. When clicked, it flattens the hierarchy of all the children of the selected object.
   - `TCPServer`: This demonstrates how to create a TCP server plugin in Lens Studio, which can be used to communicate with external applications or another instance of Lens Studio.
   - `GitStatusChecker`: This demonstrates how to create a core service plugin in Lens Studio, which can be used to monitor the status of a Git repository. A core service is intended to be a long-living process that enhances the functionality of Lens Studio. This example also shows how to spawn a subprocess to run a `git` command, parse the output, and display it in the Logger. 
   
      **Note:** This plugin uses the `subprocess` module which utilizes the `git` command-line tool. Make sure to have `git` installed on your system and added to the system PATH.





Please note that these plugins are intended for educational purposes and serve as a starting point for developing custom tools and workflows in Lens Studio using the Editor API.

Please refer to the [Plugins Development](https://docs.snap.com/lens-studio/5.0.0/extending-lens-studio/plugins-development/overview) section for more information on how to get started with Lens Studio plugins.