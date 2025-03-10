import { NetworkContext } from '@/common/network-context.js'

export const name = 'network-current'
export const uri = 'network://current'

export function createHandler(networkContext: NetworkContext) {
  return async (uri: URL) => {
    const currentNetwork = networkContext.getCurrentNetwork()

    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(
            {
              current: currentNetwork,
              timestamp: new Date().toISOString(),
            },
            null,
            2
          ),
        },
      ],
    }
  }
}
