import { z } from 'zod'
import type { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js'
import { NetworkContext } from '@/common/network-context.js'

export const name = 'amcp__account_from_mnemonic'
export const description = 'Create an Algorand account from a mnemonic phrase'

export const schema = z.object({
  mnemonic: z.string().describe('The 25-word mnemonic phrase'),
})

// Tool handler
export function createHandler(networkContext: NetworkContext): ToolCallback<typeof schema.shape> {
  return async ({ mnemonic }) => {
    try {
      const algorand = networkContext.getAlgorandClient()
      const network = networkContext.getCurrentNetwork()
      const account = algorand.account.fromMnemonic(mnemonic)

      let accountInfo
      try {
        accountInfo = await algorand.account.getInformation(account.addr)
      } catch (error) {
        accountInfo = null
      }

      const formattedInfo = [
        `Successfully restored account from mnemonic:`,
        ``,
        `Network: ${network}`,
        `Address: ${account.addr}`,
      ]

      // Add account information if available
      if (accountInfo) {
        const balance = Number(accountInfo.amountWithoutPendingRewards || 0)
        formattedInfo.push(
          ``,
          `Account Status:`,
          `Balance: ${balance} microAlgos (${balance / 1_000_000} Algos)`,
          `Minimum Balance: ${accountInfo.minBalance || 0} microAlgos`,
          `Status: ${accountInfo.status || 'Unknown'}`,
          `Total Apps Opted In: ${accountInfo.appsLocalState?.length || 0}`,
          `Total Assets Opted In: ${accountInfo.assets?.length || 0}`
        )
      } else {
        formattedInfo.push(``, `Note: This account does not appear to exist on-chain yet.`)
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
            text: `Error restoring account: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      }
    }
  }
}
