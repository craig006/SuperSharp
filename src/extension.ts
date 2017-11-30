'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import CodeActionProvider from './codeActionProvider';

export function activate(context: vscode.ExtensionContext) {

    const documentSelector: vscode.DocumentSelector = {
        language: 'csharp',
        scheme: 'file'
    };

    const codeActionProvider = new CodeActionProvider();
    let disposable = vscode.languages.registerCodeActionsProvider(documentSelector, codeActionProvider);
    context.subscriptions.push(disposable);
}

export function deactivate() {
}