import * as LensBasedEditorView from 'LensStudio:LensBasedEditorView';

export const findDescriptor = (pluginSystem, plugin) => {
    return pluginSystem.descriptors.find((other) => other.id == plugin.descriptor().id);
}

export async function waitForLBE(lbe) {
    return new Promise((resolve, reject) => {
        if (lbe.isLoaded) {
            resolve();
        } else {
            const waiter = lbe.onStateChanged.connect((state) => {
                if (state == LensBasedEditorView.State.Running) {
                    waiter.disconnect();
                    resolve();
                }
            });
        }
    });
}

export function compareArrays(lhs, rhs) {
    if (lhs.length != rhs.length) {
        return false;
    }
    for (let i = 0; i < lhs.length; i++) {
        if (lhs[i] != rhs[i]) {
            return false;
        }
    }
    return true;
}

export function deepEqual(obj1, obj2) {
    // If both are the same object reference, they're equal
    if (obj1 === obj2) {
        return true;
    }

    // If either is null or not an object, they're not equal
    if (obj1 === null || obj2 === null || typeof obj1 !== 'object' || typeof obj2 !== 'object') {
        return false;
    }

    // Get keys of both objects
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    // If number of properties is different, they're not equal
    if (keys1.length !== keys2.length) {
        return false;
    }

    // Check if all keys and values are deeply equal
    for (const key of keys1) {
        if (!obj2.hasOwnProperty(key) || !deepEqual(obj1[key], obj2[key])) {
            return false;
        }
    }

    return true;
}

export function uniqueBy(array, comparator) {
    return array.filter((item, index, self) => {
        return index === self.findIndex((t) => comparator(item, t));
    });
}

export function compareVersions(v1, v2) {
    if (v1.major !== v2.major) {
        return v1.major - v2.major;
    }
    if (v1.minor !== v2.minor) {
        return v1.minor - v2.minor;
    }
    return v1.patch - v2.patch;
}
