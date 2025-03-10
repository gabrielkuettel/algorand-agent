import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { NetworkContext } from '@/common/network-context.js'
import { registerNetworkTools } from './tools/index.js'
import { registerNetworkResources } from './resources/index.js'

export function registerNetwork(server: McpServer, networkContext: NetworkContext) {
  registerNetworkTools(server, networkContext)
  registerNetworkResources(server, networkContext)
}

export { NetworkContext } from '@/common/network-context.js'
