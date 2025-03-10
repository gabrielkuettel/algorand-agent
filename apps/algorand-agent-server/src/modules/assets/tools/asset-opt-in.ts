import { z } from 'zod'
import type { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js'
import { NetworkContext } from '@/common/network-context.js'

export const name = 'mcp__asset_opt_in'
export const description = 'Opt an account into an Algorand Standard Asset (ASA)'

export const schema = z.object({
  sender: z.string().describe('The Algorand address to opt into the asset'),
  assetId: z.number().describe('The ID of the asset to opt into'),
  note: z.string().optional().describe('Optional note to include with the transaction'),
})

export function createHandler(networkContext: NetworkContext): ToolCallback<typeof schema.shape> {
  return async params => {
    try {
      const algorand = networkContext.getAlgorandClient()
      const network = networkContext.getCurrentNetwork()

      if (network === 'mainnet') {
        console.error('Warning: Asset opt-in requested on mainnet')
      }

      const { sender, assetId, note } = params

      const optInParams: any = {
        sender,
        assetId: BigInt(assetId),
        suppressLog: true,
      }

      if (note) optInParams.note = note

      const result = await algorand.send.assetOptIn(optInParams)

      const optInDetails = [
        `Asset Opt-In Successful:`,
        ``,
        `Account: ${sender}`,
        `Asset ID: ${assetId}`,
        ``,
        `Transaction Details:`,
        `Transaction ID: ${result.transaction.txID()}`,
        `Confirmation Round: ${result.confirmation?.confirmedRound || 'Pending'}`,
        ``,
        `Note: The account is now able to receive this asset.`,
      ].join('\n')

      return {
        content: [
          {
            type: 'text',
            text: optInDetails,
          },
        ],
      }
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error opting into asset: ${error.message || String(error)}`,
          },
        ],
        isError: true,
      }
    }
  }
}
