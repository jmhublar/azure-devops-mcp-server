import { env } from 'process';
import { ConfigurationError } from '../errors.js';

export interface AzureDevOpsConfig {
  pat: string;
  org: string;
  project: string;
  orgUrl: string;
  // TLS_INSECURE is handled separately via process.env.TLS_INSECURE
}

/**
 * Environment variables:
 * - AZURE_DEVOPS_PAT: Personal Access Token for Azure DevOps
 * - AZURE_DEVOPS_ORG: Azure DevOps organization name
 * - AZURE_DEVOPS_PROJECT: Azure DevOps project name
 * - TLS_INSECURE: Set to 'true' to bypass TLS certificate validation (not recommended for production)
 */

function validateConfigValue(value: string | undefined, name: string): string {
  if (!value || value.trim() === '') {
    throw new ConfigurationError(
      `${name} is required and must be provided either through environment variables or constructor options`
    );
  }
  return value.trim();
}

export function createConfig(options?: Partial<AzureDevOpsConfig>): AzureDevOpsConfig {
  const PAT = validateConfigValue(
    options?.pat ?? env.AZURE_DEVOPS_PAT,
    'Personal Access Token (pat)'
  );
  const ORG = validateConfigValue(
    options?.org ?? env.AZURE_DEVOPS_ORG,
    'Organization (org)'
  );
  const PROJECT = validateConfigValue(
    options?.project ?? env.AZURE_DEVOPS_PROJECT,
    'Project (project)'
  );

  if (!ORG.match(/^[a-zA-Z0-9-_]+$/)) {
    throw new ConfigurationError(
      'Organization name must contain only alphanumeric characters, hyphens, and underscores'
    );
  }

  return {
    pat: PAT,
    org: ORG,
    project: PROJECT,
    orgUrl: `https://dev.azure.com/${ORG}`,
  };
}
