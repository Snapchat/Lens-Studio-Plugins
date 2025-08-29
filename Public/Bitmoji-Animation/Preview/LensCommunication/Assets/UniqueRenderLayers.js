// @input SceneObject[] soList

let layerToUnique = {};

function parseLayersString(str) {
    return str.split(",").map((item) => +item);
}

function getUniqueLayerSet(layerSet) {
    let currentUniqueLayerSet = null;
    const layerNumbers = parseLayersString(layerSet.toString());
    layerNumbers.forEach((num) => {
        if (!layerToUnique[num]) {
            layerToUnique[num] = LayerSet.makeUnique();
        }
        if (!currentUniqueLayerSet) {
            currentUniqueLayerSet = layerToUnique[num];
        }
        currentUniqueLayerSet = currentUniqueLayerSet.union(layerToUnique[num]);
    })
    return currentUniqueLayerSet;
}

function handleCameraComponent(object) {
    const cameras = object.getComponents("Component.Camera");
    if (cameras) {
        cameras.forEach((camera) => {
            camera.renderLayer = getUniqueLayerSet(camera.renderLayer);
        })
    }
}

function handleLightComponent(object) {
    const lights = object.getComponents("Component.LightSource");
    if (lights) {
        lights.forEach((light) => {
            light.renderLayer = getUniqueLayerSet(light.renderLayer);
        })
    }
}

function setUniqueLayersForHierarchy(root) {
    root.layer = getUniqueLayerSet(root.layer);
    handleCameraComponent(root);
    handleLightComponent(root);

    const childrenCount = root.getChildrenCount();
    for (let i = 0; i < childrenCount; i++) {
        setUniqueLayersForHierarchy(root.getChild(i));
    }
}

script.soList.forEach((so) => {
    setUniqueLayersForHierarchy(so);
});
