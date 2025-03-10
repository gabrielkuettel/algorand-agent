import { z } from 'zod'
import type { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js'
import { NetworkContext } from '@/common/network-context.js'
import algosdk from 'algosdk'

export const name = 'aa__app_create_method_call'
export const description =
  'Create a new Algorand smart contract application with an ABI method call'

export const schema = z.object({
  sender: z.string().describe('The Algorand address that will create the application'),
  approvalProgram: z.string().describe('The TEAL approval program code for the application'),
  clearStateProgram: z.string().describe('The TEAL clear state program code for the application'),
  method: z
    .string()
    .describe(
      "The ABI method signature (e.g., 'add(uint64,uint64)uint64', 'greet()string', 'hello(string)void')"
    ),
  methodArgs: z
    .array(z.string())
    .optional()
    .describe('Arguments for the method call, matching the types in the method signature'),
  globalInts: z.number().optional().describe('Number of global integer variables (default: 0)'),
  globalBytes: z.number().optional().describe('Number of global byte slice variables (default: 0)'),
  localInts: z.number().optional().describe('Number of local integer variables (default: 0)'),
  localBytes: z.number().optional().describe('Number of local byte slice variables (default: 0)'),
  extraPages: z.number().optional().describe('Number of extra program pages (default: 0)'),
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
        console.error('Warning: Application creation requested on mainnet')
      }

      const {
        sender,
        approvalProgram,
        clearStateProgram,
        method,
        methodArgs = [],
        globalInts,
        globalBytes,
        localInts,
        localBytes,
        extraPages,
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
        approvalProgram,
        clearStateProgram,
        method: abiMethod,
        args: methodArgs,
        suppressLog: true,
      }

      // Add schema if provided
      if (
        globalInts !== undefined ||
        globalBytes !== undefined ||
        localInts !== undefined ||
        localBytes !== undefined
      ) {
        txParams.schema = {
          globalInts: globalInts || 0,
          globalByteSlices: globalBytes || 0,
          localInts: localInts || 0,
          localByteSlices: localBytes || 0,
        }
      }

      // Add extra pages if provided
      if (extraPages !== undefined) {
        txParams.extraProgramPages = extraPages
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
      const result = await algorand.send.appCreateMethodCall(txParams)
      const txId = result.transaction.txID()
      const txInfo = result.confirmation

      // Get the application ID
      const appId = txInfo?.applicationIndex || 'unknown'

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
        `Application Created Successfully:`,
        ``,
        `Application ID: ${appId}`,
        `Creator: ${sender}`,
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
      console.error('Error creating application:', errorMessage)

      return {
        content: [
          {
            type: 'text',
            text: `Error creating application: ${errorMessage}`,
          },
        ],
        isError: true,
      }
    }
  }
}
