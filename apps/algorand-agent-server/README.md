# Algorand MCP Server

MCP Server for Algorand blockchain interactions, enabling smart contract deployment, transaction management, and account operations. This server implements the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) for Algorand blockchain integration with Claude Desktop, Cursor and other LLM clients that support MCP.

## Features

- **Account Management**: Create, recover, and manage Algorand accounts
- **Transaction Handling**: Create, sign, and submit transactions to the Algorand blockchain
- **Asset Operations**: Create, modify, transfer, opt-in/out, freeze, and destroy Algorand Standard Assets (ASA)
- **Smart Contract Management**: Deploy, update, and interact with smart contracts using ABI method calls
- **Multi-Network Support**: Compatible with Algorand LocalNet, TestNet, and MainNet
- **LocalNet Dispenser**: Easily fund accounts on LocalNet for development and testing
- **Blockchain Explorer Integration**: Generate URLs to view transactions, accounts, assets, and applications in Lora Explorer

## Tools

### Network Tools

- `aa__get_network` - Get current network (localnet, testnet, mainnet)
- `aa__set_network` - Set active network for subsequent operations

### Account Tools

- `aa__generate_account` - Create a new random Algorand account
- `aa__account_get_information` - Get account balance and information
- `aa__account_from_mnemonic` - Recover account from 25-word mnemonic

### Transaction Tools

- `aa__send_payment` - Send Algos between accounts
- `aa__asset_create` - Create a new Algorand Standard Asset (ASA)
- `aa__asset_config` - Modify asset configuration
- `aa__asset_transfer` - Transfer assets between accounts
- `aa__asset_opt_in` - Opt-in to receive an asset
- `aa__asset_opt_out` - Opt-out of an asset
- `aa__asset_freeze` - Freeze asset holdings
- `aa__asset_destroy` - Destroy an asset

### Smart Contract Tools

- `aa__app_call_method` - Call a method on an existing application
- `aa__app_create_method_call` - Deploy a new application
- `aa__app_update_method_call` - Update an existing application
- `aa__app_delete_method_call` - Delete an application

### Utility Tools

- `aa__dispenser_ensure_funded` - Fund an account on LocalNet
- `aa__explorer_get_url` - Generate URL to view resources in Lora Explorer

## Network Support

The Algorand MCP Server supports interaction with multiple Algorand networks:

- **LocalNet**: For local development and testing
- **TestNet**: For testing applications in a live environment before deployment
- **MainNet**: For production applications

You can specify which network to use when making API calls, allowing you to develop and test in sandbox environments before deploying to production.

## Model Context Protocol Integration

This server implements the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/), which allows Claude to interact with the Algorand blockchain directly. For more information on how to use MCP with Claude:

- **MCP Quickstart Guide**: [https://modelcontextprotocol.io/quickstart/user](https://modelcontextprotocol.io/quickstart/user)
- **MCP Documentation**: [https://modelcontextprotocol.io/](https://modelcontextprotocol.io/)

## Installation & Usage

You can use this MCP server with both Claude Desktop and Cursor:

### Claude Desktop Setup

You can use this MCP server in two ways:

#### Option 1: Using npx (Recommended)

Configure in Claude Desktop (`~/Library/Application\ Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "algorand-agent": {
      "command": "npx",
      "args": ["-y", "algorand-mcp"]
    }
  }
}
```

#### Option 2: Using Docker

Configure in Claude Desktop:

```json
{
  "mcpServers": {
    "algorand-agent": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "gabrielkuettel/algorand-mcp"]
    }
  }
}
```

For detailed instructions on configuring Claude Desktop to work with MCP servers, see the [MCP Quickstart Guide for Users](https://modelcontextprotocol.io/quickstart/user).

### Cursor Setup

You can also use this MCP server with [Cursor](https://cursor.com/), an AI-powered code editor. To set up the Algorand MCP server in Cursor:

1. Open Cursor and go to `Cursor Settings` > `Features` > `MCP`
2. Click on the `+ Add New MCP Server` button
3. Fill out the form:
   - **Name**: `algorand-mcp` (or any name you prefer)
   - **Type**: Select `stdio` from the dropdown
   - **Command**: Enter one of the following commands:
     - Using npx: `npx -y algorand-mcp`
     - Using local build: `node /absolute/path/to/your/algorand-mcp/dist/index.js`
     - Using Docker: `docker run -i --rm gabrielkuettel/algorand-mcp`

#### Project-specific Configuration

You can also configure project-specific MCP servers in Cursor using a `.cursor/mcp.json` file in your project root:

```json
{
  "mcpServers": {
    "algorand-agent": {
      "command": "npx",
      "args": ["-y", "algorand-mcp"]
    }
  }
}
```

For more detailed instructions on configuring and using MCP servers with Cursor, see the [Cursor MCP Documentation](https://docs.cursor.com/context/model-context-protocol).

## Development

### Prerequisites

- Node.js v22 or later
- pnpm v8 or later
- Docker (optional, for container builds)

### Local Setup

```bash
# Clone the repository
git clone https://github.com/your-username/algorand-mcp.git
cd algorand-mcp

# Install dependencies
pnpm install

# Build the project
pnpm build

# Watch mode for development
pnpm watch
```

### Path Aliases

This project uses TypeScript path aliases (e.g., `@/common/*`) for cleaner imports. The build process handles these aliases using `tsc-alias`:

- The `build` script runs `tsc-alias` after compilation to resolve path aliases
- The `watch` script runs `tsc-alias --watch` alongside TypeScript to handle live changes
- When building Docker images, the build step explicitly runs the full build process

If you're experiencing issues with unresolved paths in the compiled output, ensure that:

1. You're using the provided build scripts and not running `tsc` directly
2. Your IDE is configured to recognize the path aliases defined in `tsconfig.json`

### Development Configuration

While developing, you'll want to point Claude Desktop directly to your local build. Update your Claude Desktop config (`~/Library/Application\ Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "algorand": {
      "command": "node",
      "args": ["/absolute/path/to/your/algorand-mcp/dist/index.js"]
    }
  }
}
```

### Debugging

#### Inspector

The MCP Inspector is a useful tool for debugging and testing your MCP server. It provides a visual interface to interact with your server and inspect the messages being exchanged.

To run the Inspector with the Algorand MCP server:

```bash
pnpm inspect
```

#### Viewing Logs

Review detailed MCP logs from Claude Desktop:

```bash
# Follow logs in real-time
tail -n 20 -F ~/Library/Logs/Claude/mcp*.log
```

The logs capture:

- Server connection events
- Configuration issues
- Runtime errors
- Message exchanges

#### Using Chrome DevTools

Access Chrome's developer tools inside Claude Desktop to investigate client-side errors:

1. Create a developer_settings.json file with allowDevTools set to true:

```bash
echo '{"allowDevTools": true}' > ~/Library/Application\ Support/Claude/developer_settings.json
```

2. Open DevTools

You'll see two DevTools windows:

- Main content window
- App title bar window

Use the Console panel to inspect client-side errors.
Use the Network panel to inspect:

- Message payloads
- Connection timing

### Docker Development

If you're developing with Docker:

```bash
# Build the image locally
docker build -t algorand-mcp .

# Test your changes
docker run -i --rm algorand-mcp
```

### Publishing

#### Publishing to npm

```bash
# Build and publish to npm registry in one command
pnpm publish:npm
```

#### Publishing Docker Image

```bash
# Build, tag, and push the Docker image in one command
pnpm publish:docker

# Alternatively, you can run the individual steps:
# pnpm docker:build   # Build the image
# pnpm docker:tag     # Tag the image
# pnpm docker:push    # Push to Docker Hub (requires docker login first)
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
