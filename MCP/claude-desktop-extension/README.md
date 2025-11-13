# Lens Studio MCP Extension for Claude Desktop

This extension allows Claude Desktop to interact with Snap's Lens Studio application.

> **⚠️ Beta Feature Notice:** This is a beta feature that won't work with the current Lens Studio release. It will be compatible with upcoming version(s) soon.

## How It Works

The extension runs a local server on port 50050 that connects to Lens Studio. This allows you to use Claude to control Lens Studio.

## Local Installation (for Development)

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Build & Pack the Extension:**
    ```bash
    npx mcpb pack
    ```
    This will create a `lens-studio-mcp-proxy-x.x.x.mcpb` file.

3.  **Install in Claude Desktop:**
    Double-click the generated `.mcpb` file to install it.

## First-Time Setup in Lens Studio

1.  **Start Lens Studio** and open the MCP Configuration dialog:
    `File` → `Assistant AI` → `MCP Settings`

2.  **Start the MCP Server** in the dialog. This will start servers on both your user-configured port and the fixed port `50050` for this extension.

3.  **Approve Connection:** The first time the extension connects, Lens Studio will show a dialog asking for permission. Click **Approve** to allow Claude Desktop to connect.

You can now use Claude to interact with Lens Studio.
