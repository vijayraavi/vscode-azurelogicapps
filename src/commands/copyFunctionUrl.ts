/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as clipboardy from 'clipboardy';
import { AzureTreeDataProvider, IAzureNode } from 'vscode-azureextensionui';
import { localize } from '../localize';
import { WorkflowCodeViewTreeItem } from '../tree/WorkflowCodeViewTreeItem';

export async function copyFunctionUrl(tree: AzureTreeDataProvider, node?: IAzureNode<WorkflowCodeViewTreeItem>): Promise<void> {
    if (!node) {
        node = <IAzureNode<WorkflowCodeViewTreeItem>>await tree.showNodePicker(WorkflowCodeViewTreeItem.contextValue);
    }

    if (node.treeItem.config.isHttpTrigger) {
        await clipboardy.write(node.treeItem.triggerUrl);
    } else {
        throw new Error(localize('CopyFailedForNonHttp', 'Function URLs can only be used for HTTP triggers.'));
    }
}
