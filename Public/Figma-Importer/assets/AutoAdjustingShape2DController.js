//@ts-check
//@input bool updateEveryFrame = true

////// declare all the variables

//type: ScreenTransform
script.scrnTrnfm = null;
//type: Image
script.imgComp = null;
//type: Material
script.mat = null;
//the main pass of the 2D Shapes Shader material
script.mainPass = null;
//type: number
script.scrnTrnfmWidth = 0;
//type: number
script.scrnTrnfmHeight = 0;
//type: number
script.scrnTrnfmAspectRatio = 0;


script.testPrint = (str) => {
    print("from lens scripting : " + str);
}

function onAwake() {
    script.scrnTrnfm = script.getSceneObject().getComponent('ScreenTransform');
    const imageComponents = script.getSceneObject().getComponents('Component.Image');

    if (!script.scrnTrnfm || imageComponents.length === 0) {
        throw new Error('In order for the AutoAdjustingShape2DController to work, the SceneObject must have a ScreenTransform and an Image component');
    }

    //heuristic to find the 2D Shapes Shader
    outerLoop: for (const imgComp of imageComponents) {
        for (const mat of imgComp.materials) {
            for (let i = 0; i < mat.getPassCount(); i++) {
                const pass = mat.getPass(i);
                if (pass.name.includes('2D Shapes Shader')) {
                    print('2D Shapes Shader found');
                    script.imgComp = imgComp;
                    script.mat = mat;
                    script.mainPass = pass;
                    break outerLoop;
                }
            }
        }
    }

    if (!script.mainPass) {
        throw new Error('The 2D Shapes Shader is not found any of the materials of the Image component. Make sure the Image component has a material with 2D Shapes Shader.');
    }

    script.createEvent('UpdateEvent').bind(onUpdate);

    initialShaderSetup();

    //do it once at the beginning
    autoAdjustShapeDim();
}

function onUpdate() {
    //get dimensions of the screen transform
    //we have to assume the unit is points or pixel
    if (script.updateEveryFrame) {
        autoAdjustShapeDim();
    }
}

function rangeCheck(input, min = 0, max = 1) {
    const withinRange = input >= min && input <= max;
    if (!withinRange) {
        //clamp
        print(`The input value ${input} is out of range. It will be clamped to the range [${min}, ${max}]`);
        return Math.max(min, Math.min(max, input));
    } else {
        return input;
    }
}

function typeCheck(input, type) {
    switch (type) {
        case 'int':
            return Number.isInteger(input);
        case 'float':
            return typeof input === 'number';
        case 'vec2':
            return input instanceof vec2;
        case 'vec3':
            return input instanceof vec3;
        case 'vec4':
            return input instanceof vec4;
        case 'bool':
            return typeof input === 'boolean';
        default:
            return false;
    }
}

//API
script.setStrokeWeight = (value) => {
    if (!typeCheck(value, 'float')) {
        print(`The input value ${value} is not a float, set stroke weight aborted`);
        return;
    }
    value = rangeCheck(value);

    script.mainPass['strokeThickness'] = value;
};

script.useStroke = (value) => {
    if (!typeCheck(value, 'bool')) {
        print(`The input value ${value} is not a boolean, set use stroke aborted`);
        return;
    }
    script.mainPass['Stroke'] = value;
};

script.setStrokeColor = (value) => {
    if (!typeCheck(value, 'vec4')) {
        print(`The input value ${value} is not a vec4, set stroke color aborted`);
        return;
    }

    script.mainPass['strokeColor'] = value;
};

script.setFillColor = (value) => {
    if (!typeCheck(value, 'vec3')) {
        print(`The input value ${value} is not a vec4, set fill color aborted`);
        return;
    }

    script.mainPass['shapeColor'] = value;
};

script.setRoundness = (roundness) => {
    if (!typeCheck(roundness, 'float')) {
        print(`The input value ${roundness} is not a float, set roundness aborted`);
        return;
    }
    roundness = rangeCheck(roundness);

    script.mainPass['shapeRoundness'] = roundness;
};

script.setShapeAlpha = (alpha) => {
    if (!typeCheck(alpha, 'float')) {
        print(`The input value ${alpha} is not a float, set shape alpha aborted`);
        return;
    }
    alpha = rangeCheck(alpha);

    script.mainPass['shapeAlpha'] = alpha;
};

script.setStrokeAlpha = (alpha) => {
    if (!typeCheck(alpha, 'float')) {
        print(`The input value ${alpha} is not a float, set stroke alpha aborted`);
        return;
    }
    alpha = rangeCheck(alpha);

    script.mainPass['strokeAlpha'] = alpha;
};

script.setProperty = (name, value) => {
    script.mainPass[name] = value;
}

/**
 * @private
 */
function initialShaderSetup() {
    //print all the properties of the main pass

    script.mainPass['shapeColorInvert'] = true;
}

//Private
/**
 * @private
 */
function autoAdjustShapeDim() {
    //TODO: here we have to assume the canvas unit type is either point or pixel. but in the future we need to check
    const worldSpaceSize = getWorldSpaceSize(script.scrnTrnfm);
    script.scrnTrnfmWidth = worldSpaceSize.x;
    script.scrnTrnfmHeight = worldSpaceSize.y;
    script.scrnTrnfmAspectRatio = worldSpaceSize.x / worldSpaceSize.y;

    script.mainPass['shapeColorInvert'] = true
    setShape();
}

/**
 * @private
 */
function setShape() {
    const isWidthGreater = script.scrnTrnfmAspectRatio > 1;
    script.mainPass['shapeWidthX'] = isWidthGreater ? 1 : script.scrnTrnfmAspectRatio;
    script.mainPass['shapeHeightY'] = isWidthGreater ? 1 / script.scrnTrnfmAspectRatio : 1;
}

/**
 * @static
 * @private
 */
function getWorldSpaceSize(st) {
    const center = st.localPointToWorldPoint(vec2.zero());
    const right = st.localPointToWorldPoint(vec2.right());
    const top = st.localPointToWorldPoint(vec2.up());
    return new vec2(center.distance(right) * 2, center.distance(top) * 2);
}

onAwake();
