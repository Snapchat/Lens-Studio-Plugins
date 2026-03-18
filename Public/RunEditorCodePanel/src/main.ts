import { PanelPlugin, Descriptor } from "LensStudio:PanelPlugin";
import * as Ui from "LensStudio:Ui";
import { WebSocketBridge } from "./WebSocketBridge.js";
import type { ExecuteCodeRequest } from "./types.js";

export class RunEditorCode extends PanelPlugin {
    private root: Ui.Widget | null = null;
    private connections: Editor.ScopedConnection[] = [];
    private webView: Ui.WebEngineView | null = null;
    private wsBridge: WebSocketBridge | null = null;

    static descriptor(): Descriptor {
        const d = new Descriptor();
        d.id = "com.test.runeditorcode";
        d.name = "Run Editor Code";
        d.description = "Execute editor code snippets";
        d.dependencies = [Editor.Model.IModel, Ui.IGui];
        d.isUnique = true;
        d.defaultDockState = Ui.DockState.Attached;
        d.menuActionHierarchy = ["Window"];
        return d;
    }

    constructor(pluginSystem: Editor.PluginSystem, descriptor: Descriptor | undefined) {
        super(pluginSystem, descriptor);
    }

    createWidget(parent: Ui.Widget): Ui.Widget {
        this.root = new Ui.Widget(parent);
        const layout = new Ui.BoxLayout();
        layout.setDirection(Ui.Direction.TopToBottom);

        this.webView = new Ui.WebEngineView(this.root);
        this.webView.setMinimumWidth(400);
        this.webView.setMinimumHeight(300);
        layout.addWidget(this.webView);

        this.root.layout = layout;
        this.initializeWebSocket();

        return this.root;
    }

    private initializeWebSocket(): void {
        this.wsBridge = new WebSocketBridge();
        const port = this.wsBridge.start();

        this.wsBridge.onMessage((msg) => {
            this.handleClientMessage(msg);
        });

        const htmlPath = import.meta.resolve("./ui/index.html");
        const cleanPath = htmlPath.replace(/^file:\/\//, "");
        this.webView!.load(`file://${cleanPath}?wsPort=${port}`);

        this.wsBridge.waitForReady().catch((error) => {
            console.error("[RunEditorCode] Failed to connect to web client:", error, console.None);
        });
    }

    private handleClientMessage(msg: { event: string; payload?: unknown }): void {
        if (msg.event === "executeCode") {
            const request = msg.payload as ExecuteCodeRequest;
            const code = request?.code ?? "";
           // console.log("[RunEditorCode] Execute clicked, code length:", code.length);
            this.executeCode(code);
        } else if (msg.event === "ready") {
           // console.log("[RunEditorCode] Web UI connected (ready)");
        } else if (msg.event === "uiLog") {
            const logData = msg.payload as { type: string; message: string };
            if (logData) {
                const prefix = "[WebUI]";
                if (logData.type === "error") {
                    console.error(prefix, logData.message);
                } else if (logData.type === "warn") {
                    console.warn(prefix, logData.message);
                } else {
                    console.log(prefix, logData.message);
                }
            }
        }
    }

    private async executeCode(code: string): Promise<void> {
        if (!code.trim()) {
            //console.log("[RunEditorCode] Execute: no code to run");
            return;
        }

        console.log("[RunEditorCode] Executing code...");
        try {
            const model = this.pluginSystem.findInterface(Editor.Model.IModel) as Editor.Model.IModel;
            const pluginSystem = this.pluginSystem;

            const executeFunction = new Function(
                "model",
                "pluginSystem",
                `return (async () => { ${code} })();`
            );
            await executeFunction(model, pluginSystem);

            console.log("[RunEditorCode] Execute: success");
        } catch (e) {
            console.log("[RunEditorCode] Execute: error:", e instanceof Error ? e.message : String(e));

            if (e instanceof Error && e.stack) {
                const lineMatch = e.stack.match(/<input>:(\d+)/);
                if (lineMatch) {
                    const stackLineNumber = parseInt(lineMatch[1], 10);
                    const actualLineNumber = stackLineNumber - 2;
                    if (actualLineNumber > 0) {
                        const lines = code.split("\n");
                        if (actualLineNumber <= lines.length) {
                            console.log(`>>> ${lines[actualLineNumber - 1]}`);
                        }
                    }
                }
            }
        }
    }

    deinit(): void {
        if (this.wsBridge) {
            this.wsBridge.close();
            this.wsBridge = null;
        }

        this.connections.forEach((c) => c?.disconnect());
        this.connections = [];

        this.webView = null;
        this.root = null;
    }
}
