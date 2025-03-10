import { z } from 'zod'
import type { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js'
import { NetworkContext } from '@/common/network-context.js'

export const name = 'aa__account_get_information'
export const description = 'Get information about an Algorand account'

export const schema = z.object({
  address: z.string().describe('The Algorand address to look up'),
})

// Tool handler
export function createHandler(networkContext: NetworkContext): ToolCallback<typeof schema.shape> {
  return async ({ address }) => {
    try {
      const algorand = networkContext.getAlgorandClient()
      const network = networkContext.getCurrentNetwork()

      const accountInfo = await algorand.account.getInformation(address)

      const balance = Number(accountInfo.amountWithoutPendingRewards || 0)
      const formattedInfo = [
        `Account Information:`,
        ``,
        `Network: ${network}`,
        `Address: ${address}`,
        ``,
        `Balance Information:`,
        `Balance: ${balance} microAlgos (${balance / 1_000_000} Algos)`,
        `Minimum Balance: ${accountInfo.minBalance || 0} microAlgos`,
        `Pending Rewards: ${accountInfo.pendingRewards || 0} microAlgos`,
        ``,
        `Account Status:`,
        `Status: ${accountInfo.status || 'Unknown'}`,
        ``,
        `Applications:`,
        `Total Apps Opted In: ${accountInfo.appsLocalState?.length || 0}`,
        `Created Apps: ${accountInfo.createdApps?.length || 0}`,
        ``,
        `Assets:`,
        `Total Assets Opted In: ${accountInfo.assets?.length || 0}`,
        `Created Assets: ${accountInfo.createdAssets?.length || 0}`,
      ]

      // Add asset details if there are any
      if (accountInfo.assets && accountInfo.assets.length > 0) {
        formattedInfo.push(``, `Asset Holdings (first 5):`)

        accountInfo.assets.slice(0, 5).forEach((asset, index) => {
          formattedInfo.push(
            `Asset #${index + 1}: ID ${asset.assetId}, Amount: ${
              asset.amount
            }, Frozen: ${asset.isFrozen ? 'Yes' : 'No'}`
          )
        })

        if (accountInfo.assets.length > 5) {
          formattedInfo.push(`... and ${accountInfo.assets.length - 5} more assets`)
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: formattedInfo.join('\n'),
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error retrieving account information: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      }
    }
  }
}
