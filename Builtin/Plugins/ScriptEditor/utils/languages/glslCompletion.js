/**
 * CustomCodeNodeAsset GLSL completion provider for .customCode files
 */

import {
    glslBuiltInFunctions,
    glslTextureFunctions,
    glslUtilityFunctions,
    glslGetterFunctions,
    glslVFXGetterFunctions,
    glslVFXSetterFunctions,
    glslVFXVertexOutputFunctions,
    glslVFXPixelOutputFunctions,
    glslKeywords
} from './glsl.js';

/**
 * Extract user-defined identifiers from the document
 * @param {string} documentText - The full text of the document
 * @returns {Array} Array of identifier objects with name, kind, insertText, and documentation
 */
function extractUserIdentifiers(documentText) {
    const identifiers = new Map(); // Use Map to avoid duplicates
    
    // Remove comments to avoid false matches
    const textWithoutComments = documentText
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
        .replace(/\/\/.*/g, ''); // Remove line comments
    
    // Match function declarations: type identifier(...)
    // Examples: int foo(), vec3 calculateNormal(), void process()
    const functionRegex = /\b(?:void|int|uint|float|bool|vec2|vec3|vec4|bvec2|bvec3|bvec4|ivec2|ivec3|ivec4|uvec2|uvec3|uvec4|mat2|mat3|mat4|[a-zA-Z_]\w*)\s+([a-zA-Z_]\w*)\s*\(/g;
    let match;
    while ((match = functionRegex.exec(textWithoutComments)) !== null) {
        const funcName = match[1];
        // Skip built-in keywords and known functions
        if (!glslKeywords.includes(funcName) && 
            !glslBuiltInFunctions.includes(funcName) &&
            !glslUtilityFunctions.includes(funcName)) {
            identifiers.set(funcName, {
                name: funcName,
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: `${funcName}($0)`,
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'User-defined function'
            });
        }
    }
    
    // Match variable declarations: type identifier [= value];
    // Examples: int someNumber = 2; float myValue; vec3 position;
    const variableRegex = /\b(?:const\s+)?(?:int|uint|float|bool|vec2|vec3|vec4|bvec2|bvec3|bvec4|ivec2|ivec3|ivec4|uvec2|uvec3|uvec4|mat2|mat3|mat4|color|input_\w+|output_\w+|global_\w+)\s+([a-zA-Z_]\w*)(?:\s*=|\s*;|\s*,)/g;
    while ((match = variableRegex.exec(textWithoutComments)) !== null) {
        const varName = match[1];
        if (!glslKeywords.includes(varName) && !identifiers.has(varName)) {
            identifiers.set(varName, {
                name: varName,
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: varName,
                documentation: 'User-defined variable'
            });
        }
    }
    
    // Match struct definitions: struct identifier {
    const structRegex = /\bstruct\s+([a-zA-Z_]\w*)\s*\{/g;
    while ((match = structRegex.exec(textWithoutComments)) !== null) {
        const structName = match[1];
        if (!identifiers.has(structName)) {
            identifiers.set(structName, {
                name: structName,
                kind: monaco.languages.CompletionItemKind.Struct,
                insertText: structName,
                documentation: 'User-defined struct'
            });
        }
    }
    
    return Array.from(identifiers.values());
}

export function initializeGlslCompletionProvider(monaco) {
    monaco.languages.registerCompletionItemProvider('CustomCodeNodeGlsl', {
        triggerCharacters: ['.'],
        provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
            };

            // Get text before cursor to check for prefixes
            const lineContent = model.getLineContent(position.lineNumber);
            const textBeforeCursor = lineContent.substring(0, position.column - 1);
            
            // Check if we're after a prefix (e.g., "system.")
            // Match any identifier followed by a dot before the current word
            const prefixMatch = textBeforeCursor.match(/(\w+)\.(\w*)$/);
            const hasDotWithoutIdentifier = !prefixMatch && /\.(\w*)$/.test(textBeforeCursor);
            const isAfterPrefix = prefixMatch !== null || hasDotWithoutIdentifier;
            const prefixIdentifier = prefixMatch ? prefixMatch[1] : null;
            
            const suggestions = [];

            // If we're after "system.", only show system getter functions
            if (prefixIdentifier === 'system') {
                glslGetterFunctions.forEach(func => {
                    suggestions.push({
                        label: func,
                        kind: monaco.languages.CompletionItemKind.Method,
                        insertText: `${func}($0)`,
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: `System getter function`,
                        range: range
                    });
                });

                // Add VFX particle getter functions
                // TODO: Should only be shown for VFX Graphs
                glslVFXGetterFunctions.forEach(func => {
                    suggestions.push({
                        label: func,
                        kind: monaco.languages.CompletionItemKind.Method,
                        insertText: `${func}($0)`,
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: `VFX particle getter function`,
                        range: range
                    });
                });                   

                // Add VFX particle setter functions
                // TODO: Should only be shown for Spawn or Update Nodes
                glslVFXSetterFunctions.forEach(func => {
                    suggestions.push({
                        label: func,
                        kind: monaco.languages.CompletionItemKind.Method,
                        insertText: `${func}($0)`,
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: `VFX particle setter function`,
                        range: range
                    });
                });

                // Add VFX vertex output functions
                // TODO: Should only be shown for Update Nodes
                glslVFXVertexOutputFunctions.forEach(func => {
                    suggestions.push({
                        label: func,
                        kind: monaco.languages.CompletionItemKind.Method,
                        insertText: `${func}($0)`,
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: `VFX vertex output function`,
                        range: range
                    });
                });                

                // Add VFX pixel output functions
                // TODO: Should only be shown IsVFXOutputPixel
                glslVFXPixelOutputFunctions.forEach(func => {
                    suggestions.push({
                        label: func,
                        kind: monaco.languages.CompletionItemKind.Method,
                        insertText: `${func}($0)`,
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: `VFX pixel output function`,
                        range: range
                    });
                });                

                return { suggestions };
            }

            // If we're after any other prefix, don't show free function completions
            if (isAfterPrefix) {
                return { suggestions };
            }

            // Otherwise, show general completions (keywords, types, standalone functions)
            
            // Extract user-defined identifiers from the document
            const documentText = model.getValue();
            const userIdentifiers = extractUserIdentifiers(documentText);
            
            // Add user-defined identifiers as completions
            userIdentifiers.forEach(identifier => {
                suggestions.push({
                    label: identifier.name,
                    kind: identifier.kind,
                    insertText: identifier.insertText,
                    insertTextRules: identifier.insertTextRules,
                    documentation: identifier.documentation,
                    range: range
                });
            });
            
            // Add "system" namespace suggestion
            suggestions.push({
                label: 'system',
                kind: monaco.languages.CompletionItemKind.Module,
                insertText: 'system.',
                documentation: 'System namespace - provides access to surface, camera, matrix, and lighting functions',
                command: { id: 'editor.action.triggerSuggest' },
                range: range
            });

            glslKeywords.forEach(type => {
                suggestions.push({
                    label: type,
                    kind: monaco.languages.CompletionItemKind.TypeParameter,
                    insertText: type,
                    documentation: `Language Keyword Or Type`,
                    range: range
                });
            });

            // Add standard GLSL built-in functions
            glslBuiltInFunctions.forEach(func => {
                suggestions.push({
                    label: func,
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: `${func}($0)`,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: `Standard GLSL function`,
                    range: range
                });
            });

            // Add utility functions (standalone, not after a prefix)
            glslUtilityFunctions.forEach(func => {
                suggestions.push({
                    label: func,
                    kind: monaco.languages.CompletionItemKind.Function,
                    insertText: `${func}($0)`,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: `Utility function`,
                    range: range
                });
            });

            glslTextureFunctions.forEach(func => {
                suggestions.push({
                    label: func,
                    kind: monaco.languages.CompletionItemKind.Method,
                    insertText: `${func}($0)`,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    documentation: `Texture sampling function`,
                    range: range
                });
            });            

            return { suggestions };
        }
    });

    // Register hover provider for documentation
    monaco.languages.registerHoverProvider('glsl', {
        provideHover: (model, position) => {
            const word = model.getWordAtPosition(position);
            if (!word) return null;

            const functionDocs = {
                // Standard GLSL functions
                'normalize': 'Returns a vector with the same direction as the input but with length 1.\n\nvec normalize(vec v)',
                'dot': 'Returns the dot product of two vectors.\n\nfloat dot(vec x, vec y)',
                'cross': 'Returns the cross product of two 3D vectors.\n\nvec3 cross(vec3 x, vec3 y)',
                'mix': 'Performs linear interpolation between two values.\n\ngenType mix(genType x, genType y, float a)',
                'clamp': 'Constrains a value to lie between two further values.\n\ngenType clamp(genType x, genType minVal, genType maxVal)',
                'smoothstep': 'Performs smooth Hermite interpolation.\n\ngenType smoothstep(genType edge0, genType edge1, genType x)',
                'length': 'Returns the length of a vector.\n\nfloat length(vec v)',
                'distance': 'Returns the distance between two points.\n\nfloat distance(vec p0, vec p1)',
                'reflect': 'Reflects a vector across a normal.\n\nvec reflect(vec I, vec N)',
                'pow': 'Returns x raised to the power of y.\n\ngenType pow(genType x, genType y)',
                'sin': 'Returns the sine of x.\n\ngenType sin(genType x)',
                'cos': 'Returns the cosine of x.\n\ngenType cos(genType x)',
                'sqrt': 'Returns the square root of x.\n\ngenType sqrt(genType x)',
                'abs': 'Returns the absolute value of x.\n\ngenType abs(genType x)',
                'floor': 'Returns the largest integer less than or equal to x.\n\ngenType floor(genType x)',
                'ceil': 'Returns the smallest integer greater than or equal to x.\n\ngenType ceil(genType x)',
                'fract': 'Returns the fractional part of x.\n\ngenType fract(genType x)',
                'mod': 'Returns x modulo y.\n\ngenType mod(genType x, genType y)',
                'min': 'Returns the minimum of x and y.\n\ngenType min(genType x, genType y)',
                'max': 'Returns the maximum of x and y.\n\ngenType max(genType x, genType y)',
                'step': 'Returns 0.0 if x < edge, else 1.0.\n\ngenType step(genType edge, genType x)',
                
                // Texture functions
                'sample': 'Samples a texture at the given coordinates.\n\nvec4 sample(texture, vec2 coord)',
                'sampleLod': 'Samples a texture at a specific mip level.\n\nvec4 sampleLod(texture, vec2 coord, float lod)',
                
                // Surface getters
                'getSurfacePosition': 'Returns the surface position in clip space.\n\nvec4 getSurfacePosition()',
                'getSurfaceNormal': 'Returns the surface normal in clip space.\n\nvec3 getSurfaceNormal()',
                'getSurfacePositionWorldSpace': 'Returns the surface position in world space.\n\nvec3 getSurfacePositionWorldSpace()',
                'getSurfaceNormalWorldSpace': 'Returns the surface normal in world space.\n\nvec3 getSurfaceNormalWorldSpace()',
                'getSurfaceUVCoord0': 'Returns the primary UV coordinates.\n\nvec2 getSurfaceUVCoord0()',
                
                // Camera getters
                'getCameraPosition': 'Returns the camera position in world space.\n\nvec3 getCameraPosition()',
                'getCameraForward': 'Returns the camera forward direction.\n\nvec3 getCameraForward()',
                'getViewVector': 'Returns the view direction vector.\n\nvec3 getViewVector()',
                
                // Matrix getters
                'getMatrixWorld': 'Returns the world transformation matrix.\n\nmat4 getMatrixWorld()',
                'getMatrixView': 'Returns the view matrix.\n\nmat4 getMatrixView()',
                'getMatrixProjection': 'Returns the projection matrix.\n\nmat4 getMatrixProjection()',
                
                // Time getters
                'getTimeElapsed': 'Returns the total elapsed time in seconds.\n\nfloat getTimeElapsed()',
                'getTimeDelta': 'Returns the time since last frame in seconds.\n\nfloat getTimeDelta()',
                
                // Utility functions
                'pi': 'Returns the value of PI.\n\nfloat pi()',
                'linearToSrgb': 'Converts a linear color to sRGB color space.\n\nvec3 linearToSrgb(vec3 color)',
                'srgbToLinear': 'Converts an sRGB color to linear color space.\n\nvec3 srgbToLinear(vec3 color)',
                'remap': 'Remaps a value from one range to another.\n\nfloat remap(float value, float inMin, float inMax, float outMin, float outMax)',
            };

            if (functionDocs[word.word]) {
                return {
                    range: new monaco.Range(
                        position.lineNumber,
                        word.startColumn,
                        position.lineNumber,
                        word.endColumn
                    ),
                    contents: [
                        { value: `**${word.word}**` },
                        { value: functionDocs[word.word] }
                    ]
                };
            }

            return null;
        }
    });
}

