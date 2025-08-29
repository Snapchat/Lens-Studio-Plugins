//@input SceneObject parent

let bitmojiJoints;

function init() {
    bitmojiJoints = buildJointMap({}, script.parent);
    remap()
    addScaleCompensation()
}

const mixamoBitmojiMap = {
    'ROOT': 'Hips',
    'C_spine0001_bind_JNT': 'Spine',
    'C_spine0003_bind_JNT': 'Spine1',
    'C_neck0001_bind_JNT': 'Neck',
    'C_head_bind_JNT': 'Head',
    'R_clavicle_bind_JNT': 'RightShoulder',
    'R_armUpper0001_bind_JNT': 'RightArm',
    'R_armLower0001_bind_JNT': 'RightForeArm',
    'R_hand0001_bind_JNT': 'RightHand',
    'L_clavicle_bind_JNT': 'LeftShoulder',
    'L_armUpper0001_bind_JNT': 'LeftArm',
    'L_armLower0001_bind_JNT': 'LeftForeArm',
    'L_hand0001_bind_JNT': 'LeftHand',
    'L_legUpper0001_bind_JNT': 'LeftUpLeg',
    'L_legLower0001_bind_JNT': 'LeftLeg',
    'L_foot0001_bind_JNT': 'LeftFoot',
    'L_foot0002_bind_JNT': 'LeftToeBase',
    'R_legUpper0001_bind_JNT': 'RightUpLeg',
    'R_legLower0001_bind_JNT': 'RightLeg',
    'R_foot0001_bind_JNT': 'RightFoot',
    'R_foot0002_bind_JNT': 'RightToeBase',
}

/**
 * creates a map of child names -> child scene object
 * @param {object} m
 * @param {SceneObject} root
 * @returns
 */
function buildJointMap(m, root) {
    for (let i = 0; i < root.getChildrenCount(); i++) {
        let child = root.getChild(i);

        m[child.name] = child;
        buildJointMap(m, child)
    }
    return m;
}

/**
 * Rename joints names to mixamo joint names
 */
function remap() {
    for (let joint in bitmojiJoints) {
        if (mixamoBitmojiMap[joint]) {
            bitmojiJoints[joint].name = mixamoBitmojiMap[joint];
        }
    }
}

/**
 * Update Root/Hips Local Scale on the first frame
 */
function addScaleCompensation() {
    let bmRoot = bitmojiJoints["ROOT"];
    // create new scen eobject
    let so = global.scene.createSceneObject("Hips_SSC_Mixamo");
    so.setParent(bmRoot.getParent())
    //scale object down and scale hip up a 100
    so.getTransform().setLocalScale(vec3.one().uniformScale(0.01))
    let scale = bmRoot.getTransform().getLocalScale();
    bmRoot.getTransform().setLocalScale(scale.uniformScale(100));
    // set a parent - now hip position keys should be correct
    bmRoot.setParent(so);
}

init();
