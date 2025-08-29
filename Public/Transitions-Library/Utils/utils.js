export function getSceneObject(so, name, component) {
    if (so.name == name) {
        if (component == null) {
            return so;
        }
        if (so.getComponent(component)) {
            return so;
        }
    }
    for (let i = 0; i < so.getChildrenCount(); i++ ) {
        let child = so.getChildAt(i);
        const result = getSceneObject(child, name, component);
        if (result) {
            return result;
        }
    }
}
export function getDeviceCameraTexture(assets) {
    return assets.filter(asset => asset.type === "DeviceCameraTexture").reverse();
}

/** Ponyfill for Promise.any */
export function anyPromise(promises) {
    let remaining = promises.length;
    return new Promise((resolve, reject) => {
        promises.forEach(p => p.then(resolve).catch(e => {
            if (--remaining == 0) reject(e);
        }));
    });
}
