'use strict'
import *  as vscode from 'vscode';
import { SymbolInformation, QuickPickItem, SymbolKind } from 'vscode';

export default class SymbolInformationQuickPickItem implements QuickPickItem {

    label: string;
    
    description: string;

    detail?: string;

    symbol: SymbolInformation;

    constructor(symbol: SymbolInformation) {
        this.symbol = symbol;
        this.label = symbol.name;
        this.description = SymbolKind[symbol.kind];
        this.detail = symbol.location.uri.path;
    } 
}