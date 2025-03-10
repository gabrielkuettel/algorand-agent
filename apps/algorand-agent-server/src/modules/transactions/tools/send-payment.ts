import { z } from 'zod'
import { algo } from '@algorandfoundation/algokit-utils'
import type { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js'
import { NetworkContext } from '@/common/network-context.js'

export const name = 'mcp__send_payment'
export const description = 'Send Algos from one account to another'

export const schema = z.object({
  sender: z.string().describe('The Algorand address sending the payment'),
  receiver: z.string().describe('The Algorand address receiving the payment'),
  amount: z.number().describe('The amount of Algos to send'),
  note: z.string().optional().describe('Optional note to include with the transaction'),
  closeRemainderTo: z
    .string()
    .optional()
    .describe('Optional address to close remainder of account to'),
})

export function createHandler(networkContext: NetworkContext): ToolCallback<typeof schema.shape> {
  return async params => {
    try {
      const { sender, receiver, amount, note, closeRemainderTo } = params

      const algorand = networkContext.getAlgorandClient()
      const network = networkContext.getCurrentNetwork()

      if (network === 'mainnet') {
        console.error('Warning: Payment transaction requested on mainnet')
      }

      const algoAmount = algo(amount)
      const paymentParams: any = {
        sender,
        receiver,
        amount: algoAmount,
      }

      if (note) paymentParams.note = note
      if (closeRemainderTo) paymentParams.closeRemainderTo = closeRemainderTo

      const result = await algorand.send.payment({
        ...paymentParams,
        suppressLog: true,
      })

      const txDetails = [
        `Payment Transaction Successful:`,
        ``,
        `Network: ${network}`,
        `From: ${sender}`,
        `To: ${receiver}`,
        `Amount: ${amount} Algos`,
        ``,
        `Transaction Details:`,
        `Transaction ID: ${result.transaction.txID()}`,
        `Confirmation Round: ${result.confirmation?.confirmedRound || 'Pending'}`,
      ].join('\n')

      return {
        content: [
          {
            type: 'text',
            text: txDetails,
          },
        ],
      }
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error sending payment: ${error.message || String(error)}`,
          },
        ],
        isError: true,
      }
    }
  }
}
