'use strict'
import *  as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { utils } from '../System/utils';
import { format } from 'path';
import { setTimeout } from 'timers';
import { commands, window, workspace, SymbolInformation, QuickPickItem, QuickPickOptions, InputBoxOptions, SymbolKind, TextEdit } from 'vscode';
import SuperSharp from '../superSharp'
import TypeElement from '../System/CSharp/TypeElement'

export default class MoveTypeToNewFileAction {
    
    public static actionId = 'supersharp.moveTypeToFile';
    public static actionTitle = "Move type to file";

    public tryGetCommand(document:vscode.TextDocument, range: vscode.Range) : vscode.Command {

        if(!range.isSingleLine) {
            return null;
        }

        var typeName = TypeElement.tryGetSelectedTypeName(document, range);
                    
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
        
        var type = TypeElement.fromCursorPosition(document, range.start);

        if(type == null)
        {
            vscode.window.showInformationMessage('Unable to determine Type');
            return;
        }

        var filePath = path.join(path.dirname(document.fileName), type.name + ".cs");

        var namespace = this.tryFindCurrentNamespace(document);

        this.createNewTypeDocument(namespace, type.text, type.name, filePath)

        type.deleteFromDocument()
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

    
}