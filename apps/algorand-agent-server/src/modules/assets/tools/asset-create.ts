import { z } from 'zod'
import type { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js'
import { NetworkContext } from '@/common/network-context.js'

export const name = 'mcp__asset_create'
export const description = 'Create a new Algorand Standard Asset (ASA)'

export const schema = z.object({
  sender: z.string().describe('The Algorand address that will create and manage the asset'),
  total: z.number().describe('The total number of units of this asset'),
  decimals: z.number().optional().describe('The number of decimals for the asset (default: 0)'),
  assetName: z.string().optional().describe('The name of the asset'),
  unitName: z.string().optional().describe('The unit name of the asset'),
  url: z
    .string()
    .optional()
    .describe('A URL where more information about the asset can be retrieved'),
  metadataHash: z
    .string()
    .optional()
    .describe('A hash of some metadata that is relevant to this asset'),
  defaultFrozen: z.boolean().optional().describe('Whether the asset should be frozen by default'),
  manager: z
    .string()
    .optional()
    .describe('The address of the account that can manage the configuration of the asset'),
  reserve: z
    .string()
    .optional()
    .describe('The address of the account that holds the reserve of this asset'),
  freeze: z
    .string()
    .optional()
    .describe('The address of the account that can freeze or unfreeze the asset'),
  clawback: z
    .string()
    .optional()
    .describe('The address of the account that can clawback holdings of this asset'),
  note: z.string().optional().describe('Optional note to include with the transaction'),
})

export function createHandler(networkContext: NetworkContext): ToolCallback<typeof schema.shape> {
  return async params => {
    try {
      const algorand = networkContext.getAlgorandClient()
      const network = networkContext.getCurrentNetwork()

      if (network === 'mainnet') {
        console.error('Warning: Asset creation requested on mainnet')
      }

      const {
        sender,
        total,
        decimals,
        assetName,
        unitName,
        url,
        metadataHash,
        defaultFrozen,
        manager,
        reserve,
        freeze,
        clawback,
        note,
      } = params

      const assetParams: any = {
        sender,
        total: BigInt(total),
        suppressLog: true,
      }

      if (decimals !== undefined) assetParams.decimals = decimals
      if (assetName) assetParams.assetName = assetName
      if (unitName) assetParams.unitName = unitName
      if (url) assetParams.url = url
      if (metadataHash) assetParams.metadataHash = metadataHash
      if (defaultFrozen !== undefined) assetParams.defaultFrozen = defaultFrozen
      if (manager) assetParams.manager = manager
      if (reserve) assetParams.reserve = reserve
      if (freeze) assetParams.freeze = freeze
      if (clawback) assetParams.clawback = clawback
      if (note) assetParams.note = note

      const result = await algorand.send.assetCreate(assetParams)

      const assetDetails = [
        `Asset Creation Successful:`,
        ``,
        `Asset ID: ${result.assetId}`,
        `Creator: ${sender}`,
        `Total Supply: ${total}${decimals ? ` with ${decimals} decimals` : ''}`,
        ``,
        `Asset Configuration:`,
        `Name: ${assetName || 'Not specified'}`,
        `Unit Name: ${unitName || 'Not specified'}`,
        `URL: ${url || 'Not specified'}`,
        `Default Frozen: ${defaultFrozen !== undefined ? defaultFrozen : 'Not specified'}`,
        ``,
        `Transaction Details:`,
        `Transaction ID: ${result.transaction.txID()}`,
        `Confirmation Round: ${result.confirmation?.confirmedRound || 'Pending'}`,
      ].join('\n')

      return {
        content: [
          {
            type: 'text',
            text: assetDetails,
          },
        ],
      }
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error creating asset: ${error.message || String(error)}`,
          },
        ],
        isError: true,
      }
    }
  }
}
