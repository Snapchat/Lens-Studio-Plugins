# Claude Desktop extension for Lens Studio

This extension allows Claude Desktop to interact with Snap's Lens Studio application.

**Important: Make sure Lens Studio is running before using this extension.**

<img src="lens-studio-claude-desktop.png" alt="Lens Studio Claude Desktop Integration" width="600">

## How It Works

The extension runs a local server on port 50050 that connects to Lens Studio. This allows Claude to interact with Lens Studio via MCP tools as described in the [Lens Studio AI documentation](https://developers.snap.com/lens-studio/features/lens-studio-ai/developer-mode).

## Installing from Claude Desktop

1. In Claude Desktop, go to **Connectors** → **Desktop extensions**
2. Find and install the **Lens Studio** extension

## Local Installation (for Development)

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Build & Pack the Extension:**
    ```bash
    npx mcpb pack
    ```
    This will create a `claude-desktop-extension.mcpb` file.

3.  **Install in Claude Desktop:**
    Double-click the generated `.mcpb` file to install it.

## First-Time Setup

The first time the extension connects to Lens Studio, you'll see a popup asking for permission. Click **Yes** to allow Claude Desktop to connect.

That's it! You can now use Claude to interact with Lens Studio.

## Usage Examples

Practical examples demonstrating how to use the Lens Studio Agent Tools bundle through natural language prompts.

### Example 1: Get Scene Hierarchy

**User prompt:** "Show me the current scene hierarchy in Lens Studio"

**Expected behavior:**

- Extension retrieves scene graph from Lens Studio
- Returns hierarchical structure of scene objects
- Shows object names, IDs, components, and transforms
- Displays parent-child relationships

---

### Example 2: Create a Scene Object

**User prompt:** "Create a new sphere object called 'MySphere' in the scene"

**Expected behavior:**

- Extension uses preset registry to find sphere preset
- Creates new scene object from SphereMeshObjectPreset
- Names it 'MySphere'
- Confirms creation with object UUID and properties

---

### Example 3: Add Component to Object

**User prompt:** "Add a Camera component to the object named 'CameraObject'"

**Expected behavior:**

- Extension searches for object by name 'CameraObject'
- Creates Camera component from preset
- Attaches component to the object
- Returns component properties and UUID

---

### Example 4: Modify Object Property

**User prompt:** "Set the position of 'MySphere' to x=10, y=5, z=0"

**Expected behavior:**

- Extension finds scene object named 'MySphere'
- Sets transform position property using SetPropertyTool
- Updates x, y, z coordinates
- Confirms property change

---

### Example 5: Search Asset Library

**User prompt:** "Find face tracking assets in the Lens Studio Asset Library"

**Expected behavior:**

- Extension searches asset library with keywords ['face', 'tracking']
- Returns list of matching assets with names and descriptions
- Shows asset types (packages, scripts, etc.)
- Provides download URIs for installation

---

### Example 6: Install Package from Asset Library

**User prompt:** "Install the Face Mask asset from the library"

**Expected behavior:**

- Extension searches for 'Face Mask' asset
- Downloads and installs package from URI
- Confirms installation with package details
- Lists installed package in project

---

### Example 7: List All Assets

**User prompt:** "List all materials in my Lens Studio project"

**Expected behavior:**

- Extension queries project assets with type filter 'Material'
- Returns list of material assets with names and paths
- Shows asset UUIDs for reference
- Displays total count

---

### Example 8: Generate AI Texture

**User prompt:** "Generate a rusty metal texture called 'RustyMetal'"

**Expected behavior:**

- Extension uses GenerateTexture tool with AI
- Creates PBR texture from text prompt
- Saves asset to project with name 'RustyMetal'
- Returns texture asset UUID and path

---

### Example 9: Create Complete Scene Setup

**User prompt:** "Create a face tracking lens with a 3D hat on the head. Use hat from Asset Library"

**Expected behavior:**

- Extension creates face tracking preset object
- Adds head binding component
- Creates or imports 3D hat mesh
- Parents hat to head binding
- Confirms complete scene hierarchy

---

### Example 10: Debug and Inspect

**User prompt:** "What components does the 'Camera Object' have?"

**Expected behavior:**

- Extension retrieves scene object by name
- Lists all attached components with types
- Shows component properties and current values
- Displays enabled/disabled state
