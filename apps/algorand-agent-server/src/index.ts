#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { registerAccountTools } from '@/modules/accounts/index.js'
import { registerDispenserTools } from '@/modules/dispenser/index.js'
import { registerExplorerTools } from '@/modules/explorer/index.js'
import { registerTransactionTools } from '@/modules/transactions/index.js'
import { NetworkContext, registerNetwork } from '@/modules/network/index.js'

// Create network context with localnet default
const networkContext = new NetworkContext('localnet')

const server = new McpServer({
  name: 'algorand-mcp',
  version: '1.0.0',
  capabilities: {
    tools: {},
    resources: {},
  },
})

// Register network module first (includes both tools and resources)
registerNetwork(server, networkContext)

// Register other tools
registerAccountTools(server, networkContext)
registerDispenserTools(server, networkContext)
registerExplorerTools(server, networkContext)
registerTransactionTools(server, networkContext)

async function runServer() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  // Log to stderr to avoid interfering with stdio-based protocol communication
  console.error('Algorand MCP Server running on stdio')
}

// Run the server
runServer().catch(err => {
  console.error('Error running server:', err)
  process.exit(1)
})
