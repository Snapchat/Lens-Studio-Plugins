import * as FileSystem from 'LensStudio:FileSystem'

export const ConfigOptions =
    [
        {
            keyName: 'figma_canvas_scaler',
            options: ['1x', '2x', '3x'],
            default: '1x'
        },
        {
            keyName: 'image_component_stretch_mode',
            options: ['Fill', 'Fit', 'Stretch', 'FitWidth', 'FitHeight', 'FillAndCut'],
            default: 'Fit'
        }
    ]

//create a type that includes all the possible keyNames
export type ConfigOptionKey = typeof ConfigOptions[number]['keyName']
//create a type that includes all the possible options for a given keyName
export type ConfigOptionValue<K extends ConfigOptionKey> = Extract<typeof ConfigOptions[number], { keyName: K }>['options'][number]

class UserPrefManager {
    private pref: { [key: string]: string }
    private fileRelPath: Editor.Path
    private fileName: string

    constructor() {
        this.fileName = 'widget-pref.json'
        //construct the default object from the ConfigOptions
        const defaultConfig: { [key: string]: string } = {}
        for (const data of ConfigOptions) {
            defaultConfig[data.keyName] = data.default
        }
        this.pref = defaultConfig
        //get the path to the file
        const modulePath = new Editor.Path(import.meta.resolve(''))
        const filepath = new Editor.Path(this.fileName)
        this.fileRelPath = modulePath.parent.appended(filepath)

        if (FileSystem.exists(this.fileRelPath)) {
            this.pref = JSON.parse(FileSystem.readFile(this.fileRelPath))
        } else {
            //make a file by using the default
            this.savePref()
        }
    }

    private savePref() {
        FileSystem.writeFile(this.fileRelPath, JSON.stringify(this.pref, null, 2))
    }

    public writePref(key: ConfigOptionKey, value: ConfigOptionValue<ConfigOptionKey>) {
        this.pref[key] = value
        this.savePref()
    }

    public readPref(key: ConfigOptionKey) {
        return this.pref[key]
    }
}

export default new UserPrefManager()
