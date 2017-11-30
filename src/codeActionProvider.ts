'use strict'
import *  as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { format } from 'path';
import { setTimeout } from 'timers';
import { commands } from 'vscode';

export class Regex {
    public static countOccurances(of: string, inString: string) : number {
        var match = inString.match(new RegExp(of, "g"));
        
        if(match == null)
            return 0;

        return match.length;
    }
}

export class BalancedCounter {

    private started = false;
    
    balance: number = 0;
    
    public up(amount: number) {
        if(amount > 0) {
            this.started = true;
            this.balance += amount;
        }
    }

    public down(amount: number) {
        if(amount > 0) {
            this.started = true;
            this.balance -= amount;
        }
    }

    public isBalanced() {
        return this.started && this.balance == 0
    }
}

export class MoveTypeToNewFileAction {

    public static actionId = 'supersharp.moveTypeToFile';
    public static actionTitle = "Move type to file";

    public tryGetCommand(document:vscode.TextDocument, range: vscode.Range) : vscode.Command {

        if(!range.isSingleLine) {
            return null;
        }

        var typeName = this.tryGetSelectedTypeName(document, range);
                    
        if(typeName)
        {

            let command: vscode.Command = {
                title: `Move ${typeName} to new file`,
                command: MoveTypeToNewFileAction.actionId,
                arguments: [document, range]
            };
    
            return command;
        }

        return null;
    }

    public executeAction(document:vscode.TextDocument, range: vscode.Range) {
        
        var typeName = this.tryGetSelectedTypeName(document, range);

        var typeRange = this.tryFindTypeRange(document, range);

        if(typeRange == null) {
            vscode.window.showInformationMessage('Unable to determine start and end of Type: ' + typeName);
            return;
        }

        var classBody = document.getText(typeRange);

        var filePath = path.join(path.dirname(document.fileName), typeName + ".cs");

        var namespace = this.tryFindCurrentNamespace(document);

        this.createNewTypeDocument(namespace, classBody, typeName, filePath)

        this.deleteFromDocument(document, typeRange)

        //this.createClassFromRange(classRange, className, document);
    }

    private tryGetSelectedTypeName(document:vscode.TextDocument, range: vscode.Range) : string {
        
        let readonlyRegex = new RegExp(/(public|private|internal|protected)?\s(class|interface|enum|struct)\s(\w+)/g);        
        let textLine = document.lineAt(range.start.line);
        let match = readonlyRegex.exec(textLine.text);
                    
        if(match)
        {
            return match[3];
        }

        return null;

    }

    private tryFindTypeRange(document:vscode.TextDocument, range: vscode.Range): vscode.Range {
    
        var counter = new BalancedCounter();

        let line;
        for (line = range.start.line; line <= document.lineCount; line++){
            
            var lineText = document.lineAt(line).text;
            
            counter.up(Regex.countOccurances("{", lineText));

            counter.down(Regex.countOccurances("}", lineText));

            if(counter.isBalanced())
                break;

            if(counter.balance < 0)
                break;
        }

        if(!counter.isBalanced())
            return null;


        var end = new vscode.Position(line, document.lineAt(line).text.length);
        
        return new vscode.Range(new vscode.Position(range.start.line, 0), end);
    }

    private tryFindCurrentNamespace(document:vscode.TextDocument) {
        let readonlyRegex = new RegExp(/namespace\s([\w\.]+)/g);        
        let text = document.getText()
        let match = readonlyRegex.exec(text);

        if(match != null)
            return match[1];

        return ""
    }

    private createNewTypeDocument(namespace: string, typeDefinition: string, typeName: string, saveToPath: string) {

        if (fs.existsSync(saveToPath)) {
            vscode.window.showErrorMessage("File "+ typeName + ".cs" + " already exists");
            return;
        }

        var templatePath = path.join(vscode.extensions.getExtension(SuperSharp.namespace).extensionPath + '/templates/newType.tmpl')

        var updateTemplate = (templateDocument: vscode.TextDocument) => {
            let templateText = templateDocument.getText();
            templateText = templateText.replace('${namespace}', namespace);
            templateText = templateText.replace('${tyedefinition}', typeDefinition);
            fs.writeFileSync(saveToPath, templateText);

            //var timer = setTimeout(() => { this.openDocument(filePath) }, 2000);
        }

        vscode.workspace.openTextDocument(templatePath).then(updateTemplate);
    }

    private deleteFromDocument(document:vscode.TextDocument, deleteRange: vscode.Range) {
        var edit = new vscode.WorkspaceEdit()
        edit.delete(document.uri, deleteRange);
        vscode.workspace.applyEdit(edit)
    }
}

export class SuperSharp {
    static namespace = 'craigthomas.supersharp';
}

export default class CodeActionProvider implements vscode.CodeActionProvider{
    
    moveTypeToNewFileAction = new MoveTypeToNewFileAction();
    
    constructor() {         
        vscode.commands.registerCommand(MoveTypeToNewFileAction.actionId, this.moveTypeToNewFileAction.executeAction, this.moveTypeToNewFileAction);        
    }    

    public provideCodeActions(document:vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext, token: vscode.CancellationToken) : vscode.Command[] {
        
        var commands = [];

        let moveTypeToNewFileCommand =  this.moveTypeToNewFileAction.tryGetCommand(document, range)

        if(moveTypeToNewFileCommand) {
            commands.push(moveTypeToNewFileCommand);
        }

        return commands;
    }    

    // private openDocument = (path: string) => {
    //     console.log("5*********")
    //     vscode.workspace.openTextDocument(path).then(this.showdocument)
    //     console.log("6*********")
    // }

    // private showdocument = (doc: vscode.TextDocument) => {
    //     vscode.window.showTextDocument(doc).then(this.format)
    // }

    // private format = (editor: vscode.TextEditor) => {

    //     var document = editor.document;

    //     console.log("document to format text:")
    //     console.log(document.getText())

    //     vscode.commands.executeCommand('vscode.executeFormatDocumentProvider', document.uri).then(
    //         (formattingEdits: any) => {
    //             console.log(formattingEdits);
    //             var formatEdit = new vscode.WorkspaceEdit();
    //             formatEdit.set(document.uri, formattingEdits);
    //             return vscode.workspace.applyEdit(formatEdit).then(val => document.save());    
    //         }, (reason: any) => { 
    //             console.log(reason)
    //         });
    // }
}