import { z } from 'zod'
import type { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js'
import algosdk from 'algosdk'
import { NetworkContext } from '@/common/network-context.js'

export const name = 'aa__generate_account'
export const description = 'Generate a new random Algorand account'

export const schema = z.object({
  random_string: z.string().describe('Dummy parameter for no-parameter tools'),
})

export function createHandler(networkContext: NetworkContext): ToolCallback<typeof schema.shape> {
  return async () => {
    try {
      const algorand = networkContext.getAlgorandClient()

      const account = algorand.account.random()
      const mnemonic = account.account.sk
        ? algosdk.secretKeyToMnemonic(account.account.sk)
        : undefined

      const formattedInfo = [
        `Successfully generated a new Algorand account:`,
        ``,
        `Network: ${networkContext.getCurrentNetwork()}`,
        `Address: ${account.addr}`,
        `Mnemonic: ${mnemonic}`,
        ``,
        `Note: Keep your mnemonic phrase secure. It provides full access to your account.`,
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
            text: `Error generating account: ${
              error instanceof Error ? error.message : String(error)
            }`,
          },
        ],
        isError: true,
      }
    }
  }
}
