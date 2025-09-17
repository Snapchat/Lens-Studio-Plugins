//@input Component.ScriptComponent bitmoji3dComponent
//@input Component.AnimationPlayer animationPlayer
//@input Asset.AnimationAsset animationAsset
//@input Asset.AnimationAsset heavyAnimationAsset

script.createEvent("OnStartEvent").bind(function() {
    script.bitmoji3dComponent.onDownloaded.add(function() {
        var extras = JSON.parse(script.bitmoji3dComponent.getExtras());
        if (extras.animationBodyType == "heavy") {
            script.animationPlayer.clips[0].animation = script.heavyAnimationAsset;
        }
    })
})
