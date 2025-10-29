/**
 * This file takes in a d.ts, converts it into a JSON object, and saves it to the Data folder.
 * We can then use the JSON object to get the definition of a class, interface, or enum by name.
 */

import * as ts from 'typescript';
import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputRelativePath = '../Input/StudioLib.d.ts';
const outputRelativeDir = '../dist/Data';
const outputRelativeFile = 'ls-api-definition.json';

type SpecialNodes = ts.ClassDeclaration | ts.MethodDeclaration | ts.PropertyDeclaration | ts.InterfaceDeclaration | ts.EnumDeclaration | ts.AccessorDeclaration;

class DefinitionParser {
    sourceFile: ts.SourceFile;

    constructor(dtsFilePath: string) {
        const fileContent = fs.readFileSync(dtsFilePath, 'utf8');
        this.sourceFile = ts.createSourceFile(
            'temp.d.ts',
            fileContent,
            ts.ScriptTarget.Latest,
            true
        );

    }

    private getNameOfNode(node: SpecialNodes): string | undefined {
        return node.name && ts.isIdentifier(node.name) ? node.name.text : undefined;
    }

    private collectSymbolRecursively(node: ts.Node): SpecialNodes[] {
        let foundNodes: SpecialNodes[] = [];

        if (
            ts.isClassDeclaration(node)
            || ts.isInterfaceDeclaration(node)
            || ts.isEnumDeclaration(node)
        ) {
            foundNodes.push(node);
        }
        else {
            // Combine the found nodes when going recursively with the current results
            const children = node.getChildren();

            children.forEach((child) => {
                foundNodes = foundNodes.concat(this.collectSymbolRecursively(child));
            });
        }

        return foundNodes
    };

    private getRelatedText(node: ts.Node): string | null {
        try {
            const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
            const result = printer.printNode( ts.EmitHint.Unspecified, node, this.sourceFile );
            return result;
        } catch (error) {
            console.error('Error getting definition for:', error);
            return null;
        }
    }

    private nodeToJson(node: SpecialNodes): any {
        return {
            kind: ts.SyntaxKind[node.kind],
            text: this.getRelatedText(node),
            name: this.getNameOfNode(node)
        };
    }

    private nodesToJson(nodes: {}): {} {
        let result = {};
        
        for (var k in nodes) {
            const currentNode = nodes[k];
            result[k] = this.nodeToJson(currentNode);

            currentNode.members.forEach((member) => {
                if (
                    (
                        ts.isMethodDeclaration(member) ||
                        ts.isPropertyDeclaration(member) ||
                        ts.isGetAccessorDeclaration(member)
                    )
                    && member.name
                    && ts.isIdentifier(member.name)
                ) {
                    if (!result[k].members) {
                        result[k].members = [];
                    }

                    result[k].members.push(this.getNameOfNode(member));
                }
            });
            
        }

        return result;
    }

    generate(): object {
        let allNodes = {};
        let allNodesAsJson = {};

        this.sourceFile.forEachChild((child) => {
            const foundNodes = this.collectSymbolRecursively(child);

            foundNodes.forEach((node) => {
                const currentNode = this.nodeToJson(node);
                
                // Store by kind since class/enum/interface may have the same name
                if (!allNodes[currentNode.kind]) {
                    allNodes[currentNode.kind] = {}
                }

                if (!allNodes[currentNode.kind][currentNode.name]) {
                    allNodes[currentNode.kind][currentNode.name] = node;
                } else {
                    console.warn(`- ${currentNode.name} seems to conflict with another node.`);
                }

            });
        });

        for (var k in allNodes) {
            allNodesAsJson[k] = this.nodesToJson(allNodes[k]);
        }

        return allNodesAsJson;
    }
}

// Generate the output
const lsDefinitionParser = new DefinitionParser(path.join(__dirname, inputRelativePath));
const convertedNodes = lsDefinitionParser.generate();

// Save the output
fs.mkdirSync(path.join(__dirname, outputRelativeDir), { recursive: true });
fs.writeFileSync(path.join(__dirname, outputRelativeDir, outputRelativeFile), JSON.stringify(convertedNodes, null, 2));