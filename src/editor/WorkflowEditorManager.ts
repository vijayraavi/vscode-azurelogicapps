import * as fse from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { MessageItem, ViewColumn } from 'vscode';
import { AzureTreeDataProvider, DialogResponses, IActionContext, IAzureNode, IAzureParentNode, UserCancelledError } from 'vscode-azureextensionui';
import { ext } from '../extensionVariables';
// import { DocDBDocumentNodeEditor } from './docdb/editors/DocDBDocumentNodeEditor';
// import { DocDBStoredProcedureNodeEditor } from './docdb/editors/DocDBStoredProcedureNodeEditor';
// import { DocDBDocumentTreeItem } from './docdb/tree/DocDBDocumentTreeItem';
// import { DocDBStoredProcedureTreeItem } from './docdb/tree/DocDBStoredProcedureTreeItem';
// import { MongoCollectionNodeEditor } from './mongo/editors/MongoCollectionNodeEditor';
// import { MongoDocumentNodeEditor } from './mongo/editors/MongoDocumentNodeEditor';
// import { MongoCollectionTreeItem } from './mongo/tree/MongoCollectionTreeItem';
// import { MongoDocumentTreeItem } from './mongo/tree/MongoDocumentTreeItem';
//import * as vscodeUtils from './utils/vscodeUtils';

export interface IWorkflowEditor<T = {}> {
    label: string;
    id: string;
    getData(): Promise<T>;
    update(data: T): Promise<T>;
    convertFromString(data: string): T;
    convertToString(data: T): string;
}

export class WorkflowEditorManager {
    private fileMap: { [key: string]: IWorkflowEditor } = {};
    private ignoreSave: boolean = false;

    private readonly showSavePromptKey: string = 'azLogicApps.showSavePrompt';
    private _globalState: vscode.Memento;
    private readonly _persistedEditorsKey: string = "ms-azuretools.vscode-azurelogicapps.editors";

    constructor(globalState: vscode.Memento) {
        this._globalState = globalState;
    }

    public async showDocument(editor: IWorkflowEditor, fileName: string): Promise<void> {
        const column: vscode.ViewColumn = vscode.ViewColumn.Active;
        const preserveFocus: boolean = false;

        const localDocPath = path.join(os.tmpdir(), 'vscode-workflow-codeview-editor', fileName);
        await fse.ensureFile(localDocPath);

        const document = await vscode.workspace.openTextDocument(localDocPath);
        if (document.isDirty) {
            const overwriteFlag = await vscode.window.showWarningMessage(`You are about to overwrite "${fileName}", which has unsaved changes. Do you want to continue?`, { modal: true }, DialogResponses.yes, DialogResponses.cancel);
            if (overwriteFlag !== DialogResponses.yes) {
                throw new UserCancelledError();
            }
        }

        this.fileMap[localDocPath] = editor;
        const fileMapLabels = this._globalState.get(this._persistedEditorsKey, {});
        Object.keys(this.fileMap).forEach((key) => fileMapLabels[key] = (this.fileMap[key]).id);
        this._globalState.update(this._persistedEditorsKey, fileMapLabels);

        const textEditor = await vscode.window.showTextDocument(document, column, preserveFocus);
        const data = await editor.getData();
        await this.updateEditor(data, textEditor, editor);
    }

    public async onDidSaveTextDocument(context: IActionContext, doc: vscode.TextDocument, tree: AzureTreeDataProvider): Promise<void> {
        context.suppressTelemetry = true;
        let filePath = Object.keys(this.fileMap).find((filePath) => path.relative(doc.uri.fsPath, filePath) === '');
        if (!filePath) {
            filePath = await this.loadPersistedEditor(doc.uri, tree);
        }
        if (!this.ignoreSave && filePath) {
            context.suppressTelemetry = false;
            const editor: IWorkflowEditor = this.fileMap[filePath];
            const showSaveWarning: boolean | undefined = vscode.workspace.getConfiguration().get(this.showSavePromptKey);
            if (showSaveWarning !== false) {
                const message: string = `Saving 'workflow.json' will update it to the Cloud.`;
                const result: MessageItem | undefined = await vscode.window.showWarningMessage(message, DialogResponses.upload, DialogResponses.alwaysUpload, DialogResponses.cancel);

                if (result === DialogResponses.alwaysUpload) {
                    await vscode.workspace.getConfiguration().update(this.showSavePromptKey, false, vscode.ConfigurationTarget.Global);
                } else if (result !== DialogResponses.upload) {
                    throw new UserCancelledError();
                }
            }

            await this.updateToCloud(editor, doc);
        }
    }

    // public async updateMatchingNode(documentUri: vscode.Uri, tree?: AzureTreeDataProvider): Promise<void> {
    //     let filePath: string = Object.keys(this.fileMap).find((filePath) => path.relative(documentUri.fsPath, filePath) === '');
    //     if (!filePath) {
    //         filePath = await this.loadPersistedEditor(documentUri, tree);
    //     }
    //     const document = await vscode.workspace.openTextDocument(documentUri.fsPath);
    //     await this.updateToCloud(this.fileMap[filePath], document);
    // }

    private async updateToCloud(editor: IWorkflowCodeViewEditor, doc: vscode.TextDocument): Promise<void> {
        const newContent = editor.convertFromString(doc.getText());
        const updatedContent: {} = await editor.update(newContent);
        const timestamp = (new Date()).toLocaleTimeString();
        ext.outputChannel.appendLine(`${timestamp}: Updated Logic App "${editor.label}"`);
        ext.outputChannel.show();
        await this.updateEditor(updatedContent, vscode.window.activeTextEditor, editor);
    }

    private async updateEditor(data: {}, textEditor: vscode.TextEditor, editor: IWorkflowCodeViewEditor): Promise<void> {
        const updatedText = editor.convertToString(data);

        await textEditor.edit((editBuilder: vscode.TextEditorEdit) => {
            if (textEditor.document.lineCount > 0) {
                const lastLine = textEditor.document.lineAt(textEditor.document.lineCount - 1);
                editBuilder.delete(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(lastLine.range.start.line, lastLine.range.end.character)));
            }

            editBuilder.insert(new vscode.Position(0, 0), updatedText);
        });

        this.ignoreSave = true;
        try {
            await textEditor.document.save();
        } finally {
            this.ignoreSave = false;
        }
    }

    // private async loadPersistedEditor(documentUri: vscode.Uri, tree: AzureTreeDataProvider): Promise<string> {
    //     const persistedEditors = this._globalState.get(this._persistedEditorsKey);
    //     //Based on the documentUri, split just the appropriate key's value on '/'
    //     if (persistedEditors) {
    //         const editorFilePath = Object.keys(persistedEditors).find((label) => path.relative(documentUri.fsPath, label) === '');
    //         if (editorFilePath) {
    //             const editorNode: IAzureNode | undefined = await tree.findNode(persistedEditors[editorFilePath]);
    //             let editor: ICosmosEditor;
    //             if (editorNode) {
    //                 if (editorNode.treeItem instanceof MongoCollectionTreeItem) {
    //                     editor = new MongoCollectionNodeEditor(<IAzureParentNode<MongoCollectionTreeItem>>editorNode);
    //                 } else if (editorNode.treeItem instanceof DocDBDocumentTreeItem) {
    //                     editor = new DocDBDocumentNodeEditor(<IAzureNode<DocDBDocumentTreeItem>>editorNode);
    //                 } else if (editorNode.treeItem instanceof MongoDocumentTreeItem) {
    //                     editor = new MongoDocumentNodeEditor(<IAzureNode<MongoDocumentTreeItem>>editorNode);
    //                 } else if (editorNode.treeItem instanceof DocDBStoredProcedureTreeItem) {
    //                     editor = new DocDBStoredProcedureNodeEditor(<IAzureNode<DocDBStoredProcedureTreeItem>>editorNode);
    //                 } else {
    //                     throw new Error("Unexpected type of Editor treeItem");
    //                 }
    //                 this.fileMap[editorFilePath] = editor;
    //             } else {
    //                 throw new Error("Failed to find entity on the tree. Please check the explorer to confirm that the entity exists, and that permissions are intact.");
    //             }
    //         }
    //         return editorFilePath;
    //     } else {
    //         return undefined;
    //     }
    // }
}
