import { z } from 'zod'
import type { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js'
import { NetworkContext } from '@/common/network-context.js'

export const name = 'aa__asset_config'
export const description = 'Configure an existing Algorand Standard Asset (ASA)'

export const schema = z.object({
  sender: z.string().describe('The Algorand address that is the current manager of the asset'),
  assetId: z.number().describe('The ID of the asset to configure'),
  manager: z
    .string()
    .optional()
    .describe('The new address of the account that can manage the configuration of the asset'),
  reserve: z
    .string()
    .optional()
    .describe('The new address of the account that holds the reserve of this asset'),
  freeze: z
    .string()
    .optional()
    .describe('The new address of the account that can freeze or unfreeze the asset'),
  clawback: z
    .string()
    .optional()
    .describe('The new address of the account that can clawback holdings of this asset'),
  note: z.string().optional().describe('Optional note to include with the transaction'),
})

export function createHandler(networkContext: NetworkContext): ToolCallback<typeof schema.shape> {
  return async params => {
    try {
      const algorand = networkContext.getAlgorandClient()
      const network = networkContext.getCurrentNetwork()

      if (network === 'mainnet') {
        console.error('Warning: Asset configuration requested on mainnet')
      }

      const { sender, assetId, manager, reserve, freeze, clawback, note } = params

      const configParams: any = {
        sender,
        assetId: BigInt(assetId),
        manager: manager || undefined,
        suppressLog: true,
      }

      if (reserve !== undefined) configParams.reserve = reserve
      if (freeze !== undefined) configParams.freeze = freeze
      if (clawback !== undefined) configParams.clawback = clawback
      if (note) configParams.note = note

      const result = await algorand.send.assetConfig(configParams)

      const configDetails = [
        `Asset Configuration Successful:`,
        ``,
        `Asset ID: ${assetId}`,
        `Manager: ${sender}`,
        ``,
        `New Configuration:`,
        `New Manager: ${manager || 'No change'}`,
        `New Reserve: ${reserve || 'No change'}`,
        `New Freeze: ${freeze || 'No change'}`,
        `New Clawback: ${clawback || 'No change'}`,
        ``,
        `Transaction Details:`,
        `Transaction ID: ${result.transaction.txID()}`,
        `Confirmation Round: ${result.confirmation?.confirmedRound || 'Pending'}`,
      ].join('\n')

      return {
        content: [
          {
            type: 'text',
            text: configDetails,
          },
        ],
      }
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error configuring asset: ${error.message || String(error)}`,
          },
        ],
        isError: true,
      }
    }
  }
}
