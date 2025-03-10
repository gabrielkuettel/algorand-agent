import { z } from 'zod'
import { algo } from '@algorandfoundation/algokit-utils'
import type { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js'
import { NetworkContext } from '@/common/network-context.js'

export const name = 'amcp__dispenser_ensure_funded'
export const description = 'Ensure an account has sufficient funds using the LocalNet dispenser'

export const schema = z.object({
  address: z.string().describe('The Algorand address to fund'),
  amount: z.number().describe('The minimum balance in Algos to ensure'),
})

export function createHandler(networkContext: NetworkContext): ToolCallback<typeof schema.shape> {
  return async ({ address, amount }) => {
    // Get current network
    const network = networkContext.getCurrentNetwork()

    // Dispenser only works on localnet
    if (network !== 'localnet') {
      return {
        content: [
          {
            type: 'text',
            text: `Error: Dispenser operations are only available on localnet. Current network: ${network}`,
          },
        ],
        isError: true,
      }
    }

    // Get the appropriate client for the current network
    const algorand = networkContext.getAlgorandClient()

    try {
      const dispenser = await algorand.account.localNetDispenser()
      const result = await algorand.account.ensureFunded(address, dispenser, algo(amount))

      if (!result) {
        return {
          content: [
            {
              type: 'text',
              text: `Account ${address} already has sufficient funds (${amount} Algos).`,
            },
          ],
        }
      }

      // Format the transaction details
      const txDetails = [
        `Funding Operation Successful:`,
        ``,
        `Account: ${address}`,
        `Amount: ${amount} Algos`,
        ``,
        `Transaction Details:`,
        `Transaction Group ID: ${result.groupId || 'N/A'}`,
        `Transaction IDs: ${result.txIds.join(', ')}`,
        `Confirmation Round: ${result.confirmation.confirmedRound}`,
        `Transaction Type: Payment`,
        `Sender: ${dispenser.addr}`,
        ``,
        `Note: The account now has sufficient funds for operations.`,
      ].join('\n')

      return {
        content: [
          {
            type: 'text',
            text: txDetails,
          },
        ],
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error funding account: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      }
    }
  }
}
