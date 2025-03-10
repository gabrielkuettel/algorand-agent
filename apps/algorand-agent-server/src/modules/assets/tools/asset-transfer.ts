import { z } from 'zod'
import type { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js'
import { NetworkContext } from '@/common/network-context.js'

export const name = 'aa__asset_transfer'
export const description = 'Transfer an Algorand Standard Asset (ASA) from one account to another'

export const schema = z.object({
  sender: z.string().describe('The Algorand address sending the asset'),
  receiver: z.string().describe('The Algorand address receiving the asset'),
  assetId: z.number().describe('The ID of the asset to transfer'),
  amount: z.number().describe('The amount of the asset to transfer'),
  note: z.string().optional().describe('Optional note to include with the transaction'),
  clawbackTarget: z
    .string()
    .optional()
    .describe(
      'If provided, the sender acts as the clawback address and will clawback assets from this address'
    ),
  closeAssetTo: z
    .string()
    .optional()
    .describe(
      'If provided, the remaining asset balance will be transferred to this address and the sender will be opted out'
    ),
})

export function createHandler(networkContext: NetworkContext): ToolCallback<typeof schema.shape> {
  return async params => {
    try {
      const algorand = networkContext.getAlgorandClient()
      const network = networkContext.getCurrentNetwork()

      if (network === 'mainnet') {
        console.error('Warning: Asset transfer requested on mainnet')
      }

      const { sender, receiver, assetId, amount, note, clawbackTarget, closeAssetTo } = params

      const transferParams: any = {
        sender,
        receiver,
        assetId: BigInt(assetId),
        amount: BigInt(amount),
        suppressLog: true,
      }

      if (note) transferParams.note = note
      if (clawbackTarget) transferParams.clawbackTarget = clawbackTarget
      if (closeAssetTo) transferParams.closeAssetTo = closeAssetTo

      const result = await algorand.send.assetTransfer(transferParams)

      const transferDetails = [
        `Asset Transfer Successful:`,
        ``,
        `Asset ID: ${assetId}`,
        `Amount: ${amount}`,
        `From: ${clawbackTarget || sender}`,
        `To: ${receiver}`,
        `${closeAssetTo ? `Close Remainder To: ${closeAssetTo}` : ''}`,
        ``,
        `Transaction Details:`,
        `Transaction ID: ${result.transaction.txID()}`,
        `Confirmation Round: ${result.confirmation?.confirmedRound || 'Pending'}`,
      ].join('\n')

      return {
        content: [
          {
            type: 'text',
            text: transferDetails,
          },
        ],
      }
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error transferring asset: ${error.message || String(error)}`,
          },
        ],
        isError: true,
      }
    }
  }
}
