// @input Asset.Texture texture

//@input Asset.RemoteMediaModule remoteAsset
//@input SceneObject parent
//@input SceneObject animParent
//@input SceneObject loading
//@input Component.Image staticBitmojiImage
//@input Asset.Texture deviceCameraTexture
//@input Asset.Texture cropTexture

var needToSendEncodedTexture = false;
var encodedTextureId = -1;
var checkedId = {};

var delayedEvent = script.createEvent("DelayedCallbackEvent");
delayedEvent.bind(function() {
    saveTexture();
})

var delayedEvent1 = script.createEvent("DelayedCallbackEvent");
delayedEvent1.bind(function() {
    getTransitionTexture();
})

var curEncodedTexture = null;

script.createEvent("MessageEvent").bind((event) => {
//    script.animParent.enabled = true;
    const value = JSON.parse(event.data);

    if (value.queueId) {
        if (!Editor || !Editor.context || !Editor.context.postMessage || !value || !value.queueId) {
            return;
        }
        if (checkedId[value.queueId]) {
            return;
        }
        try {
            Editor.context.postMessage({"event_type" : "remove_from_queue", "queueId" : value.queueId});
            checkedId[value.queueId] = true;
        } catch(e) {

        }
    }

    if (value.status == "start_loading") {
        var takenPhoto = script.texture.copyFrame();
        script.staticBitmojiImage.mainPass.baseTex = takenPhoto;
        script.staticBitmojiImage.enabled = true;
        script.loading.enabled = true;
        script.animParent.enabled = false;

        return;
    }

    if (value.status == "hide") {
        script.animParent.enabled = false;
        script.staticBitmojiImage.enabled = false;
        script.loading.enabled = false;
        return;
    }

    if (value.status == "get_transition_texture") {
        delayedEvent1.reset(0.05);
        encodedTextureId = value.id;
        return;
    }

    if (value.status == "show") {
        script.animParent.enabled = true;

        Editor.context.scene.rootSceneObjects.forEach(function (rootObj) {
            if (rootObj.id.toString() == value.id.toString()){
                var animPlayer = findObjectInLensCore(rootObj).getComponent("Component.AnimationPlayer");
                var localAnimPlayer = script.animParent.getComponent("Component.AnimationPlayer");
                if (localAnimPlayer.clips.length > 0) {
                    localAnimPlayer.removeClip(localAnimPlayer.clips[0].name)
                }
                animPlayer.clips[0].begin = 0.0333;
                animPlayer.clips[0].end = Number(value.endTime);
                localAnimPlayer.addClip(animPlayer.clips[0]);
                localAnimPlayer.playAll();
                localAnimPlayer.forceUpdate(0);
        //            saveTexture();
                delayedEvent.reset(0.001);


                script.loading.enabled = false;
                script.staticBitmojiImage.enabled = false;
                rootObj.destroy();
                Editor.context.postMessage({"event_type" : "remove", "name" : value.name});
            }
        })
    }
})

function sendEncodedTexture() {
    try{
        Editor.context.postMessage({
            "event_type" : "transition_texture",
            "id" : encodedTextureId,
            "encoded_texture": curEncodedTexture
        });
    }catch(e) {

    }
}

function saveTexture() {
    Base64.encodeTextureAsync(script.cropTexture, (encodedTexture) => {
            curEncodedTexture = encodedTexture;
            if (needToSendEncodedTexture) {
                needToSendEncodedTexture = false;
                sendEncodedTexture();
                encodedTextureId = -1;
            }
        }, () => {

        },
        CompressionQuality.MaximumQuality,
        EncodingType.Png);
}

function getTransitionTexture() {
    if (curEncodedTexture) {
        sendEncodedTexture();
    }
    else {
        needToSendEncodedTexture = true;
    }
}

function findObjectInLensCore(sceneObjectToFind) {
    if (!sceneObjectToFind) {
        // print("You get what you give");
        return null;
    }
    const pathToObject = [sceneObjectToFind];
    while (sceneObjectToFind.getParent()) {
        sceneObjectToFind = sceneObjectToFind.getParent();
        pathToObject.push(sceneObjectToFind);
    }
    sceneObjectToFind = pathToObject.pop();
    const rootObjectsCount = global.scene.getRootObjectsCount();
    let root;
    for (let i = 0; i < rootObjectsCount; i++) {
        const sceneObject = global.scene.getRootObject(i);
        const uuid = Editor.Engine.idFromUniqueIdentifier(sceneObject.uniqueIdentifier).toString();
        if (sceneObjectToFind.id.toString() === uuid) {
            root = sceneObject;
        }
    }
    if (!root) {
        // print("Couldn't find object in Lens scene");
        return null;
    }
    while (pathToObject.length) {
        sceneObjectToFind = pathToObject.pop();
        let newRoot = null;
        root.children.forEach((sceneObject) => {
            const uuid = Editor.Engine.idFromUniqueIdentifier(sceneObject.uniqueIdentifier).toString();
            if (sceneObjectToFind.id.toString() === uuid) {
                newRoot = sceneObject;
            }
        });
        if (!root) {
            // print("Couldn't find object in Lens scene");
            return null;
        }
        root = newRoot;
    }
    return root;
}

var sDelayedEvent = script.createEvent("DelayedCallbackEvent");
sDelayedEvent.bind(function() {
    try {
        Editor.context.postMessage({"event_type" : "start"});
    }
    catch (e) {
        sDelayedEvent.reset(0);
    }
})

script.createEvent("OnStartEvent").bind(function() {
    sDelayedEvent.reset(0);
//    if (!)

})
