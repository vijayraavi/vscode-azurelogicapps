/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Workflow } from 'azure-arm-logic/lib/models';
import { IAzureParentTreeItem, IAzureTreeItem } from 'vscode-azureextensionui';
import { WorkflowCodeViewTreeItem } from './WorkflowCodeViewTreeItem';
import { WorkflowRunsTreeItem } from './WorkflowRunsTreeItem';
import { WorkflowVersionsTreeItem } from './WorkflowVersionsTreeItem';

export class WorkflowTreeItem implements IAzureParentTreeItem {
    public static contextValue: string = 'azLogicAppsWorkflows';
    public readonly contextValue: string = WorkflowTreeItem.contextValue;

    private _state?: string;
    private readonly _workflowCodeViewTreeItem: WorkflowCodeViewTreeItem;
    private readonly _workflowRunsTreeItem: WorkflowRunsTreeItem;
    private readonly _workflowVersionsTreeItem: WorkflowVersionsTreeItem;

    private readonly _workflow: Workflow;

    public constructor(workflow: Workflow) {
        this._workflow = workflow;
        this._workflowCodeViewTreeItem = new WorkflowCodeViewTreeItem(workflow);
        this._workflowRunsTreeItem = new WorkflowRunsTreeItem(workflow);
        this._workflowVersionsTreeItem = new WorkflowVersionsTreeItem(workflow);
    }

    public get id(): string {
        return this._workflow.id || '';
    }

    public get label(): string {
        return this._workflow.name || '';
    }

    public hasMoreChildren(): boolean {
        return false;
    }

    public async loadMoreChildren(): Promise<IAzureTreeItem[]> {
        return [this._workflowCodeViewTreeItem, this._workflowRunsTreeItem, this._workflowVersionsTreeItem];
    }

    public pickTreeItem(expectedContextValue: string): IAzureTreeItem | undefined {
        switch (expectedContextValue) {
            case WorkflowCodeViewTreeItem.contextValue:
                return this._workflowCodeViewTreeItem;
            case WorkflowRunsTreeItem.contextValue:
                return this._workflowRunsTreeItem;
            case WorkflowVersionsTreeItem.contextValue:
                return this._workflowVersionsTreeItem;
            default:
                return undefined;
        }
    }
}
