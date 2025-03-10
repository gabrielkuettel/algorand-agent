import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { NetworkContext } from '@/common/network-context.js'
import * as networkCurrent from './network-current.js'
import * as networkList from './network-list.js'
import * as networkInfo from './network-info.js'

export function registerNetworkResources(server: McpServer, networkContext: NetworkContext) {
  server.resource(
    networkCurrent.name,
    networkCurrent.uri,
    networkCurrent.createHandler(networkContext)
  )

  server.resource(networkList.name, networkList.uri, networkList.createHandler(networkContext))

  server.resource(
    networkInfo.localnetName,
    networkInfo.localnetUri,
    networkInfo.createNetworkInfoHandler(networkContext, 'localnet')
  )

  server.resource(
    networkInfo.testnetName,
    networkInfo.testnetUri,
    networkInfo.createNetworkInfoHandler(networkContext, 'testnet')
  )

  server.resource(
    networkInfo.mainnetName,
    networkInfo.mainnetUri,
    networkInfo.createNetworkInfoHandler(networkContext, 'mainnet')
  )
}
