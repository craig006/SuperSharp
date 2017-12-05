'use strict'
import *  as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { utils } from './System/utils';
import { format } from 'path';
import { setTimeout } from 'timers';
import { commands, window, workspace, SymbolInformation, QuickPickItem, QuickPickOptions, InputBoxOptions, SymbolKind, TextEdit } from 'vscode';
import InjectDependency from './Actions/injectDependency'
import MoveTypeToNewFileAction from './Actions/moveTypeToNewFileAction'


export default class CodeActionProvider implements vscode.CodeActionProvider{
    
    moveTypeToNewFileAction = new MoveTypeToNewFileAction();
    
    injectDependency = new InjectDependency();
    
    constructor() {         
        vscode.commands.registerCommand(MoveTypeToNewFileAction.actionId, this.moveTypeToNewFileAction.executeAction, this.moveTypeToNewFileAction);        
        vscode.commands.registerCommand(InjectDependency.actionId, this.injectDependency.executeAction, this.injectDependency);
    }    

    public provideCodeActions(document:vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext, token: vscode.CancellationToken) : vscode.Command[] {
        
        var commands = [];

        let moveTypeToNewFileCommand =  this.moveTypeToNewFileAction.tryGetCommand(document, range)

        if(moveTypeToNewFileCommand) {
            commands.push(moveTypeToNewFileCommand);
        }

        let injectDependencyCommand =  this.injectDependency.tryGetCommand(document, range)
        
        if(injectDependencyCommand) {
            commands.push(injectDependencyCommand);
        }

        return commands;
    }    
}