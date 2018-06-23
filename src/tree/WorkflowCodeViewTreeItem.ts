/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Workflow } from 'azure-arm-logic/lib/models';
import { URL } from 'url';
import * as vscode from 'vscode';
import { OutputChannel } from 'vscode';
import { getKuduClient, ILogStream, SiteClient } from 'vscode-azureappservice';
import { FunctionConfig, HttpAuthLevel } from '../FunctionConfig';

export class WorkflowCodeViewTreeItem {
    public static contextValue: string = 'azLogicAppsWorkflowCode';
    public readonly contextValue: string = WorkflowCodeViewTreeItem.contextValue;
    public readonly config: FunctionConfig;
    public readonly client: SiteClient;
    public readonly commandId: string = 'azLogicApps.openCodeView';

    private readonly _name: string;
    private readonly _outputChannel: OutputChannel;
    private readonly _workflow: Workflow;

    public constructor(workflow: Workflow) {
        this._workflow = workflow;
    }

    public get id(): string {
        return this._workflow.id + 'codeview' || '';
    }

    public get label(): string {
        return 'Code View';
    }
}
