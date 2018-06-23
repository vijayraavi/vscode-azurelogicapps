/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Workflow } from 'azure-arm-logic/lib/models';
import { URL } from 'url';
import * as vscode from 'vscode';
import { OutputChannel } from 'vscode';
import { IAzureTreeItem } from 'vscode-azureextensionui';
import { ext } from '../extensionVariables';
import { WorkflowRunTreeItem } from './WorkflowRunTreeItem';

export class WorkflowRunsTreeItem {
    public static contextValue: string = 'azLogicAppsWorkflowRuns';
    public readonly contextValue: string = WorkflowRunsTreeItem.contextValue;

    private readonly _name: string;
    private readonly _outputChannel: OutputChannel;
    private readonly _workflow: Workflow;
    private readonly _workflowRunTreeItem: WorkflowRunTreeItem;

    public constructor(workflow: Workflow) {
        this._workflow = workflow;
    }

    public get id(): string {
        return this._workflow.id + 'runs' || '';
    }

    public get label(): string {
        return 'Runs';
    }

    public hasMoreChildren(): boolean {
        return false;
    }

    public async loadMoreChildren(): Promise<IAzureTreeItem[]> {
        const workflowRuns = await ext.client.workflowRuns.list(this._workflow.id.split('/')[4], this._workflow.name);

        const workflowRunItems = workflowRuns.map((workflowRun: WorkflowRun) => {
            return new WorkflowRunTreeItem(workflowRun);
        });

        return workflowRunItems;

        //return [this._workflowRunTreeItem];
    }

    public pickTreeItem(expectedContextValue: string): IAzureTreeItem | undefined {
        switch (expectedContextValue) {
            case WorkflowRunTreeItem.contextValue:
                return this._workflowRunTreeItem;
            default:
                return undefined;
        }
    }
}
