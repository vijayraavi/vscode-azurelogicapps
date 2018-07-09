/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureTreeDataProvider, IAzureNode } from 'vscode-azureextensionui';
import { ext } from '../extensionVariables';
import { WorkflowRunTreeItem } from '../tree/WorkflowRunTreeItem';
import { WorkflowsTreeItem } from '../tree/WorkflowTreeItem';

export async function resubmitRun(tree: AzureTreeDataProvider, node?: IAzureNode<WorkflowRunTreeItem>): Promise<void> {
    if (!node) {
        node = <IAzureNode<WorkflowRunTreeItem>>await tree.showNodePicker(WorkflowRunTreeItem.contextValue);
    }

    await node.runWithTemporaryDescription(
        'Running...',
        async () => {
            // tslint:disable-next-line:no-non-null-assertion
            //await ext.client.workflowTriggers.run(node.treeItem._workflow.id.split('/')[4], node.treeItem._workflow.name, 'request');
            await ext.client.workflowTriggerHistories.resubmit(node.treeItem._workflowRun.id.split('/')[4], node.treeItem._workflowRun.id.split('/')[8], node.treeItem._workflowRun.trigger.name, node.treeItem._workflowRun.name);
        }
    );
    //startFunctionApp
}
