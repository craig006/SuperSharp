'use strict'
import *  as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { utils } from '../System/utils';
import { format } from 'path';
import { setTimeout } from 'timers';
import { commands, window, workspace, SymbolInformation, QuickPickItem, QuickPickOptions, InputBoxOptions, SymbolKind, TextEdit } from 'vscode';
import TypeElement from '../System/CSharp/TypeElement'



export default class InjectDependency {
    
    public static actionId = 'supersharp.injectDependency';
    public static actionTitle = "Introduce injected dependency...";

    public tryGetCommand(document:vscode.TextDocument, range: vscode.Range) : vscode.Command {
    
        var type = TypeElement.fromCursorPosition(document, range.start)
                    
        if(type)
        {
            let command: vscode.Command = {
                title: InjectDependency.actionTitle,
                command: InjectDependency.actionId,
                arguments: [document, range]
            };
    
            return command;
        }

        return null;
    }
    
    public executeAction(document:vscode.TextDocument, range: vscode.Range) {
        
        var type = TypeElement.fromCursorPosition(document, range.start);

        if(type && type.constructors) {

            utils.SymbolPicker.Pick().then(symbol => {

                type.constructors.addInjectedParameter(symbol.name);

                console.log(symbol);
            })

        }
    }
}