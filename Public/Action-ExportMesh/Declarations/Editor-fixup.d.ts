declare namespace Editor {
    interface PluginSystem {

        /**
         * Get various interfaces to the Lens Studio editor, such as its {@link Editor.Model} and {@link Editor.Model.AssetManager}.
         */
        findInterface<T extends typeof Editor.IInterface>(
            interfaceType: T extends { interfaceId: string | Editor.InterfaceId } ? T : (Editor.InterfaceId | string),
        ): T extends { prototype: infer R } ? R : Editor.IInterface | null;

    }
}
