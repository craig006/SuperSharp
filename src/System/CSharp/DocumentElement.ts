'use strict'
import *  as vscode from 'vscode';
import { utils } from '../utils'


export default class DocumentElement {
    document: vscode.TextDocument;

    constructor(document: vscode.TextDocument) {
        this.document = document;
    }

    protected tryFindCodeBlockRange(position: vscode.Position): vscode.Range {
        
        var counter = new utils.BalancedCounter();

        let line;
        for (line = position.line; line <= this.document.lineCount; line++){
            
            var lineText = this.document.lineAt(line).text;
            
            counter.up(utils.Regex.countOccurances("{", lineText));

            counter.down(utils.Regex.countOccurances("}", lineText));

            if(counter.isBalanced())
                break;

            if(counter.balance < 0)
                break;
        }

        if(!counter.isBalanced())
            return null;


        var end = new vscode.Position(line, this.document.lineAt(line).text.length);
        
        return new vscode.Range(position, end);
    }

    protected convertIndexInRangeToPosition(index: number, range: vscode.Range): vscode.Position {
        var rangeStartIndex = this.document.offsetAt(range.start);
        return this.document.positionAt(rangeStartIndex + index);
        
    }
}
