import { z } from 'zod'
import type { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js'
import { NetworkContext } from '@/common/network-context.js'
import algosdk from 'algosdk'

export const name = 'aa__app_delete_method_call'
export const description = 'Delete an Algorand smart contract application with an ABI method call'

export const schema = z.object({
  sender: z
    .string()
    .describe('The Algorand address that will delete the application (must be the creator)'),
  appId: z.string().describe('The ID of the application to delete'),
  method: z
    .string()
    .describe(
      "The ABI method signature (e.g., 'add(uint64,uint64)uint64', 'greet()string', 'hello(string)void')"
    ),
  methodArgs: z
    .array(z.string())
    .optional()
    .describe('Arguments for the method call, matching the types in the method signature'),
  onComplete: z
    .enum(['NoOp', 'OptIn', 'CloseOut'])
    .optional()
    .describe('The on-completion action for this transaction (default: NoOp)'),
  accountReferences: z
    .array(z.string())
    .optional()
    .describe('Account addresses to be referenced in the transaction'),
  appReferences: z
    .array(z.string())
    .optional()
    .describe('Application IDs to be referenced in the transaction'),
  assetReferences: z
    .array(z.string())
    .optional()
    .describe('Asset IDs to be referenced in the transaction'),
  boxReferences: z
    .array(
      z.union([
        z.string().describe('Box name'),
        z.object({
          name: z.string().describe('Box name'),
          appId: z.string().optional().describe('Application ID (defaults to the called app)'),
        }),
      ])
    )
    .optional()
    .describe('Box references to be included in the transaction'),
  note: z.string().optional().describe('Optional note to include with the transaction'),
  lease: z
    .string()
    .optional()
    .describe('Optional lease value (base64-encoded) to enforce mutual exclusion of transactions'),
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
        method,
        methodArgs = [],
        onComplete,
        accountReferences,
        appReferences,
        assetReferences,
        boxReferences,
        note,
        lease,
      } = params

      // Parse the method signature to create an ABIMethod object
      const abiMethod = algosdk.ABIMethod.fromSignature(method)

      // Create the transaction parameters
      const txParams: any = {
        sender,
        appId: BigInt(appId),
        method: abiMethod,
        args: methodArgs,
        suppressLog: true,
      }

      // Add optional parameters
      if (onComplete) {
        txParams.onComplete = getOnCompleteEnum(onComplete)
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
      const result = await algorand.send.appDeleteMethodCall(txParams)
      const txId = result.transaction.txID()
      const txInfo = result.confirmation

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
        `Method Called: ${method}`,
        `Arguments: ${methodArgs.length > 0 ? methodArgs.join(', ') : 'None'}`,
        `On Complete: ${onComplete || 'NoOp'}`,
        ``,
        `Transaction Details:`,
        `Transaction ID: ${txId}`,
        `Confirmation Round: ${txInfo?.confirmedRound || 'Pending'}`,
        ``,
        ...returnDetails,
      ]

      // Add raw logs to the response
      if (txInfo && txInfo.logs && txInfo.logs.length > 0) {
        appDetails.push(
          ``,
          `Raw Transaction Logs:`,
          ...txInfo.logs.map(
            log =>
              `- ${Buffer.from(log).toString('utf-8')} (hex: ${Buffer.from(log).toString('hex')})`
          )
        )
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
