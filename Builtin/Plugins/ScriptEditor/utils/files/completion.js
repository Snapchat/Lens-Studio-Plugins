let dynamicTypeMap = {};
let fileManagerRef = null;

export function setCompletionData(data) {
    dynamicTypeMap = {...data.typeMap};
}

export function updateCompletionData(typeMap) {
    if (typeMap) {
        dynamicTypeMap = {...dynamicTypeMap, ...typeMap};
    }
}

/**
 * Parses @input declarations
 * @param scriptContent
 * @returns {Array}
 */
export function parseInputs(scriptContent) {
    const inputs = [];
    const lines = scriptContent.split('\n');
    // Regex to capture: 1=type, 2=name
    const inputRegex = /^\s*\/\/\s*@input\s+([\w.]+(?:\[\])?)\s+([\w.]+)/;

    lines.forEach((line, index) => {
        const match = line.match(inputRegex);
        if (match) {
            inputs.push({
                type: match[1],
                name: match[2],
                lineNumber: index + 1,
                fullLine: match[0],
            });
        }
    });
    return inputs;
}

export function initializeCompletionProvider(monaco, fileManager) {
    fileManagerRef = fileManager;

    function getTypeSuggestions(model) {
        const topLevel = new Set();
        const otherTypes = [];
        Object.keys(dynamicTypeMap).forEach(k => {
            if (k.includes('.')) {
                topLevel.add(k.split('.')[0]);
            } else {
                otherTypes.push(k);
            }
        });

        const modelContent = model.getValue();
        const typedefs = parseTypedefs(modelContent);
        const customTypes = Object.keys(typedefs);

        // Filter out custom types that are already in dynamicTypeMap to avoid duplicates
        const newCustomTypes = customTypes.filter(typeName => !dynamicTypeMap.hasOwnProperty(typeName));

        const customTypeSuggestions = newCustomTypes.map(t => ({
            label: t,
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: t
        }));

        const namespaceSuggestions = Array.from(topLevel).map(ns => ({
            label: ns,
            kind: monaco.languages.CompletionItemKind.Module,
            insertText: `${ns}.`,
            command: { id: 'editor.action.triggerSuggest' }
        }));

        const primitiveSuggestions = otherTypes.map(p => ({
            label: p,
            kind: monaco.languages.CompletionItemKind.Interface,
            insertText: p
        }));

        return [...namespaceSuggestions, ...primitiveSuggestions, ...customTypeSuggestions];
    }

    const decorativeWidgets = {
        "label": {description: "Draws a line of text for titles or descriptions."},
        "separator": {description: "Draws a horizontal line to separate content."},
        "group_start": {description: "Starts a collapsible group.", props: ["label"]},
        "group_end": {description: "Ends a collapsible group."}
    };

    monaco.languages.registerCompletionItemProvider(['javascript', 'typescript'], {
        triggerCharacters: ['/', '.', ' ', '(', '"', '{', ',', '@'],

        provideCompletionItems: (model, position) => {
            const lineContent = model.getLineContent(position.lineNumber);
            const textBeforeCursor = lineContent.substring(0, position.column);

            const decoratorMatch = textBeforeCursor.match(/^\s*\/\/\s*(@[a-zA-Z]*)$/);
            if (decoratorMatch) {
                const decoratorPrefix = decoratorMatch[1];
                const rangeToReplace = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: position.column - decoratorPrefix.length,
                    endColumn: position.column
                };
                const suggestions = [
                    { label: '@input', insertText: '@input ', command: { id: 'editor.action.triggerSuggest' } },
                    { label: '@ui', insertText: '@ui ', command: { id: 'editor.action.triggerSuggest' } }
                ];
                return {
                    suggestions: suggestions.map(s => ({
                        ...s, kind: monaco.languages.CompletionItemKind.Keyword, range: rangeToReplace
                    }))
                };
            }

            // After //@input
            const inputNamespaceMatch = textBeforeCursor.match(/^\s*\/\/\s*@input\s+([A-Z][a-zA-Z]+)\.$/);
            if (inputNamespaceMatch) {
                const namespace = inputNamespaceMatch[1];
                const children = Object.keys(dynamicTypeMap)
                    .filter(k => k.startsWith(namespace + ".") && k !== namespace)
                    .map(k => k.substring(namespace.length + 1));

                return {
                    suggestions: children.map(child => ({
                        label: child, kind: monaco.languages.CompletionItemKind.Class, insertText: `${child} `
                    }))
                };
            }

            // After @input
            const inputMatch = textBeforeCursor.match(/^\s*\/\/\s*@input\s+\w*$/);
            if (inputMatch) {
                const rawSuggestions = getTypeSuggestions(model);
                return {
                    // if type has child type we want to only insert '.'
                    suggestions: rawSuggestions.map(suggestion => {
                        const trimmedText = suggestion.insertText.trim();
                        const namespaces = ['Component', 'Asset', 'Physics'];
                        if (namespaces.includes(suggestion.label) && suggestion.kind === monaco.languages.CompletionItemKind.Module) {
                            return {
                                ...suggestion, insertText: trimmedText,
                            };
                        }
                        return {
                            ...suggestion, insertText: `${trimmedText} `,
                        };
                    }),
                };
            }

            const modelContent = model.getValue();
            const offset = model.getOffsetAt({ lineNumber: position.lineNumber, column: position.column });
            const before = modelContent.slice(0, offset);
            const openBlock = before.lastIndexOf('/*');
            const closeBlock = before.lastIndexOf('*/');
            const inBlockComment = openBlock !== -1 && openBlock > closeBlock;

            // checking we are in /* */
            if (inBlockComment) {
                const propertyNamespaceMatch = textBeforeCursor.match(/@property\s+\{([A-Z][a-zA-Z0-9_]+)\.$/);
                if (propertyNamespaceMatch) {
                    const namespace = propertyNamespaceMatch[1];
                    const children = Object.keys(dynamicTypeMap)
                        .filter(k => k.startsWith(namespace + ".") && k !== namespace)
                        .map(k => k.substring(namespace.length + 1));
                    return {
                        suggestions: children.map(child => ({
                            label: child,
                            kind: monaco.languages.CompletionItemKind.Class,
                            insertText: `${child}} `
                        }))
                    };
                }

                // After @property
                const propertyMatch = textBeforeCursor.match(/@property\s+(\{?[\w.]*)$/);
                if (propertyMatch) {
                    const partial = propertyMatch[1];

                    const rangeToReplace = {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: position.column - partial.length,
                        endColumn: position.column,
                    };

                    const rawSuggestions = getTypeSuggestions(model);

                    const suggestions = rawSuggestions.map(suggestion => {
                        const cleanInsertText = suggestion.insertText.trim();
                        const isNamespace = cleanInsertText.endsWith('.');

                        let insertText = isNamespace ? `{${cleanInsertText}` : `{${cleanInsertText}} `;

                        return {
                            ...suggestion,
                            label: `{${cleanInsertText}}`,
                            filterText: cleanInsertText,
                            insertText: insertText,
                            range: rangeToReplace
                        };
                    });
                    return { suggestions };
                }

                // After @
                const atWordMatch = textBeforeCursor.match(/@+\w*$/);
                if (atWordMatch) {
                    let range = {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: position.column - atWordMatch[0].length,
                        endColumn: position.column
                    };
                    const suggestions = [
                        { label: '@typedef', insertText: '@typedef ', kind: monaco.languages.CompletionItemKind.Keyword, range },
                        { label: '@property', insertText: '@property ', kind: monaco.languages.CompletionItemKind.Keyword, range, command: { id: 'editor.action.triggerSuggest' } },
                        { label: '@ui', insertText: '@ui ', kind: monaco.languages.CompletionItemKind.Keyword, range, command: { id: 'editor.action.triggerSuggest' } }
                    ];
                    return { suggestions };
                }
            }

            // After //@ui
            const uiMatch = textBeforeCursor.match(/^\s*\/\/\s*@ui\s+$/);
            if (uiMatch) {
                return {
                    suggestions: Object.keys(decorativeWidgets).map(w => ({
                        label: w,
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: `{"widget": "${w}"}`
                    }))
                };
            }

            return null;
        }
    });

    //Register provider for require("")
    monaco.languages.registerCompletionItemProvider(['javascript', 'typescript'], {
        triggerCharacters: ['.', '/'],

        provideCompletionItems: (model, position) => {
            const lineContent = model.getLineContent(position.lineNumber);
            const textBeforeCursor = lineContent.substring(0, position.column);

            const lastParen = textBeforeCursor.lastIndexOf('(');

            const lastSingleQuote = textBeforeCursor.lastIndexOf("'");
            const lastDoubleQuote = textBeforeCursor.lastIndexOf('"');
            const lastQuote = Math.max(lastSingleQuote, lastDoubleQuote);

            if (lastQuote > lastParen && textBeforeCursor.substring(0, lastParen + 1).includes('require(')) {
                const quoteChar = lastSingleQuote > lastDoubleQuote ? "'" : '"';
                const nextQuote = textBeforeCursor.indexOf(quoteChar, lastQuote + 1);

                if (nextQuote === -1 || nextQuote >= position.column -1) {
                    const currentUri = model.uri;
                    const allFiles = [...Array.from(fileManagerRef.openFiles.values()), ...Array.from(fileManagerRef.backgroundFiles.values())];
                    const allScriptFiles = allFiles.filter(f => f.filePath.endsWith('.js') || f.filePath.endsWith('.ts'));

                    const currentFilePath = currentUri.path.substring(1);
                    const currentFile = allScriptFiles.find(file => file.filePath === currentFilePath) ||
                        allScriptFiles.find(file => file.model === model);

                    const suggestions = allScriptFiles
                        .filter(file => file.filePath !== currentFilePath)
                        .map(file => {
                            const fromPath = currentFile ? currentFile.filePath : currentFilePath;
                            const toPath = file.filePath;

                            const relativePath = calculateRelativePath(fromPath, toPath);
                            const suggestionPath = relativePath.replace(/\\/g, '/').replace(/\.(js|ts)$/, '');

                            const rangeToReplace = {
                                startLineNumber: position.lineNumber,
                                endLineNumber: position.lineNumber,
                                startColumn: lastQuote + 2,
                                endColumn: position.column
                            };

                            return {
                                label: suggestionPath,
                                filterText: suggestionPath,
                                kind: monaco.languages.CompletionItemKind.Module,
                                insertText: suggestionPath,
                                range: rangeToReplace,
                                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                            };
                        });

                    return { suggestions };
                }
            }
            return null;
        }
    });

    // Register jump to definition for @input declarations
    monaco.languages.registerDefinitionProvider(['javascript', 'typescript'], {
        provideDefinition: (model, position, token) => {
            const wordInfo = model.getWordAtPosition(position);
            if (!wordInfo) return null;

            const lineContent = model.getLineContent(position.lineNumber);
            const scriptPropertyRegex = new RegExp(`\\bscript\.(${wordInfo.word})\\b`);

            if (!scriptPropertyRegex.test(lineContent)) return null;

            const variableName = wordInfo.word;
            const allInputs = parseInputs(model.getValue());
            const definition = allInputs.find(input => input.name === variableName);

            if (definition) {
                const definitionLine = model.getLineContent(definition.lineNumber);
                const variableIndex = definitionLine.indexOf(variableName, definitionLine.indexOf('@input'));
                return {
                    uri: model.uri,
                    range: {
                        startLineNumber: definition.lineNumber,
                        endLineNumber: definition.lineNumber,
                        startColumn: variableIndex + 1,
                        endColumn: variableIndex + 1 + variableName.length
                    }
                };
            }

            return null;
        }
    });
}

function calculateRelativePath(fromPath, toPath) {
    const fromParts = fromPath.split('/').filter(p => p);
    const toParts = toPath.split('/').filter(p => p);

    fromParts.pop();

    let commonPrefixLength = 0;
    while (commonPrefixLength < fromParts.length && commonPrefixLength < toParts.length && fromParts[commonPrefixLength] === toParts[commonPrefixLength]) {
        commonPrefixLength++;
    }

    const upLevels = fromParts.length - commonPrefixLength;
    const downParts = toParts.slice(commonPrefixLength);

    const relativePathParts = [];
    for (let i = 0; i < upLevels; i++) {
        relativePathParts.push('..');
    }

    const path = relativePathParts.concat(downParts).join('/');
    return (upLevels === 0 && !path.startsWith('./')) ? './' + path : path;
}

export function generateInputDeclarations(scriptContent, typeMap) {
    const typedefs = parseTypedefs(scriptContent);
    const inputs = parseInputs(scriptContent);

    if (inputs.length === 0) return '';

    const declarations = inputs.map(input => {
        const isArray = input.type.endsWith('[]');
        const baseType = isArray ? input.type.slice(0, -2).trim() : input.type;

        let mappedBaseType;
        if (typeMap && typeMap[baseType]) {
            // Ensure the mapped type is a string, not an object
            mappedBaseType = typeof typeMap[baseType] === 'string' ? typeMap[baseType] : baseType;
        } else if (typedefs[baseType]) {
            mappedBaseType = baseType; // Use the custom type name directly
        } else {
            mappedBaseType = 'any';
        }

        const finalTsType = isArray ? `${mappedBaseType}[]` : mappedBaseType;
        return `    ${input.name}: ${finalTsType};`;
    });

    return `\ndeclare interface ScriptComponent {\n${declarations.join('\n')}\n}`;
}

export function generateCustomTypeInterfaces(scriptContent) {
    const typedefs = parseTypedefs(scriptContent);
    let result = '';
    for (const [typeName, props] of Object.entries(typedefs)) {
        result += `interface ${typeName} {\n`;
        for (const prop of props) {
            result += `    ${prop.name}: ${prop.type};\n`;
        }
        result += '}\n';
    }
    return result;
}

export function parseTypedefs(scriptContent) {
    const typedefs = {};
    const typedefRegex = /\/\*\s*@typedef\s+(\w+)[\s\S]*?\*\//gm;
    let match;
    while ((match = typedefRegex.exec(scriptContent)) !== null) {
        const typeName = match[1];
        const blockContent = match[0];
        typedefs[typeName] = [];
        const lines = blockContent.split('\n');
        for (const line of lines) {
            const propertyMatch = line.match(/@property\s+\{([^}]+)\}\s+(\w+)/);
            if (propertyMatch) {
                typedefs[typeName].push({
                    name: propertyMatch[2],
                    type: propertyMatch[1].trim()
                });
            }
        }
    }
    return typedefs;
}

export function parseInputTypeTree(scriptContent) {
    const typedefs = parseTypedefs(scriptContent);
    const inputs = parseInputs(scriptContent);

    function resolveType(type, seen = new Set()) {
        const isArray = type.endsWith('[]');
        const baseType = isArray ? type.slice(0, -2) : type;
        if (typedefs[baseType]) {
            if (seen.has(baseType)) {
                return {type: baseType + (isArray ? '[]' : ''), circular: true};
            }
            seen.add(baseType);
            const children = {};
            for (const prop of typedefs[baseType]) {
                children[prop.name] = resolveType(prop.type, new Set(seen));
            }
            return {type: baseType + (isArray ? '[]' : ''), children};
        } else {
            return {type: type};
        }
    }

    const result = {};
    for (const input of inputs) {
        result[input.name] = resolveType(input.type);
    }
    return result;
}

export function parseUiLayout(scriptContent) {
    const typedefBlocks = {};
    const typedefRegex = /\/\*\s*@typedef\s+(\w+)[\s\S]*?\*\//gm;
    let match;
    while ((match = typedefRegex.exec(scriptContent)) !== null) {
        const typeName = match[1];
        const blockContent = match[0];
        typedefBlocks[typeName] = extractUiLayoutFromBlock(blockContent);
    }
    const topLevelLayout = extractUiLayoutFromBlock(scriptContent, true);
    return {...typedefBlocks, __main__: topLevelLayout};
}

function extractUiLayoutFromBlock(block, isTopLevel = false) {
    const lines = block.split('\n');
    const layout = [];
    const seen = new Set();
    for (const line of lines) {
        if (isTopLevel) {
            const inputMatch = line.match(/@input\s+[^\s]+\s+(\w+)/);
            if (inputMatch && !seen.has(inputMatch[1])) {
                layout.push(inputMatch[1]);
                seen.add(inputMatch[1]);
            }
        }
        const propertyMatch = line.match(/@property\s+\{[^}]+\}\s+(\w+)/);
        if (propertyMatch && !seen.has(propertyMatch[1])) {
            layout.push(propertyMatch[1]);
            seen.add(propertyMatch[1]);
        }
        const uiMatch = line.match(/@ui\s+(\{.*\})/);
        if (uiMatch) {
            const uiKey = `@UI${uiMatch[1]}`;
            if (!seen.has(uiKey)) {
                layout.push(uiKey);
                seen.add(uiKey);
            }
        }
    }
    return layout;
}
