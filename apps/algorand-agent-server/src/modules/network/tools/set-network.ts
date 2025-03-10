import { z } from 'zod'
import type { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js'
import { NetworkContext } from '@/common/network-context.js'

export const name = 'amcp__set_network'
export const description = 'Set the current Algorand network to use'

export const schema = z.object({
  network: z
    .enum(['localnet', 'testnet', 'mainnet'])
    .describe('Network to use (localnet, testnet, mainnet)'),
})

export function createHandler(networkContext: NetworkContext): ToolCallback<typeof schema.shape> {
  return async ({ network }) => {
    try {
      const previousNetwork = networkContext.getCurrentNetwork()
      networkContext.setNetwork(network)

      // Add safety warning for mainnet
      let warningText = ''
      if (network === 'mainnet') {
        warningText =
          '\n\nWARNING: You are now operating on mainnet. All transactions will use real ALGO.'
      }

      return {
        content: [
          {
            type: 'text',
            text: `Network switched from ${previousNetwork} to ${network}.${warningText}`,
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error setting network: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      }
    }
  }
}
