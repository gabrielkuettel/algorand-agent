import { z } from 'zod'
import type { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js'
import { NetworkContext } from '@/common/network-context.js'

export const name = 'amcp__asset_destroy'
export const description = 'Destroy an Algorand Standard Asset (ASA)'

export const schema = z.object({
  sender: z.string().describe('The Algorand address that is the manager of the asset'),
  assetId: z.number().describe('The ID of the asset to destroy'),
  note: z.string().optional().describe('Optional note to include with the transaction'),
})

export function createHandler(networkContext: NetworkContext): ToolCallback<typeof schema.shape> {
  return async params => {
    try {
      const algorand = networkContext.getAlgorandClient()
      const network = networkContext.getCurrentNetwork()

      if (network === 'mainnet') {
        console.error('Warning: Asset destruction requested on mainnet')
      }

      const { sender, assetId, note } = params

      const destroyParams: any = {
        sender,
        assetId: BigInt(assetId),
        suppressLog: true,
      }

      if (note) destroyParams.note = note

      const result = await algorand.send.assetDestroy(destroyParams)

      const destroyDetails = [
        `Asset Destruction Successful:`,
        ``,
        `Asset ID: ${assetId}`,
        `Manager: ${sender}`,
        ``,
        `Transaction Details:`,
        `Transaction ID: ${result.transaction.txID()}`,
        `Confirmation Round: ${result.confirmation?.confirmedRound || 'Pending'}`,
        ``,
        `Note: The asset has been permanently destroyed and can no longer be transferred.`,
      ].join('\n')

      return {
        content: [
          {
            type: 'text',
            text: destroyDetails,
          },
        ],
      }
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error destroying asset: ${error.message || String(error)}`,
          },
        ],
        isError: true,
      }
    }
  }
}
