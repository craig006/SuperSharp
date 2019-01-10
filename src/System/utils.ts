'use strict'
import *  as vscode from 'vscode';
import { commands, window, workspace, SymbolInformation, QuickPickItem, QuickPickOptions, InputBoxOptions, SymbolKind, TextEdit } from 'vscode';

import SymbolSearchInputOptions from './symbolSearchInputOptions'
import SymbolInformationQuickPickItem from './symbolInformationQuickPickItem'

export module utils {

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

    export class SymbolPicker {
        public static Pick() : Thenable<SymbolInformation> {
            var promise = new Promise<SymbolInformation>((resolve, reject) => {
                var options = new SymbolSearchInputOptions()
                options.prompt = "Search for the type you would like to import"
                options.placeHolder = "e.g. service"
                window.showInputBox(options).then(value => {
                    
                    commands.executeCommand('vscode.executeWorkspaceSymbolProvider', value).then((symbols: SymbolInformation[]) => {
                        
                        symbols = symbols.filter(s => s.kind == SymbolKind.Class || s.kind == SymbolKind.Interface || s.kind == SymbolKind.Struct)
                        var pickItems = symbols.map(e => new SymbolInformationQuickPickItem(e))
                        
                        window.showQuickPick(pickItems).then(selected => {
                            resolve(selected.symbol);
                        })
                    })
                })
            });
    
            return promise;
        }
    }
}
