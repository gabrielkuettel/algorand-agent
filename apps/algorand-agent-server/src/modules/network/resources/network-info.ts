import { NetworkContext, NetworkType } from '@/common/network-context.js'

export const localnetName = 'network-localnet'
export const testnetName = 'network-testnet'
export const mainnetName = 'network-mainnet'

export const localnetUri = 'network://localnet'
export const testnetUri = 'network://testnet'
export const mainnetUri = 'network://mainnet'

export function createNetworkInfoHandler(
  networkContext: NetworkContext,
  targetNetwork: NetworkType
) {
  return async (uri: URL) => {
    const currentNetwork = networkContext.getCurrentNetwork()
    const isActive = currentNetwork === targetNetwork

    return {
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(
            {
              network: targetNetwork,
              isActive,
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
