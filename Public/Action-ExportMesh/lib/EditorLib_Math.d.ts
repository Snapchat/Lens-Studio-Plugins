/*!
 * Additional type definitions that are missing from EditorLib.d.ts
 */

/**
* A 2x2 matrix.

* {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat2/mat2-description.md Edit}
*/
declare class mat2 {
    /**
    * Creates a new mat2, defaulting to identity values.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat2/methods/mat2-mat2.md Edit}
    */
    constructor()
    
    /**
    * Returns the result of adding the two matrices together.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat2/methods/mat2-add.md Edit}
    */
    add(mat: mat2): mat2
    
    /**
    * Returns the determinant of the matrix.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat2/methods/mat2-determinant.md Edit}
    */
    determinant(): number
    
    /**
    * Returns the result of dividing the two matrices.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat2/methods/mat2-div.md Edit}
    */
    div(mat: mat2): mat2
    
    /**
    * Returns whether the two matrices are equal.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat2/methods/mat2-equal.md Edit}
    */
    equal(mat: mat2): boolean
    
    /**
    * Returns the inverse of the matrix.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat2/methods/mat2-inverse.md Edit}
    */
    inverse(): mat2
    
    /**
    * Returns the result of multiplying the two matrices.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat2/methods/mat2-mult.md Edit}
    */
    mult(mat: mat2): mat2
    
    /**
    * Returns the result of scalar multiplying the matrix.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat2/methods/mat2-multiplyScalar.md Edit}
    */
    multiplyScalar(scalar: number): mat2
    
    /**
    * Returns the result of subtracting the two matrices.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat2/methods/mat2-sub.md Edit}
    */
    sub(mat: mat2): mat2
    
    /**
    * Returns a string representation of the matrix.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat2/methods/mat2-toString.md Edit}
    */
    toString(): string
    
    /**
    * Returns the transpose of this matrix.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat2/methods/mat2-transpose.md Edit}
    */
    transpose(): mat2
    
    /**
    * The first column of the matrix.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat2/properties/mat2-column0.md Edit}
    */
    column0: vec2
    
    /**
    * The second column of the matrix.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat2/properties/mat2-column1.md Edit}
    */
    column1: vec2
    
    /**
    * Returns a string representation of the matrix.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat2/properties/mat2-description.md Edit}
    */
    description: string
    
}
declare namespace mat2 {
    /**
    * Returns the identity matrix.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat2/methods/mat2-identity.md Edit}
    */
    export function identity(): mat2
    
    /**
    * Returns a matrix with all zero values.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat2/methods/mat2-zero.md Edit}
    */
    export function zero(): mat2
    

}

/**
* A 4x4 matrix.

* {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/mat4-description.md Edit}
*/
declare class mat4 {
    /**
    * Creates a new mat4, defaulting to identity values.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-mat4.md Edit}
    */
    constructor()
    
    /**
    * Returns the result of adding the two matrices together.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-add.md Edit}
    */
    add(mat: mat4): mat4
    
    /**
    * Returns the determinant of the matrix.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-determinant.md Edit}
    */
    determinant(): number
    
    /**
    * Returns the result of dividing the two matrices.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-div.md Edit}
    */
    div(mat: mat4): mat4
    
    /**
    * Returns whether the two matrices are equal.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-equal.md Edit}
    */
    equal(mat: mat4): boolean
    
    /**
    * Returns an euler angle representation of this matrix's rotation, in radians.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-extractEulerAngles.md Edit}
    */
    extractEulerAngles(): vec3
    
    /**
    * Returns an euler angle representation of this matrix's rotation, in radians.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-extractEulerXYZ.md Edit}
    
    * @deprecated
    */
    extractEulerXYZ(): vec3
    
    /**
    * Returns the inverse of the matrix.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-inverse.md Edit}
    */
    inverse(): mat4
    
    /**
    * Returns the result of multiplying the two matrices.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-mult.md Edit}
    */
    mult(mat: mat4): mat4
    
    /**
    * Returns the direction vector multiplied by this matrix.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-multiplyDirection.md Edit}
    */
    multiplyDirection(direction: vec3): vec3
    
    /**
    * Returns the point `point` multiplied by this matrix.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-multiplyPoint.md Edit}
    */
    multiplyPoint(point: vec3): vec3
    
    /**
    * Returns the result of scalar multiplying the matrix.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-multiplyScalar.md Edit}
    */
    multiplyScalar(scalar: number): mat4
    
    /**
    * Returns the vector multiplied by this matrix.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-multiplyVector.md Edit}
    */
    multiplyVector(vector: vec4): vec4
    
    /**
    * Returns the result of subtracting the two matrices.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-sub.md Edit}
    */
    sub(mat: mat4): mat4
    
    /**
    * Returns a string representation of the matrix.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-toString.md Edit}
    */
    toString(): string
    
    /**
    * Returns the transpose of this matrix.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-transpose.md Edit}
    */
    transpose(): mat4
    
    /**
    * The first column of the matrix.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/properties/mat4-column0.md Edit}
    */
    column0: vec4
    
    /**
    * The second column of the matrix.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/properties/mat4-column1.md Edit}
    */
    column1: vec4
    
    /**
    * The third column of the matrix.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/properties/mat4-column2.md Edit}
    */
    column2: vec4
    
    /**
    * The fourth column of the matrix.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/properties/mat4-column3.md Edit}
    */
    column3: vec4
    
    /**
    * Returns a string representation of the matrix.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/properties/mat4-description.md Edit}
    */
    description: string
    
}
declare namespace mat4 {
    /**
    * Returns the two matrices multiplied component-wise.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-compMult.md Edit}
    */
    export function compMult(arg1: mat4, arg2: mat4): mat4
    
    /**
    * Returns a new matrix with translation `translation`, rotation `rotation`, and scale `scale`.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-compose.md Edit}
    */
    export function compose(translation: vec3, rotation: quat, scale: vec3): mat4
    
    /**
    * Create a 4x4 matrix from four column vectors.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-fromColumns.md Edit}
    */
    export function fromColumns(column0: vec4, column1: vec4, column2: vec4, column3: vec4): mat4
    
    /**
    * Returns a new matrix with the specified euler angles (in radians).
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-fromEulerAngles.md Edit}
    */
    export function fromEulerAngles(euler: vec3): mat4
    
    /**
    * Returns a new matrix with euler angles `euler` (in radians).
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-fromEulerAnglesYXZ.md Edit}
    
    * @deprecated
    */
    export function fromEulerAnglesYXZ(euler: vec3): mat4
    
    /**
    * Returns a new matrix with x euler angle `xAngle` (in radians).
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-fromEulerX.md Edit}
    */
    export function fromEulerX(xAngle: number): mat4
    
    /**
    * Returns a new matrix with y euler angle `yAngle` (in radians).
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-fromEulerY.md Edit}
    */
    export function fromEulerY(yAngle: number): mat4
    
    /**
    * Returns a new matrix with z euler angle `zAngle` (in radians).
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-fromEulerZ.md Edit}
    */
    export function fromEulerZ(zAngle: number): mat4
    
    /**
    * Returns a new matrix with rotation `rotation`.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-fromRotation.md Edit}
    */
    export function fromRotation(rotation: quat): mat4
    
    /**
    * Create a 4x4 matrix from four row vectors.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-fromRows.md Edit}
    */
    export function fromRows(row0: vec4, row1: vec4, row2: vec4, row3: vec4): mat4
    
    /**
    * Returns a new matrix with scale `scale`.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-fromScale.md Edit}
    */
    export function fromScale(scale: vec3): mat4
    
    /**
    * Returns a new matrix with the translation `translation`.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-fromTranslation.md Edit}
    */
    export function fromTranslation(translation: vec3): mat4
    
    /**
    * Returns a new matrix with the yaw, pitch, and roll radians found in `yawPitchRoll`.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-fromYawPitchRoll.md Edit}
    
    * @deprecated
    */
    export function fromYawPitchRoll(yawPitchRoll: vec3): mat4
    
    /**
    * Returns the identity matrix.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-identity.md Edit}
    */
    export function identity(): mat4
    
    /**
    * Returns a new matrix generated using the provided arguments.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-lookAt.md Edit}
    */
    export function lookAt(eye: vec3, center: vec3, up: vec3): mat4
    
    /**
    * Returns a new matrix using the provided vectors.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-makeBasis.md Edit}
    */
    export function makeBasis(x: vec3, y: vec3, z: vec3): mat4
    
    /**
    * Returns a new matrix generated using the provided arguments.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-orthographic.md Edit}
    */
    export function orthographic(left: number, right: number, bottom: number, top: number, zNear: number, zFar: number): mat4
    
    /**
    * Returns the outer product of the two matrices.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-outerProduct.md Edit}
    */
    export function outerProduct(arg1: vec4, arg2: vec4): mat4
    
    /**
    * Returns a new matrix generated using the provided arguments.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-perspective.md Edit}
    */
    export function perspective(fovY: number, aspect: number, zNear: number, zFar: number): mat4
    
    /**
    * Returns a matrix with all zero values.
    
    * {@link https://github.sc-corp.net/Snapchat/studio3d-documentation/edit/main/api_generation/./api_scenarium/input/api_text_descriptions/mat4/methods/mat4-zero.md Edit}
    */
    export function zero(): mat4
    

}
