import { NetworkContext } from '@/common/network-context.js'

export const name = 'network-list'
export const uri = 'network://list'

export function createHandler(networkContext: NetworkContext) {
  return async (uri: URL) => {
    const currentNetwork = networkContext.getCurrentNetwork()

    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(
            {
              networks: ['localnet', 'testnet', 'mainnet'],
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
