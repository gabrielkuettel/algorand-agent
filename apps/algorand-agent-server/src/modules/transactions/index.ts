import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { NetworkContext } from '@/common/network-context.js'
import * as sendPayment from './tools/send-payment.js'
import * as assetCreate from './tools/asset-create.js'
import * as assetConfig from './tools/asset-config.js'
import * as assetTransfer from './tools/asset-transfer.js'
import * as assetOptIn from './tools/asset-opt-in.js'
import * as assetOptOut from './tools/asset-opt-out.js'
import * as assetFreeze from './tools/asset-freeze.js'
import * as assetDestroy from './tools/asset-destroy.js'
import * as appCallMethod from './tools/app-call-method.js'
import * as appCreateMethodCall from './tools/app-create-method-call.js'
import * as appUpdateMethodCall from './tools/app-update-method-call.js'
import * as appDeleteMethodCall from './tools/app-delete-method-call.js'

export function registerTransactionTools(server: McpServer, networkContext: NetworkContext) {
  // Payment transactions
  server.tool(
    sendPayment.name,
    sendPayment.description,
    sendPayment.schema.shape,
    sendPayment.createHandler(networkContext)
  )

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

  // ABI Method Call transactions
  server.tool(
    appCallMethod.name,
    appCallMethod.description,
    appCallMethod.schema.shape,
    appCallMethod.createHandler(networkContext)
  )

  server.tool(
    appCreateMethodCall.name,
    appCreateMethodCall.description,
    appCreateMethodCall.schema.shape,
    appCreateMethodCall.createHandler(networkContext)
  )

  server.tool(
    appUpdateMethodCall.name,
    appUpdateMethodCall.description,
    appUpdateMethodCall.schema.shape,
    appUpdateMethodCall.createHandler(networkContext)
  )

  server.tool(
    appDeleteMethodCall.name,
    appDeleteMethodCall.description,
    appDeleteMethodCall.schema.shape,
    appDeleteMethodCall.createHandler(networkContext)
  )
}
