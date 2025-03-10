import { AlgorandClient } from '@algorandfoundation/algokit-utils'

export type NetworkType = 'localnet' | 'testnet' | 'mainnet'

export class NetworkContext {
  private currentNetwork: NetworkType = 'localnet'
  private readonly clients: Record<NetworkType, AlgorandClient>

  constructor(defaultNetwork: NetworkType = 'localnet') {
    this.clients = {
      localnet: AlgorandClient.defaultLocalNet(),
      testnet: AlgorandClient.testNet(),
      mainnet: AlgorandClient.mainNet(),
    }

    this.currentNetwork = defaultNetwork
  }

  getCurrentNetwork(): NetworkType {
    return this.currentNetwork
  }

  setNetwork(network: NetworkType): void {
    this.currentNetwork = network
  }

  getAlgorandClient(): AlgorandClient {
    return this.clients[this.currentNetwork]
  }

  getNetworkClient(network: NetworkType): AlgorandClient {
    return this.clients[network]
  }

  detectNetworkFromQuery(query: string): NetworkType {
    if (query.toLowerCase().includes('on testnet')) {
      this.setNetwork('testnet')
    } else if (query.toLowerCase().includes('on mainnet')) {
      this.setNetwork('mainnet')
    } else if (query.toLowerCase().includes('on localnet')) {
      this.setNetwork('localnet')
    }

    return this.currentNetwork
  }
}
