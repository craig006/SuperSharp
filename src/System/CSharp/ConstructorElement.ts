'use strict'
import *  as vscode from 'vscode';
import { utils } from '../utils'
import DocumentElement from './DocumentElement'
import TypeElement from './TypeElement'
import { TextEdit } from 'vscode';


export default class ConstructorElement extends DocumentElement {
    
    type: TypeElement
    range: vscode.Range;

    private pattern = () => "(public|private|protected|internal)?\\s*" + this.type.name + "\\s*?\\(([\\w\\s,]+)?\\)";

    private get declarationPattern(): RegExp { return new RegExp(this.pattern(), "g") }
    private get declarationPatternWithOpeningBracee(): RegExp { return new RegExp(this.pattern() + "[\\s\\S]*?{", "g") }    

    get nextParameterPosition(): vscode.Position {
        var constructorText = this.document.getText(this.range);
        var match = this.declarationPattern.exec(constructorText);
        var lastBracketPosition = match.index + match[0].length - 1
        return this.convertIndexInRangeToPosition(lastBracketPosition, this.range);
    };

    get firstLinePosition(): vscode.Position {
        var constructorText = this.document.getText(this.range);
        var match = this.declarationPatternWithOpeningBracee.exec(constructorText);
        var lastBracketPosition = match.index + match[0].length
        var position = this.convertIndexInRangeToPosition(lastBracketPosition, this.range);
        return new vscode.Position(position.line + 1, position.character);
    };

    public static fromCSType(type: TypeElement) : ConstructorElement {
        
        var constructor = new ConstructorElement(type.document);
        constructor.type = type;
        
        var success = constructor.resolve(type);
        
        if(!success)
            return null;

        return constructor;
    }

    private resolve(type: TypeElement) : boolean{
                
        var typeText = this.document.getText(type.range);
        var match = this.declarationPattern.exec(typeText);

        var constructorPosition = this.convertIndexInRangeToPosition(match.index, type.range)

        var constructorRange = this.tryFindCodeBlockRange(constructorPosition);

        if(!constructorRange)
            return false;

        this.range = constructorRange;

        return true;
    }

    public addInjectedParameter(parameterType: string) {

        var parameterNameBase = parameterType;
        if(parameterType.startsWith("I") && parameterType.charAt(1).toLocaleUpperCase() == parameterType.charAt(1)) {
            parameterNameBase = parameterType.slice(1)       
        }
     
        var parameterName = parameterNameBase.charAt(0).toLowerCase() + parameterNameBase.slice(1);
        var parameterDeclaration = ", " + parameterType + " " + parameterName;
        var fieldDeclaration = "private readonly " + parameterType + " _" + parameterName + ";\n\n";
        var fieldAssignment = "_" + parameterName + " = " + parameterName + ";\n";
        
        var edit = new vscode.WorkspaceEdit()
        edit.insert(this.document.uri, this.nextParameterPosition, parameterDeclaration);
        edit.insert(this.document.uri, this.range.start, fieldDeclaration)
        edit.insert(this.document.uri, this.firstLinePosition, fieldAssignment)
        
        var formatStart = new vscode.Position(this.range.start.line - 2, 0)
        var formatEnd = new vscode.Position(this.firstLinePosition.line + 3, 0)

        vscode.workspace.applyEdit(edit).then(success => {

            this.resolve(this.type);

            vscode.commands.executeCommand('vscode.executeFormatRangeProvider', this.document.uri, new vscode.Range(formatStart, formatEnd)).then((result: TextEdit[]) => {
                var edit = new vscode.WorkspaceEdit()
                edit.set(this.document.uri, result);
                vscode.workspace.applyEdit(edit);
            })
        });
    }
}
