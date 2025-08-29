declare class TypeName<Tp extends Component> extends String {
    private ["__TypeName__"]: void;
}
declare abstract class BaseScriptComponent implements ScriptComponent {
    api: Record<string, any>;
    enabled: boolean;
    name: string;
    uniqueIdentifier: string;
    updatePriority: number;
    sceneObject: SceneObject;

    createEvent<K extends keyof EventNameMap>(eventType: K): EventNameMap[K];

    destroy(): void;

    getReferencedEvents(): SceneEvent[];

    getSceneObject(): SceneObject;

    getTransform(): Transform;

    getTypeName(): string;

    isOfType(type: string): boolean;

    isSame(other: ScriptObject): boolean;

    removeEvent(event: SceneEvent): void;

    private __initialize();

    static getTypeName<T extends typeof BaseScriptComponent>(this: T): TypeName<InstanceType<T>>;

}
