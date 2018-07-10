/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Workflow, WorkflowVersion } from 'azure-arm-logic/lib/models';
import { URL } from 'url';
import * as vscode from 'vscode';
import { OutputChannel } from 'vscode';
import { IAzureTreeItem } from 'vscode-azureextensionui';
import { ext } from '../extensionVariables';
import { nodeUtils } from '../utils/nodeUtils';
import { WorkflowVersionTreeItem } from './WorkflowVersionTreeItem';

export class WorkflowVersionsTreeItem {
    public static contextValue: string = 'azLogicAppsWorkflowVersions';
    public readonly contextValue: string = WorkflowVersionsTreeItem.contextValue;

    private readonly _name: string;
    private readonly _outputChannel: OutputChannel;
    private readonly _workflow: Workflow;
    private readonly _workflowVersion: WorkflowVersion;

    public constructor(workflow: Workflow) {
        this._workflow = workflow;
    }

    public get id(): string {
        return this._workflow.id + 'versions' || '';
    }

    public get label(): string {
        return 'Versions';
    }

    public hasMoreChildren(): boolean {
        return false;
    }

    public async loadMoreChildren(): Promise<IAzureTreeItem[]> {
        const workflowVersions = await ext.client.workflowVersions.list(this._workflow.id.split('/')[4], this._workflow.name);

        const workflowVersionsItem = workflowVersions.map((workflowVersion: WorkflowVersion) => {
            return new WorkflowVersionTreeItem(workflowVersion);
        });

        return workflowVersionsItem;
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
