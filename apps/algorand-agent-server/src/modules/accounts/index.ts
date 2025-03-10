import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import type { NetworkContext } from '@/common/network-context.js'
import * as generateAccount from './tools/account-random.js'
import * as getAccountInfo from './tools/account-get-information.js'
import * as createFromMnemonic from './tools/account-from-mnemonic.js'

export function registerAccountTools(server: McpServer, networkContext: NetworkContext) {
  server.tool(
    generateAccount.name,
    generateAccount.description,
    generateAccount.schema.shape,
    generateAccount.createHandler(networkContext)
  )

  server.tool(
    getAccountInfo.name,
    getAccountInfo.description,
    getAccountInfo.schema.shape,
    getAccountInfo.createHandler(networkContext)
  )

  server.tool(
    createFromMnemonic.name,
    createFromMnemonic.description,
    createFromMnemonic.schema.shape,
    createFromMnemonic.createHandler(networkContext)
  )
}
