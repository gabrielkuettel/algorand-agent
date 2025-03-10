import { z } from 'zod'
import type { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js'
import { NetworkContext } from '@/common/network-context.js'

export const name = 'aa__explorer_get_url'
export const description = 'Generate a URL to view an Algorand resource in Lora Explorer'

export const schema = z.object({
  network: z.enum(['mainnet', 'testnet', 'localnet']).default('localnet'),
  resourceType: z.enum(['transaction', 'block', 'asset', 'application', 'account']),
  resourceId: z.string(),
})

// Tool handler
export function createHandler(networkContext: NetworkContext): ToolCallback<typeof schema.shape> {
  return async args => {
    try {
      // If network is specified in args, update the network context
      if (args.network) {
        networkContext.setNetwork(args.network)
      } else {
        // Use the current network from context as default
        args.network = networkContext.getCurrentNetwork()
      }

      const url = `https://lora.algokit.io/${args.network}/${args.resourceType}/${args.resourceId}`

      // Format the explorer information in a more readable way
      const formattedInfo = [
        `Explorer URL Generated:`,
        ``,
        `Resource Details:`,
        `Network: ${args.network}`,
        `Resource Type: ${args.resourceType}`,
        `Resource ID: ${args.resourceId}`,
        ``,
        `URL:`,
        url,
        ``,
        `Note: Use this URL to view the ${args.resourceType} in the Lora Explorer.`,
      ].join('\n')

      return {
        content: [
          {
            type: 'text',
            text: formattedInfo,
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error generating explorer URL: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      }
    }
  }
}
