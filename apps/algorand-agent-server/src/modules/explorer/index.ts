import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import * as getExplorerUrl from './tools/explorer-get-url.js'
import { NetworkContext } from '@/common/network-context.js'

export function registerExplorerTools(server: McpServer, networkContext: NetworkContext) {
  server.tool(
    getExplorerUrl.name,
    getExplorerUrl.description,
    getExplorerUrl.schema.shape,
    getExplorerUrl.createHandler(networkContext)
  )
}
