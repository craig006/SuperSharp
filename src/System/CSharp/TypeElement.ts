'use strict'
import *  as vscode from 'vscode';
import { utils } from '../utils'
import DocumentElement from './DocumentElement'
import ConstructorElement from './ConstructorElement'

export default class TypeElement extends DocumentElement {
    
    range: vscode.Range;
    name: string;

    private _constructors: ConstructorElement;
    get constructors(): ConstructorElement {
        if(!this._constructors)
            this._constructors = ConstructorElement.fromCSType(this);
        return this._constructors
    };

    get text(): string {
        return this.document.getText(this.range);
    };

    public static fromCursorPosition(document: vscode.TextDocument, cursorPosition: vscode.Position) : TypeElement {
        
        var typeDefinition = new TypeElement(document);
        
        var succes = typeDefinition.resolve(cursorPosition);
        
        if(!succes)
            return null;

        return typeDefinition;
    }

    private resolve(position: vscode.Position): boolean {
        
        let pattern = new RegExp(/ (?:class|struct)\s+(\w+)/g);
        
        for (let line = position.line; line >= 0; line--) {

            let textLine = this.document.lineAt(line);

            let declarationMatch = pattern.exec(textLine.text);

            if(declarationMatch) {

                var typePosition = new vscode.Position(line, 0);

                var typeRange = this.tryFindCodeBlockRange(typePosition);

                if(typeRange != null && typeRange.contains(position)) {
                    this.range = typeRange;
                    this.name = declarationMatch[1];
                    return true;
                }
            }
        }

        return false;
    }

    public static tryGetSelectedTypeName(document:vscode.TextDocument, range: vscode.Range) : string {
        
        let readonlyRegex = new RegExp(/(public|private|internal|protected)?\s(class|interface|enum|struct)\s(\w+)/g);        
        let textLine = document.lineAt(range.start.line);
        let match = readonlyRegex.exec(textLine.text);
                    
        if(match)
        {
            return match[3];
        }

        return null;

    }

    public deleteFromDocument() {
        var edit = new vscode.WorkspaceEdit()
        edit.delete(this.document.uri, this.range);
        vscode.workspace.applyEdit(edit)
    }
}