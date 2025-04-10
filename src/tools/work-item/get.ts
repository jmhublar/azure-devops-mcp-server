import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { AzureDevOpsConnection } from '../../api/connection.js';
import { AzureDevOpsConfig } from '../../config/environment.js';
import { WorkItemBatchGetRequest, WorkItemExpand, WorkItemErrorPolicy } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces.js';

export async function getWorkItem(args: WorkItemBatchGetRequest, config: AzureDevOpsConfig) {
  if (!args.ids || !args.ids.length) {
    throw new McpError(ErrorCode.InvalidParams, 'Invalid work item ID');
  }

  AzureDevOpsConnection.initialize(config);
  const connection = AzureDevOpsConnection.getInstance();
  const workItemTrackingApi = await connection.getWorkItemTrackingApi();
  // Don't use both fields and expand parameters together as Azure DevOps API doesn't allow it
  const workItems = await workItemTrackingApi.getWorkItems(
    args.ids,
    args.fields || ['System.Id', 'System.Title', 'System.State', 'System.Description', 'System.WorkItemType', 'System.AssignedTo', 'System.IterationPath', 'System.Tags'],
    args.asOf,
    args.fields ? undefined : WorkItemExpand.All, // Only use expand if fields is not provided
    args.errorPolicy,
    config.project
  );

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(workItems, null, 2),
      },
    ],
  };
}
