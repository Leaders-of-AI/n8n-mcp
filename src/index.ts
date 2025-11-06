/**
 * n8n-MCP - Model Context Protocol Server for n8n
 * Copyright (c) 2024 AiAdvisors Romuald Czlonkowski
 * Licensed under the Sustainable Use License v1.0
 */

import { z } from 'zod';
import { N8NDocumentationMCPServer } from './mcp/server';
import { logger } from './utils/logger';
import { InstanceContext } from './types/instance-context';
import { TelemetryConfigManager } from './telemetry/config-manager';

// Engine exports for service integration
export { N8NMCPEngine, EngineHealth, EngineOptions } from './mcp-engine';
export { SingleSessionHTTPServer } from './http-server-single-session';
export { ConsoleManager } from './utils/console-manager';
export { N8NDocumentationMCPServer } from './mcp/server';

// Type exports for multi-tenant and library usage
export type {
  InstanceContext
} from './types/instance-context.js';
export {
  validateInstanceContext,
  isInstanceContext
} from './types/instance-context.js';

// Re-export MCP SDK types for convenience
export type {
  Tool,
  CallToolResult,
  ListToolsResult
} from '@modelcontextprotocol/sdk/types.js';

// Named export für legacy usage
import N8NMCPEngine from './mcp-engine.js';
export { N8NMCPEngine as Engine };

// ============================================================
// SMITHERY INTEGRATION
// ============================================================

/**
 * Smithery Configuration Schema
 * Defines user-configurable settings for the n8n-MCP server
 */
export const configSchema = z.object({
  N8N_API_URL: z.string()
    .url()
    .optional()
    .describe('n8n instance URL (e.g. https://app.n8n.cloud/api/v1)'),

  N8N_API_KEY: z.string()
    .optional()
    .describe('n8n API key for workflow management'),

  TELEMETRY_ENABLED: z.boolean()
    .optional()
    .default(true)
    .describe('Enable anonymous telemetry (see PRIVACY.md)'),
});

export type Config = z.infer<typeof configSchema>;

/**
 * Smithery Server Factory
 * Creates a new MCP server instance with user configuration
 */
export default function createServer({ config }: { config: Config }) {
  try {
    logger.info('Creating n8n-MCP server');
    logger.debug('Configuration:', {
      hasN8nUrl: !!config.N8N_API_URL,
      hasN8nKey: !!config.N8N_API_KEY,
      telemetryEnabled: config.TELEMETRY_ENABLED,
    });

    // Apply configuration to environment
    if (config.N8N_API_URL) {
      process.env.N8N_API_URL = config.N8N_API_URL;
    }
    if (config.N8N_API_KEY) {
      process.env.N8N_API_KEY = config.N8N_API_KEY;
    }

    // Configure telemetry
    const telemetryManager = TelemetryConfigManager.getInstance();
    if (config.TELEMETRY_ENABLED === false) {
      telemetryManager.disable();
    } else {
      telemetryManager.enable();
    }

    // Create instance context
    const instanceContext: InstanceContext = {
      instanceId: `smithery-${Date.now()}`,
      n8nApiUrl: config.N8N_API_URL,
      n8nApiKey: config.N8N_API_KEY,
    };

    // Create the MCP server
    const mcpServer = new N8NDocumentationMCPServer(
      instanceContext,
      undefined
    );

    logger.info('n8n-MCP server created successfully');

    // Return the underlying MCP server
    // @ts-ignore - accessing private property for Smithery
    return mcpServer.server;

  } catch (error) {
    logger.error('Failed to create n8n-MCP server:', error);
    throw error;
  }
}
