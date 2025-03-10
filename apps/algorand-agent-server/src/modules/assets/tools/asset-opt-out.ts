import { z } from 'zod'
import type { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js'
import { NetworkContext } from '@/common/network-context.js'

export const name = 'aa__asset_opt_out'
export const description = 'Opt an account out of an Algorand Standard Asset (ASA)'

export const schema = z.object({
  sender: z.string().describe('The Algorand address to opt out of the asset'),
  assetId: z.number().describe('The ID of the asset to opt out of'),
  creator: z
    .string()
    .optional()
    .describe(
      'The creator address of the asset (if not provided, it will be retrieved from algod)'
    ),
  ensureZeroBalance: z
    .boolean()
    .describe('Whether to ensure the account has a zero balance before opting out'),
  note: z.string().optional().describe('Optional note to include with the transaction'),
})

export function createHandler(networkContext: NetworkContext): ToolCallback<typeof schema.shape> {
  return async params => {
    try {
      const algorand = networkContext.getAlgorandClient()
      const network = networkContext.getCurrentNetwork()

      if (network === 'mainnet') {
        console.error('Warning: Asset opt-out requested on mainnet')
      }

      const { sender, assetId, creator, ensureZeroBalance, note } = params

      const optOutParams: any = {
        sender,
        assetId: BigInt(assetId),
        ensureZeroBalance,
        suppressLog: true,
      }

      if (creator) optOutParams.creator = creator
      if (note) optOutParams.note = note

      const result = await algorand.send.assetOptOut(optOutParams)

      const optOutDetails = [
        `Asset Opt-Out Successful:`,
        ``,
        `Account: ${sender}`,
        `Asset ID: ${assetId}`,
        `${creator ? `Asset Creator: ${creator}` : ''}`,
        ``,
        `Transaction Details:`,
        `Transaction ID: ${result.transaction.txID()}`,
        `Confirmation Round: ${result.confirmation?.confirmedRound || 'Pending'}`,
        ``,
        `Note: The account is now opted out of this asset and can no longer hold it.`,
      ].join('\n')

      return {
        content: [
          {
            type: 'text',
            text: optOutDetails,
          },
        ],
      }
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error opting out of asset: ${error.message || String(error)}`,
          },
        ],
        isError: true,
      }
    }
  }
}
