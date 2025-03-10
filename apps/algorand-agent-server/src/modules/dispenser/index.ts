import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import * as ensureFunded from './tools/dispenser-ensure-funded.js'
import { NetworkContext } from '@/common/network-context.js'

export function registerDispenserTools(server: McpServer, networkContext: NetworkContext) {
  server.tool(
    ensureFunded.name,
    ensureFunded.description,
    ensureFunded.schema.shape,
    ensureFunded.createHandler(networkContext)
  )
}
