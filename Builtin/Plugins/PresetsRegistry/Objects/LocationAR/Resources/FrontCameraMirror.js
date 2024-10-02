// FrontCameraMirror.js
// Version: 0.0.4
// Event: Lens Initialized
// Description: Mirrors objects it is attached to in the X axis when camera is changed between front and rear facing

function flip() {
    const skipFlip = !script.doneFirstFlip && global.scene.getCameraType() == 'back';
    script.doneFirstFlip = true;
    if (skipFlip) {
        return;
    }

    const sceneObject = script.getSceneObject();
    const transform = sceneObject.getTransform();
    const scale = transform.getLocalScale();
    scale.x = -scale.x;
    transform.setLocalScale(scale);
    const visitedMaterials = [];
    flipMaterials(sceneObject, visitedMaterials);
}

function containsMaterial(materials, material) {
    for (let i = 0; i < materials.length; i++) {
        if (materials[i].isSame(material)) {
            return true;
        }
    }
    return false;
}

// This script negates the X scale on front camera.
// A consequence of negative scale is that geometry is turned inside out.
// A single-sided material (default) will disappear when turned inside out.
// To counter this, the script will also swap the Cull Mode (e.g. Front to Back)
// of any Material in its hierarchy.
function flipMaterials(sceneObject, visitedMaterials) {
    const components = sceneObject.getAllComponents();
    for (let i = 0; i < components.length; i++) {
        if (components[i].getMaterialsCount !== undefined) {
            const materialCount = components[i].getMaterialsCount();
            for (let j = 0; j < materialCount; j++) {
                const material = components[i].getMaterial(j);
                if (!material || containsMaterial(visitedMaterials, material)) {
                    continue;
                }
                const passCount = material.getPassCount();
                for (let k = 0; k < passCount; k++) {
                    const pass = material.getPass(k);
                    if (pass.twoSided) {
                        continue;
                    }
                    if (pass.cullMode == CullMode.Front) {
                        pass.cullMode = CullMode.Back;
                    } else if (pass.cullMode == CullMode.Back) {
                        pass.cullMode = CullMode.Front;
                    }
                }
                visitedMaterials.push(material);
            }
        }
    }

    const childrenCount = sceneObject.getChildrenCount();
    for (let l = 0; l < childrenCount; l++) {
        flipMaterials(sceneObject.getChild(l), visitedMaterials);
    }
}

const cameraFrontEvent = script.createEvent('CameraFrontEvent');
cameraFrontEvent.bind(flip);

const cameraBackEvent = script.createEvent('CameraBackEvent');
cameraBackEvent.bind(flip);
