/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Workflow, WorkflowRun, WorkflowVersion } from 'azure-arm-logic/lib/models';
import { URL } from 'url';
import * as vscode from 'vscode';
import { OutputChannel } from 'vscode';
import { nodeUtils } from '../utils/nodeUtils';

export class WorkflowVersionTreeItem {
    public static contextValue: string = 'azLogicAppsWorkflowVersion';
    public readonly contextValue: string = WorkflowVersionTreeItem.contextValue;
    public readonly commandId: string = 'azLogicApps.openCodeView';

    private readonly _name: string;
    private readonly _outputChannel: OutputChannel;
    private readonly _workflowVersion: WorkflowVersion;

    public constructor(workflowVersion: WorkflowVersion) {
        this._workflowVersion = workflowVersion;
    }

    public get id(): string {
        return this._workflowVersion.id || '';
    }

    public get label(): string {
        return this._workflowVersion.name || '';
    }

    public get iconPath(): string {
        return nodeUtils.getIconPath(WorkflowVersionTreeItem.contextValue);
    }
}
