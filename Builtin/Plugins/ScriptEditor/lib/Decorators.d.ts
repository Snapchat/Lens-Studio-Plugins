declare function input(typeOverride?: string, defaultInitializerOverride?: string): (target: any, key: string, index?: number) => void
declare function input(target: any, key: string): void;
declare function input(target: any, key: string, index: number): void;
declare function typename(target: any, key: string): void;
declare function typename(target: any, key: string, index: number): void;
// declare function script(target: any, key: string, index: number): void;
declare function hint(hint: string): (target: any, key: string, index?: number) => void;
declare function label(label: string): (target: any, key: string, index?: number) => void;
declare function showIf(showIf: string, showIfValue?: boolean | number | string): (target: any, key: string, index?: number) => void;
declare function widget(uiWidget: UIWidget): (target: any, key: string, index?: number) => void;
declare namespace ui {
    function separator(target: any, key: string): void;
    function separator(target: any, key: string, index: number): void;
    function label(label: string): (target: any, key: string, index?: number) => void;
    function group_start(label: string): (target: any, key: string, index?: number) => void;
    function group_end(target: any, key: string): void;
    function group_end(target: any, key: string, index: number): void;
}
declare function allowUndefined(target: any, key: string): void;
declare function allowUndefined(target: any, key: string, index: number): void;
declare function component<T extends typeof BaseScriptComponent>(target: T): void;
declare function typedef<T>(target: T): void;
