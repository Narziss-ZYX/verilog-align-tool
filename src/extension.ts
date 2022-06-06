// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Block } from './block';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "verilog-align-tool" is now active!');
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let verilogAlignTool = vscode.commands.registerTextEditorCommand('verilog.align.tool', async (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]) => {
		// The code you place here will be executed every time your command is executed
		// vscode.window.showInformationMessage('Hello World from verilog-align-tool!');
		let selection: vscode.Selection = textEditor.selection;
		if (!selection.isEmpty) {
			let textDocument = textEditor.document;
			
			// Don't select last line, if no character of line is selected.
			let endLine = selection.end.line;
			let endPosition = selection.end;
			if(endPosition.character === 0) {
				endLine--;
			}

			let range = new vscode.Range(new vscode.Position(selection.start.line, 0), new vscode.Position(endLine, textDocument.lineAt(endLine).range.end.character));
            let text = textDocument.getText(range);
			let block : Block = new Block(text, selection.start.line, textDocument.eol).trim().align();
			await textEditor.edit(e => {
				for (let line of block.lines) {
					let deleteRange = new vscode.Range(new vscode.Position(line.number, 0), new vscode.Position(line.number, textDocument.lineAt(line.number).range.end.character));
					let replacement: string = '';
					for (let part of line.parts) {
						replacement += part.value;
					}
					e.replace(deleteRange, replacement);
				}
			});
		}
		
	});
	context.subscriptions.push(verilogAlignTool);
}

// this method is called when your extension is deactivated
export function deactivate() {}
