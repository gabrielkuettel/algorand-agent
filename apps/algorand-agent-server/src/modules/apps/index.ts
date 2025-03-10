import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { NetworkContext } from '@/common/network-context.js'
import * as appCallMethodCall from './tools/app-call-method-call.js'
import * as appCreateMethodCall from './tools/app-create-method-call.js'
import * as appUpdateMethodCall from './tools/app-update-method-call.js'
import * as appDeleteMethodCall from './tools/app-delete-method-call.js'
import * as appCall from './tools/app-call.js'
import * as appCreate from './tools/app-create.js'
import * as appUpdate from './tools/app-update.js'
import * as appDelete from './tools/app-delete.js'

export function registerAppTools(server: McpServer, networkContext: NetworkContext) {
  server.tool(
    appCallMethodCall.name,
    appCallMethodCall.description,
    appCallMethodCall.schema.shape,
    appCallMethodCall.createHandler(networkContext)
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

  // Register bare (non-ABI) app call tools
  server.tool(
    appCall.name,
    appCall.description,
    appCall.schema.shape,
    appCall.createHandler(networkContext)
  )

  server.tool(
    appCreate.name,
    appCreate.description,
    appCreate.schema.shape,
    appCreate.createHandler(networkContext)
  )

  server.tool(
    appUpdate.name,
    appUpdate.description,
    appUpdate.schema.shape,
    appUpdate.createHandler(networkContext)
  )

  server.tool(
    appDelete.name,
    appDelete.description,
    appDelete.schema.shape,
    appDelete.createHandler(networkContext)
  )
}
