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

const STORAGE_KEY_JS = "com.test.runeditorcode.code.js";
const STORAGE_KEY_TS = "com.test.runeditorcode.code.ts";

const DEFAULT_CODE_TS = `// TypeScript mode — full type checking with Editor API types
// Available globals: model (Editor.Model.IModel), pluginSystem (Editor.PluginSystem)

const scene = model.project.scene;
const obj = scene.createSceneObject("Hello TS");
console.log("Created:", obj.name);
`;

type Language = "javascript" | "typescript";

function getWsPort(): number {
  // Prefer hash but fall back to search for backward compatibility
  const queryString = window.location.hash.substring(1) || window.location.search;
  const params = new URLSearchParams(queryString);
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

    // Determine initial language
    let currentLang: Language =
      (localStorage.getItem("com.test.runeditorcode.lang") as Language) ?? "javascript";

    function getStorageKey(lang: Language) {
      return lang === "typescript" ? STORAGE_KEY_TS : STORAGE_KEY_JS;
    }

    function getDefaultCode(lang: Language) {
      return lang === "typescript" ? DEFAULT_CODE_TS : DEFAULT_CODE;
    }

    function getModelUri(lang: Language) {
      return lang === "typescript"
        ? monaco.Uri.parse("inmemory://model/script.ts")
        : monaco.Uri.parse("inmemory://model/script.js");
    }

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
    const savedCode = localStorage.getItem(getStorageKey(currentLang)) ?? getDefaultCode(currentLang);
    let monacoModel = monaco.editor.createModel(
      savedCode,
      currentLang,
      getModelUri(currentLang)
    );
    console.log("[Init] Model created");

    const editor = monaco.editor.create(editorEl, {
      model: monacoModel,
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
      localStorage.setItem(getStorageKey(currentLang), editor.getValue());
    });

    // Language toggle buttons
    const langJsBtn = document.getElementById("langJs") as HTMLButtonElement;
    const langTsBtn = document.getElementById("langTs") as HTMLButtonElement;

    function setLanguage(lang: Language): void {
      if (lang === currentLang) return;

      // Save current code
      localStorage.setItem(getStorageKey(currentLang), editor.getValue());

      // Switch
      currentLang = lang;
      localStorage.setItem("com.test.runeditorcode.lang", lang);

      const code = localStorage.getItem(getStorageKey(lang)) ?? getDefaultCode(lang);
      const oldModel = editor.getModel();
      const newModel = monaco.editor.createModel(code, lang, getModelUri(lang));
      editor.setModel(newModel);
      oldModel?.dispose();
      monacoModel = newModel;

      // Update button states
      langJsBtn.classList.toggle("active", lang === "javascript");
      langTsBtn.classList.toggle("active", lang === "typescript");
    }

    // Set initial button state
    langJsBtn.classList.toggle("active", currentLang === "javascript");
    langTsBtn.classList.toggle("active", currentLang === "typescript");

    langJsBtn.addEventListener("click", () => setLanguage("javascript"));
    langTsBtn.addEventListener("click", () => setLanguage("typescript"));

    const wsPort = getWsPort();
    const ws = new WebSocket(`ws://127.0.0.1:${wsPort}`);

    ws.onopen = () => {
      setupConsoleLogging(ws);
      sendToPlugin(ws, "ready");
    };

    async function getTranspiledCode(): Promise<string> {
      if (currentLang === "javascript") {
        return editor.getValue();
      }
      // Transpile TypeScript using Monaco's TS worker
      const uri = getModelUri("typescript");
      const getWorker = await monaco.languages.typescript.getTypeScriptWorker();
      const worker = await getWorker(uri);
      const output = await worker.getEmitOutput(uri.toString());
      const jsFile = output.outputFiles.find((f) => f.name.endsWith(".js"));
      if (!jsFile) {
        throw new Error("TypeScript transpilation produced no output");
      }
      return jsFile.text;
    }

    async function execute(): Promise<void> {
      const code = await getTranspiledCode();
      if (!code.trim()) return;
      sendToPlugin(ws, "executeCode", { code });
    }

    executeBtn.addEventListener("click", () => { execute().catch(console.error); });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      execute().catch(console.error);
    });

    console.log("[Init] Initialization complete");
  } catch (e) {
    console.error("[Init] Error during initialization:", e);
    throw e;
  }
}

init();
