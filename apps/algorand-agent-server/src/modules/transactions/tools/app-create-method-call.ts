import { z } from 'zod'
import type { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js'
import { NetworkContext } from '@/common/network-context.js'
import algosdk from 'algosdk'

export const name = 'amcp__app_create_method_call'
export const description =
  'Create a new Algorand smart contract application with an ABI method call'

export const schema = z.object({
  sender: z.string().describe('The Algorand address that will create the application'),
  approvalProgram: z.string().describe('The TEAL approval program code for the application'),
  clearStateProgram: z.string().describe('The TEAL clear state program code for the application'),
  method: z
    .string()
    .describe(
      "The ABI method signature (e.g., 'add(uint64,uint64)', 'greet()', 'hello(string)void')"
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

      // Extract logs if available
      let logs: string[] = []
      if (txInfo && txInfo.logs && txInfo.logs.length > 0) {
        logs = txInfo.logs.map((log: Uint8Array) => {
          try {
            // Try to decode as UTF-8 string
            return Buffer.from(log).toString('utf-8')
          } catch (e) {
            // Return as base64 if not valid UTF-8
            return Buffer.from(log).toString('base64')
          }
        })
      }

      // For ABI method calls, we don't have direct access to return values
      // in the transaction response, so we'll extract them from logs if possible
      let returnValue = 'No return value'
      if (logs.length > 0) {
        // The last log entry might contain the return value
        try {
          const lastLog = logs[logs.length - 1]
          // Try to parse as JSON in case it's a structured return value
          const parsedLog = JSON.parse(lastLog)
          returnValue = JSON.stringify(parsedLog)
        } catch (e) {
          // If not JSON, use the last log as the return value
          returnValue = logs[logs.length - 1]
        }
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
      ]

      // Add return value if available
      appDetails.push(``, `Method Return Value:`, returnValue)

      // Add logs if available
      if (logs.length > 0) {
        appDetails.push(``, `Application Logs:`, ...logs.map(log => `- ${log}`))
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
      // Enhanced error handling
      let errorMessage = error.message || String(error)
      let helpfulTip = ''

      if (errorMessage.includes('invalid ApplicationArgs index')) {
        helpfulTip =
          "This error typically occurs when trying to access application arguments that weren't provided. Make sure you're passing the required arguments."
      } else if (errorMessage.includes('err opcode executed')) {
        helpfulTip =
          "The contract explicitly rejected the transaction with an 'err' opcode. Check your TEAL logic and arguments."
      } else if (errorMessage.includes('return arg 0 wanted type uint64')) {
        helpfulTip =
          "TEAL expects method returns to be properly formatted. For strings, use 'log' instead of direct returns, or implement proper ARC-4 return formatting."
      } else if (errorMessage.includes('program assembly failed')) {
        helpfulTip =
          "There's a syntax error in your TEAL code. Check for typos, missing opcodes, or incorrect arguments."
      }

      return {
        content: [
          {
            type: 'text',
            text: `Error creating application: ${errorMessage}\n\n${
              helpfulTip ? `Tip: ${helpfulTip}` : ''
            }`,
          },
        ],
        isError: true,
      }
    }
  }
}
