import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { NetworkContext } from '@/common/network-context.js'
import * as sendPayment from './tools/send-payment.js'

export function registerPaymentTools(server: McpServer, networkContext: NetworkContext) {
  // Payment transactions
  server.tool(
    sendPayment.name,
    sendPayment.description,
    sendPayment.schema.shape,
    sendPayment.createHandler(networkContext)
  )
}
