import { z } from 'zod'
import type { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js'
import { NetworkContext } from '@/common/network-context.js'

export const name = 'amcp__asset_freeze'
export const description =
  'Freeze or unfreeze an Algorand Standard Asset (ASA) for a specific account'

export const schema = z.object({
  sender: z.string().describe('The Algorand address with freeze authority for the asset'),
  assetId: z.number().describe('The ID of the asset to freeze/unfreeze'),
  account: z.string().describe('The account address to freeze/unfreeze the asset for'),
  frozen: z.boolean().describe('Whether to freeze (true) or unfreeze (false) the asset'),
  note: z.string().optional().describe('Optional note to include with the transaction'),
})

export function createHandler(networkContext: NetworkContext): ToolCallback<typeof schema.shape> {
  return async params => {
    try {
      const algorand = networkContext.getAlgorandClient()
      const network = networkContext.getCurrentNetwork()

      if (network === 'mainnet') {
        console.error('Warning: Asset freeze requested on mainnet')
      }

      const { sender, assetId, account, frozen, note } = params

      const freezeParams: any = {
        sender,
        assetId: BigInt(assetId),
        account,
        frozen,
        suppressLog: true,
      }

      if (note) freezeParams.note = note

      const result = await algorand.send.assetFreeze(freezeParams)

      const freezeDetails = [
        `Asset ${frozen ? 'Freeze' : 'Unfreeze'} Successful:`,
        ``,
        `Asset ID: ${assetId}`,
        `Account: ${account}`,
        `Freeze Status: ${frozen ? 'Frozen' : 'Unfrozen'}`,
        `Freeze Authority: ${sender}`,
        ``,
        `Transaction Details:`,
        `Transaction ID: ${result.transaction.txID()}`,
        `Confirmation Round: ${result.confirmation?.confirmedRound || 'Pending'}`,
        ``,
        `Note: The account ${frozen ? 'can no longer' : 'can now'} transfer this asset.`,
      ].join('\n')

      return {
        content: [
          {
            type: 'text',
            text: freezeDetails,
          },
        ],
      }
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error ${params.frozen ? 'freezing' : 'unfreezing'} asset: ${
              error.message || String(error)
            }`,
          },
        ],
        isError: true,
      }
    }
  }
}
