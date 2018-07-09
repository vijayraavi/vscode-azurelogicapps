/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AzureTreeDataProvider, IAzureNode } from 'vscode-azureextensionui';
import { WorkflowsTreeItem } from '../tree/WorkflowTreeItem';

export async function openInPortal(tree: AzureTreeDataProvider, node?: IAzureNode<FunctionAppTreeItem>): Promise<void> {
    if (!node) {
        node = <IAzureNode<WorkflowsTreeItem>>await tree.showNodePicker(WorkflowsTreeItem.contextValue);
    }

    node.openInPortal();
}
