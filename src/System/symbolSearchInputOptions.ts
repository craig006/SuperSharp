'use strict'
import *  as vscode from 'vscode';
import { InputBoxOptions } from 'vscode';

export default class SymbolSearchInputOptions implements InputBoxOptions {
    
    value?: string;

    valueSelection?: [number, number];
    
    prompt?: string;
    
    placeHolder?: string;
    
    password?: boolean;
    
    ignoreFocusOut?: boolean;
    
    validateInput?(value: string): string | undefined | null | Thenable<string | undefined | null>;
}