// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Block } from './block';

async function overwriteText(textEditor: vscode.TextEditor){
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
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('verilog.align.tool', async (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]) => {
			overwriteText(textEditor);
		}),
		vscode.commands.registerTextEditorCommand('verilog.align.tool.withBracket', async (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]) => {
			await vscode.commands.executeCommand('editor.action.selectToBracket');
			overwriteText(textEditor);
		})
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}
