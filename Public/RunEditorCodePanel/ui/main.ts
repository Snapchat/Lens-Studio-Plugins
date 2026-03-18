import * as monaco from "monaco-editor";
import editorTypesRaw from "./types/editor.txt?raw";
import editorAmbientTypesRaw from "./editor-ambient.txt?raw";
// @ts-ignore
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
// @ts-ignore
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

(window as any).MonacoEnvironment = {
  getWorker(_: string, label: string) {
    if (label === "typescript" || label === "javascript") return new tsWorker();
    return new editorWorker();
  },
};

const DEFAULT_CODE = `// Available: model, pluginSystem (params)
// Get scene/assetManager from model.project

// Example 1: Create a Scene Object
const scene = model.project.scene;
const obj = scene.createSceneObject("Hello World");
console.log("Created:", obj.name);

// Example 2: List All Scene Objects
scene.sceneObjects.forEach((obj, i) => {
  console.log(\`\${i + 1}. \${obj.name}\`);
});

// Example 3: Get Asset Info
const assetManager = model.project.assetManager;
console.log("Assets directory:", assetManager.assetsDirectory.toString());
console.log("Total assets:", assetManager.assets.length);

// Example 4: Dynamic Import with Await
const App = await import("LensStudio:App");
console.log("App version:", App.version);
`;

const STORAGE_KEY = "com.test.runeditorcode.code";

function getWsPort(): number {
  const params = new URLSearchParams(window.location.search);
  const port = params.get("wsPort");
  if (!port) {
    throw new Error("No WebSocket port specified");
  }
  return parseInt(port, 10);
}

function sendToPlugin(ws: WebSocket, event: string, payload?: unknown): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ event, payload }));
  } else {
    console.warn("WebSocket not ready, message not sent");
  }
}

function setupConsoleLogging(ws: WebSocket): void {
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  console.log = (...args) => {
    originalLog(...args);
    sendToPlugin(ws, "uiLog", { type: "log", message: args.join(" ") });
  };

  console.error = (...args) => {
    originalError(...args);
    sendToPlugin(ws, "uiLog", { type: "error", message: args.join(" ") });
  };

  console.warn = (...args) => {
    originalWarn(...args);
    sendToPlugin(ws, "uiLog", { type: "warn", message: args.join(" ") });
  };
}

function init(): void {
  try {
    console.log("[Init] Starting initialization...");
    const editorEl = document.getElementById("editor");
    const executeBtn = document.getElementById("executeBtn");

    if (!editorEl || !executeBtn) {
      throw new Error("Required DOM elements not found");
    }

    const savedCode = localStorage.getItem(STORAGE_KEY) ?? DEFAULT_CODE;

    const compilerOpts = {
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowJs: true,
      lib: ["es2020"],
      skipDefaultLibCheck: true,
      allowNonTsExtensions: true,
    };
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions(compilerOpts);
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions(compilerOpts);
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    // Add type libraries FIRST (before creating model)
    // Add editor types to both language defaults
    console.log("[Init] Adding editor.d.ts, size:", editorTypesRaw.length, "bytes");
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      editorTypesRaw,
      "file:///editor.d.ts"
    );
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      editorTypesRaw,
      "file:///editor.d.ts"
    );

    // Then add ambient types that declare the global variables
    console.log("[Init] Adding editor-ambient.d.ts, size:", editorAmbientTypesRaw.length, "bytes");
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      editorAmbientTypesRaw,
      "file:///editor-ambient.d.ts"
    );
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      editorAmbientTypesRaw,
      "file:///editor-ambient.d.ts"
    );
    console.log("[Init] Type libraries loaded");

    // Then create the model
    const model = monaco.editor.createModel(
      savedCode,
      "javascript",
      monaco.Uri.parse("inmemory://model/script.js")
    );
    console.log("[Init] Model created");

    const editor = monaco.editor.create(editorEl, {
      model,
      theme: "vs-dark",
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 13,
      lineNumbers: "on",
      scrollBeyondLastLine: false,
      wordWrap: "on",
      quickSuggestions: {
        other: true,
        comments: false,
        strings: true,
      },
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnCommitCharacter: true,
      suggest: {
        showMethods: true,
        showFunctions: true,
        showConstructors: true,
        showFields: true,
        showVariables: true,
        showClasses: true,
        showStructs: true,
        showInterfaces: true,
        showModules: true,
        showProperties: true,
        showEvents: true,
        showOperators: true,
        showUnits: true,
        showValues: true,
        showConstants: true,
        showEnums: true,
        showEnumMembers: true,
        showKeywords: true,
        showWords: true,
        showColors: true,
        showFiles: true,
        showReferences: true,
        showFolders: true,
        showTypeParameters: true,
        showSnippets: true,
      },
    });
    console.log("[Init] Editor created");

    editor.onDidChangeModelContent(() => {
      localStorage.setItem(STORAGE_KEY, editor.getValue());
    });

    const wsPort = getWsPort();
    const ws = new WebSocket(`ws://127.0.0.1:${wsPort}`);

    ws.onopen = () => {
      setupConsoleLogging(ws);
      sendToPlugin(ws, "ready");
    };

    function execute(): void {
      const code = editor.getValue();
      if (!code.trim()) return;
      sendToPlugin(ws, "executeCode", { code });
    }

    executeBtn.addEventListener("click", execute);

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      execute();
    });

    console.log("[Init] Initialization complete");
  } catch (e) {
    console.error("[Init] Error during initialization:", e);
    throw e;
  }
}

init();
