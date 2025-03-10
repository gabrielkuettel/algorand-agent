# Algorand Agent

This Turborepo contains tools and applications for the Algorand Agent, the official MCP integration for Algorand blockchain interactions with AI assistants.

## Using this repository

Clone the repository and install dependencies:

```sh
git clone https://github.com/yourusername/algorand-agent.git
cd algorand-agent
pnpm install
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `algorand-agent-server`: An MCP (Model Context Protocol) server for Algorand blockchain interactions
- `@repo/eslint-config`: `eslint` configurations used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### algorand-agent-server

The algorand-agent-server implements the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) for Algorand blockchain integration with Claude Desktop, Cursor, and other LLM clients that support MCP.

Key features:

- **Account Management**: Create, recover, and manage Algorand accounts
- **Transaction Handling**: Create, sign, and submit transactions to the Algorand blockchain
- **Asset Operations**: Create, modify, transfer, opt-in/out, freeze, and destroy Algorand Standard Assets (ASA)
- **Smart Contract Management**: Deploy, update, and interact with smart contracts using ABI method calls
- **Multi-Network Support**: Compatible with Algorand LocalNet, TestNet, and MainNet
- **LocalNet Dispenser**: Easily fund accounts on LocalNet for development and testing
- **Blockchain Explorer Integration**: Generate URLs to view transactions, accounts, assets, and applications in Lora Explorer

For complete setup instructions and detailed documentation for the MCP server, see the [algorand-agent-server README](apps/algorand-agent-server/README.md).

### Build

To build all apps and packages, run the following command:

```
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```
pnpm dev
```
