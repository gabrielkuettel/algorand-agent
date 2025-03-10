import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { NetworkContext } from '@/common/network-context.js'
import * as appCallMethod from './tools/app-call-method.js'
import * as appCreateMethodCall from './tools/app-create-method-call.js'
import * as appUpdateMethodCall from './tools/app-update-method-call.js'
import * as appDeleteMethodCall from './tools/app-delete-method-call.js'

export function registerAppTools(server: McpServer, networkContext: NetworkContext) {
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
