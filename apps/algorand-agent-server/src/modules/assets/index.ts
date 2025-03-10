import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { NetworkContext } from '@/common/network-context.js'
import * as assetCreate from './tools/asset-create.js'
import * as assetConfig from './tools/asset-config.js'
import * as assetTransfer from './tools/asset-transfer.js'
import * as assetOptIn from './tools/asset-opt-in.js'
import * as assetOptOut from './tools/asset-opt-out.js'
import * as assetFreeze from './tools/asset-freeze.js'
import * as assetDestroy from './tools/asset-destroy.js'

export function registerAssetTools(server: McpServer, networkContext: NetworkContext) {
  // Asset transactions
  server.tool(
    assetCreate.name,
    assetCreate.description,
    assetCreate.schema.shape,
    assetCreate.createHandler(networkContext)
  )

  server.tool(
    assetConfig.name,
    assetConfig.description,
    assetConfig.schema.shape,
    assetConfig.createHandler(networkContext)
  )

  server.tool(
    assetTransfer.name,
    assetTransfer.description,
    assetTransfer.schema.shape,
    assetTransfer.createHandler(networkContext)
  )

  server.tool(
    assetOptIn.name,
    assetOptIn.description,
    assetOptIn.schema.shape,
    assetOptIn.createHandler(networkContext)
  )

  server.tool(
    assetOptOut.name,
    assetOptOut.description,
    assetOptOut.schema.shape,
    assetOptOut.createHandler(networkContext)
  )

  server.tool(
    assetFreeze.name,
    assetFreeze.description,
    assetFreeze.schema.shape,
    assetFreeze.createHandler(networkContext)
  )

  server.tool(
    assetDestroy.name,
    assetDestroy.description,
    assetDestroy.schema.shape,
    assetDestroy.createHandler(networkContext)
  )
}
