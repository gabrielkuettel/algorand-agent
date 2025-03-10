import { z } from 'zod'
import type { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js'
import { NetworkContext } from '@/common/network-context.js'

export const name = 'aa__get_network'
export const description = 'Get the current Algorand network being used'

export const schema = z.object({})

export function createHandler(networkContext: NetworkContext): ToolCallback<typeof schema.shape> {
  return async () => {
    try {
      const network = networkContext.getCurrentNetwork()
      const algorand = networkContext.getAlgorandClient()

      const networkInfo = await algorand.client.network()

      return {
        content: [
          {
            type: 'text',
            text: `Current network: ${network}. Network information: ${JSON.stringify(
              networkInfo,
              null,
              2
            )}`,
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting network: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      }
    }
  }
}
