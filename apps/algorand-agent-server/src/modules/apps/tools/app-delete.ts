import { z } from 'zod'
import type { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js'
import { NetworkContext } from '@/common/network-context.js'
import algosdk from 'algosdk'

export const name = 'mcp__app_delete'
export const description =
  'Delete an Algorand smart contract application using bare (non-ABI) calls - useful for raw TEAL without ARC-4/ABI requirements'

export const schema = z.object({
  sender: z
    .string()
    .describe(
      'The Algorand address that will delete the application (must be the creator of the application)'
    ),
  appId: z
    .string()
    .describe('The ID of the application to delete (numeric value as a string, e.g., "12345")'),
  appArgs: z
    .array(z.string())
    .optional()
    .describe(
      'Arguments for the application call (strings will be encoded as UTF-8 or base64 bytes; numeric values should be passed as strings, e.g., "123")'
    ),
  onComplete: z
    .enum(['NoOp', 'OptIn', 'CloseOut'])
    .optional()
    .describe(
      'The on-completion action for this transaction (default: DeleteApplication). Note: This parameter is ignored for delete operations as DeleteApplication is always used.'
    ),
  accountReferences: z
    .array(z.string())
    .optional()
    .describe(
      'Account addresses to be referenced in the transaction (accessible via "txna Accounts i" in TEAL)'
    ),
  appReferences: z
    .array(z.string())
    .optional()
    .describe(
      'Application IDs to be referenced in the transaction (accessible via "txna Applications i" in TEAL)'
    ),
  assetReferences: z
    .array(z.string())
    .optional()
    .describe(
      'Asset IDs to be referenced in the transaction (accessible via "txna Assets i" in TEAL)'
    ),
  boxReferences: z
    .array(
      z.union([
        z.string().describe('Box name (will be encoded as UTF-8 bytes)'),
        z.object({
          name: z.string().describe('Box name (will be encoded as UTF-8 bytes)'),
          appId: z
            .string()
            .optional()
            .describe('Application ID (defaults to the called app if not specified)'),
        }),
      ])
    )
    .optional()
    .describe('Box references to be included in the transaction (for accessing app box storage)'),
  note: z
    .string()
    .optional()
    .describe('Optional note to include with the transaction (will be encoded as UTF-8 bytes)'),
  lease: z
    .string()
    .optional()
    .describe(
      'Optional lease value (base64-encoded) to enforce mutual exclusion of transactions (prevents duplicate submissions)'
    ),
})

// Helper function to convert onComplete string to algosdk enum
function getOnCompleteEnum(onComplete?: string): algosdk.OnApplicationComplete {
  switch (onComplete) {
    case 'OptIn':
      return algosdk.OnApplicationComplete.OptInOC
    case 'CloseOut':
      return algosdk.OnApplicationComplete.CloseOutOC
    default:
      return algosdk.OnApplicationComplete.NoOpOC
  }
}

// Helper function to convert string to Uint8Array (either base64 or UTF-8)
function stringToUint8Array(str: string): Uint8Array {
  try {
    // Try to decode as base64 first
    return Buffer.from(str, 'base64')
  } catch {
    // If not base64, treat as UTF-8
    return Buffer.from(str, 'utf-8')
  }
}

export function createHandler(networkContext: NetworkContext): ToolCallback<typeof schema.shape> {
  return async params => {
    try {
      // Get the appropriate client for the current network
      const algorand = networkContext.getAlgorandClient()

      // Get current network
      const network = networkContext.getCurrentNetwork()

      // Safety check for mainnet operations
      if (network === 'mainnet') {
        console.error('Warning: Application deletion requested on mainnet')
      }

      const {
        sender,
        appId,
        appArgs = [],
        onComplete,
        accountReferences,
        appReferences,
        assetReferences,
        boxReferences,
        note,
        lease,
      } = params

      // Create the transaction parameters
      const txParams: any = {
        sender,
        appId: BigInt(appId),
        args: appArgs.map(arg => stringToUint8Array(arg)),
        suppressLog: true,
        onComplete: algosdk.OnApplicationComplete.DeleteApplicationOC,
      }

      // Add optional parameters
      if (onComplete) {
        // Note: For delete, we always use DeleteApplicationOC regardless of what's passed
        console.warn(
          'Ignoring onComplete parameter for delete operation, using DeleteApplicationOC'
        )
      }

      if (accountReferences && accountReferences.length > 0) {
        txParams.accountReferences = accountReferences
      }

      if (appReferences && appReferences.length > 0) {
        txParams.appReferences = appReferences.map(id => BigInt(id))
      }

      if (assetReferences && assetReferences.length > 0) {
        txParams.assetReferences = assetReferences.map(id => BigInt(id))
      }

      if (boxReferences && boxReferences.length > 0) {
        txParams.boxReferences = boxReferences.map(box => {
          if (typeof box === 'string') {
            return box
          } else {
            return {
              name: box.name,
              appId: box.appId ? BigInt(box.appId) : undefined,
            }
          }
        })
      }

      if (note) {
        txParams.note = note
      }

      if (lease) {
        txParams.lease = lease
      }

      // Send the transaction
      const result = await algorand.send.appDelete(txParams)
      const txId = result.transaction.txID()
      const txInfo = result.confirmation

      // Extract logs if available
      let logs: string[] = []
      if (txInfo && txInfo.logs && txInfo.logs.length > 0) {
        logs = txInfo.logs.map((log: Uint8Array) => {
          try {
            // Try to decode as UTF-8 string
            const decoded = Buffer.from(log).toString('utf-8')
            // Try to parse as JSON if it looks like JSON
            if (
              (decoded.startsWith('{') && decoded.endsWith('}')) ||
              (decoded.startsWith('[') && decoded.endsWith(']'))
            ) {
              try {
                const parsed = JSON.parse(decoded)
                return `${JSON.stringify(parsed, null, 2)} (hex: ${Buffer.from(log).toString('hex')})`
              } catch {
                return `${decoded} (hex: ${Buffer.from(log).toString('hex')})`
              }
            }
            return `${decoded} (hex: ${Buffer.from(log).toString('hex')})`
          } catch (e) {
            // Return as base64 if not valid UTF-8
            return `Base64: ${Buffer.from(log).toString('base64')} (hex: ${Buffer.from(log).toString('hex')})`
          }
        })
      }

      // Get the return value directly if available
      let returnValue = 'No return value'
      let returnDetails = []

      if (result.return !== undefined) {
        if (result.return.decodeError === undefined) {
          // Successfully decoded return value
          returnValue = JSON.stringify(result.return.returnValue)
          returnDetails = [
            `Method Return Value:`,
            returnValue,
            `Return Type: ${result.return.method.returns?.type?.toString() || 'void'}`,
          ]
        } else {
          // There was an error decoding the return value
          returnValue = `Error decoding return value: ${result.return.decodeError.message}`
          returnDetails = [`Method Return Error:`, returnValue]
        }
      } else {
        returnDetails = [`Method Return Value:`, returnValue]
      }

      // Format the response
      const appDetails = [
        `Application Deleted Successfully:`,
        ``,
        `Application ID: ${appId}`,
        `Deleter: ${sender}`,
        `Arguments: ${appArgs.length > 0 ? appArgs.join(', ') : 'None'}`,
        ``,
        `Transaction Details:`,
        `Transaction ID: ${txId}`,
        `Confirmation Round: ${txInfo?.confirmedRound || 'Pending'}`,
        ``,
        ...returnDetails,
      ]

      // Add logs if available
      if (logs.length > 0) {
        appDetails.push(``, `Raw Transaction Logs:`, ...logs.map(log => `- ${log}`))
      } else {
        appDetails.push(``, `Raw Transaction Logs:`, `- No logs found in this transaction`)
      }

      return {
        content: [
          {
            type: 'text',
            text: appDetails.join('\n'),
          },
        ],
      }
    } catch (error: any) {
      const errorMessage = error.message || String(error)
      console.error('Error deleting application:', errorMessage)

      return {
        content: [
          {
            type: 'text',
            text: `Error deleting application: ${errorMessage}`,
          },
        ],
        isError: true,
      }
    }
  }
}
