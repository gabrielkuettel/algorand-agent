import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { NetworkContext } from '@/common/network-context.js'
import * as setNetwork from './set-network.js'
import * as getNetwork from './get-network.js'

export function registerNetworkTools(server: McpServer, networkContext: NetworkContext) {
  server.tool(
    setNetwork.name,
    setNetwork.description,
    setNetwork.schema.shape,
    setNetwork.createHandler(networkContext)
  )

  server.tool(
    getNetwork.name,
    getNetwork.description,
    getNetwork.schema.shape,
    getNetwork.createHandler(networkContext)
  )
}
