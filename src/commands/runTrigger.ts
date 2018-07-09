/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureTreeDataProvider, IAzureNode } from 'vscode-azureextensionui';
import { ext } from '../extensionVariables';
import { WorkflowsTreeItem } from '../tree/WorkflowTreeItem';

export async function runTrigger(tree: AzureTreeDataProvider, node?: IAzureNode<WorkflowsTreeItem>): Promise<void> {
    if (!node) {
        node = <IAzureNode<WorkflowsTreeItem>>await tree.showNodePicker(WorkflowsTreeItem.contextValue);
    }

    await node.runWithTemporaryDescription(
        'Running...',
        async () => {
            // tslint:disable-next-line:no-non-null-assertion
            await ext.client.workflowTriggers.run(node.treeItem._workflow.id.split('/')[4], node.treeItem._workflow.name, 'request');
        }
    );
    //startFunctionApp
}
