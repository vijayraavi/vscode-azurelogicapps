/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Workflow, WorkflowRun } from 'azure-arm-logic/lib/models';
import { URL } from 'url';
import * as vscode from 'vscode';
import { OutputChannel } from 'vscode';
import { getKuduClient, ILogStream, SiteClient } from 'vscode-azureappservice';
import { IAzureTreeItem } from 'vscode-azureextensionui';
import { FunctionConfig, HttpAuthLevel } from '../FunctionConfig';

export class WorkflowRunTreeItem {
    public static contextValue: string = 'azLogicAppsWorkflowRun';
    public readonly contextValue: string = WorkflowRunTreeItem.contextValue;
    public readonly config: FunctionConfig;
    public readonly client: SiteClient;
    public readonly commandId: string = 'azLogicApps.openRunCodeView';

    private readonly _name: string;
    private readonly _outputChannel: OutputChannel;
    private readonly _workflowRun: WorkflowRun;

    public constructor(workflowRun: WorkflowRun) {
        this._workflowRun = workflowRun;
    }

    public get id(): string {
        return this._workflowRun.id || '';
    }

    public get label(): string {
        return this._workflowRun.name || '';
    }
}
