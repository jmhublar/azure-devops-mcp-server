import { ErrorCode, McpError } from '@modelcontextprotocol/sdk/types.js';
import { AzureDevOpsConnection } from '../../api/connection.js';
import { AzureDevOpsConfig } from '../../config/environment.js';
import { WorkItemBatchGetRequest, WorkItemExpand, WorkItemErrorPolicy } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces.js';

export async function getWorkItem(args: WorkItemBatchGetRequest, config: AzureDevOpsConfig) {
  if (!args.ids || !args.ids.length) {
    throw new McpError(ErrorCode.InvalidParams, 'Invalid work item ID');
  }

  // Log the arguments for debugging
  console.error('getWorkItem args:', JSON.stringify(args, null, 2));

  AzureDevOpsConnection.initialize(config);
  const connection = AzureDevOpsConnection.getInstance();
  const workItemTrackingApi = await connection.getWorkItemTrackingApi();

  // Always use fields parameter and never use expand parameter
  const defaultFields = ['System.Id', 'System.Title', 'System.State', 'System.Description', 'System.WorkItemType', 'System.AssignedTo', 'System.IterationPath', 'System.Tags'];
  
  const workItems = await workItemTrackingApi.getWorkItems(
    args.ids,
    args.fields || defaultFields,
    args.asOf,
    undefined, // Never use expand parameter
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
