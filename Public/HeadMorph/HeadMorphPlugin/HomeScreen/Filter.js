import * as Ui from 'LensStudio:Ui';

const ALL_FILTER_ID = '#all';

export class Filter {
    constructor(parent, schema, onFilterUpdated) {
        this.onFilterUpdated = onFilterUpdated;

        this.loadSchema(schema);

        const filterIconPath = new Editor.Path(import.meta.resolve('../Resources/filter.svg'));
        this.mWidget = new Ui.ToolButton(parent);
        this.mWidget.setIcon(Editor.Icon.fromFile(filterIconPath));

        this.actionConnections = [];
        this.actions = {};
        this.menu = {};

        this.filterMenu = new Ui.Menu(parent);

        this.filterButtonCon = this.mWidget.onClick.connect(() => {
            this.filterMenu.popup(this.mWidget);
        });

        this.loadUi(schema);
        this.updateView();
    }

    get widget() {
        return this.mWidget;
    }

    loadSchema(schema) {
        this.schema = schema;

        this.selectedFilter = {};
        this.selectedFilter[ALL_FILTER_ID] = {};
        this.selectedFilter[ALL_FILTER_ID][ALL_FILTER_ID] = true;

        Object.keys(schema).forEach((key) => {
            this.selectedFilter[key] = {};
            this.selectedFilter[key][ALL_FILTER_ID] = true;

            this.schema[key].values.forEach((item) => {
                this.selectedFilter[key][item.value] = false;
            });
        });
    }

    loadUi(schema) {
        this.actions[ALL_FILTER_ID] = {};
        this.actions[ALL_FILTER_ID][ALL_FILTER_ID] = this.createAction(this.filterMenu, 'All Effects', (toggled) => {
            this.updateCheck(true, ALL_FILTER_ID, ALL_FILTER_ID);
        });

        this.filterMenu.addAction(this.actions[ALL_FILTER_ID][ALL_FILTER_ID]);
        this.filterMenu.addSeparator();

        Object.keys(schema).forEach((key) => {
            this.menu[key] = this.filterMenu.addMenu(this.schema[key].ui);
            this.actions[key] = {};

            this.actions[key][ALL_FILTER_ID] = this.createAction(this.filterMenu, 'All', (toggled) => {
                this.updateCheck(true, key, ALL_FILTER_ID);
            });

            this.menu[key].addAction(this.actions[key][ALL_FILTER_ID]);

            this.schema[key].values.forEach((item) => {
                this.actions[key][item.value] = this.createAction(this.filterMenu, item.ui, (toggled) => {
                    this.updateCheck(toggled, key, item.value);
                });
                this.menu[key].addAction(this.actions[key][item.value]);
            });
        });
    }

    updateView() {
        Object.keys(this.selectedFilter).forEach((key) => {
            Object.keys(this.selectedFilter[key]).forEach((index) => {
                this.actions[key][index].blockSignals(true);
                this.actions[key][index].checked = this.selectedFilter[key][index];
                this.actions[key][index].blockSignals(false);
            });
        });
    }

    onModelUpdated(sendCallbackFlag) {
        this.updateView();
        if (sendCallbackFlag) {
            this.onFilterUpdated(this.toString());
        }
    }

    toString() {
        let result = '';

        Object.keys(this.selectedFilter).forEach((key) => {
            Object.keys(this.selectedFilter[key]).forEach((value) => {
                if (this.selectedFilter[key][value] && value != ALL_FILTER_ID) {
                    result += '&filter[]=' + key + '%3D' + value;
                }
            });
        });

        return result;
    }

    updateSelectedFilter(toggled, key, value) {
        if (key == ALL_FILTER_ID) {
            if (toggled) {
                this.selectAll();
            }

            this.selectedFilter[ALL_FILTER_ID][ALL_FILTER_ID] = toggled;
        } else if (value == ALL_FILTER_ID) {
            if (toggled) {
                this.clearSelectedFilter(key);
            }
            this.selectedFilter[key][value] = toggled;
        } else {
            if (!toggled) {
                this.updateSelectedFilter(true, key, ALL_FILTER_ID);
            } else {
                this.clearSelectedFilter(key);
                this.selectedFilter[key][value] = toggled;
            }
        }

        this.selectedFilter[ALL_FILTER_ID][ALL_FILTER_ID] = this.checkIfAllOptionsSelected();
    }

    reset() {
        this.updateSelectedFilter(true, ALL_FILTER_ID, ALL_FILTER_ID);
        this.onModelUpdated(true);
    }

    clearSelectedFilter(key) {
        Object.keys(this.selectedFilter[key]).forEach((index) => {
            this.selectedFilter[key][index] = false;
        });
    }

    selectAll() {
        Object.keys(this.selectedFilter).forEach((key) => {
            if (key != ALL_FILTER_ID) {
                this.updateSelectedFilter(true, key, ALL_FILTER_ID);
            }
        });
    }

    checkIfAllOptionsSelected() {
        for (const key in this.selectedFilter) {
            if (key != ALL_FILTER_ID) {
                if (this.selectedFilter[key][ALL_FILTER_ID] == false) {
                    return false;
                }
            }
        }

        return true;
    }

    updateCheck(toggled, key, value) {
        const sendCallbackFlag = ((value != ALL_FILTER_ID) || (this.selectedFilter[key][value] != toggled));

        this.updateSelectedFilter(toggled, key, value);
        this.onModelUpdated(sendCallbackFlag);
    };

    createAction(parent, caption, callback) {
        const newAction = new Ui.Action(parent);
        newAction.text = caption;
        this.actionConnections.push(newAction.onToggle.connect(callback));

        newAction.checkable = true;
        return newAction;
    };
}
