# LLM Guide: Using Algorand Smart Contract Tools

This guide is designed to help LLMs correctly use the Algorand smart contract tools.

## Correct Tool Names

Always use the exact tool names as shown below:

- `mcp__app_call` - Regular application call
- `mcp__app_call_method-call` - ABI method call
- `mcp__app_create` - Create a new application
- `mcp__app_create_method_call` - Create a new application with an ABI method call
- `mcp__app_update` - Update an existing application
- `mcp__app_update_method_call` - Update an existing application with an ABI method call
- `mcp__app_delete` - Delete an application
- `mcp__app_delete_method_call` - Delete an application with an ABI method call

## String Handling in Algorand Smart Contracts

When passing string arguments to Algorand smart contracts, you have two options:

1. **Direct strings**: For simple ASCII strings, you can pass them directly
2. **Base64-encoded strings**: For non-ASCII characters or to ensure proper encoding, use base64

### When to Use Base64 Encoding

Always use base64 encoding for strings when:

- The string contains non-ASCII characters
- You're experiencing encoding issues (seeing garbled output like `Hello, X�!`)
- You need consistent and reliable string handling

### Base64 Encoding Examples

| Original String | Base64 Encoded         |
| --------------- | ---------------------- |
| "Hello"         | "SGVsbG8="             |
| "Alice"         | "QWxpY2U="             |
| "Hello, World!" | "SGVsbG8sIFdvcmxkIQ==" |

## Regular App Call vs. ABI Method Call

### When to Use Regular App Call (`mcp__app_call`)

Use `mcp__app_call` when:

- The smart contract doesn't use ABI methods
- You're working with simple TEAL contracts that process raw arguments
- You need to pass raw bytes or non-ABI-compatible arguments

**Example:**

```json
{
  "sender": "NNWVV6BRUVCVFFQ6FJHFAVRSUR37FAZE67BVDTKZF2SPDL5JJBRRQX2FEY",
  "appId": "4863",
  "appArgs": [
    "QWxpY2U=" // Base64 encoded "Alice"
  ],
  "note": "Testing with base64 encoded string"
}
```

### When to Use ABI Method Call (`mcp__app_call_method-call`)

Use `mcp__app_call_method-call` when:

- The smart contract is designed to handle ABI methods
- The contract implements ARC-4 standard
- You need to call a specific method with typed arguments

**Example:**

```json
{
  "sender": "NNWVV6BRUVCVFFQ6FJHFAVRSUR37FAZE67BVDTKZF2SPDL5JJBRRQX2FEY",
  "appId": "4860",
  "method": "hello(string)void",
  "methodArgs": [
    "QWxpY2U=" // Base64 encoded "Alice"
  ],
  "note": "Testing method call with string parameter"
}
```

## TEAL Version Compatibility

Different TEAL versions support different opcodes:

- TEAL v6: Basic string operations, no ABI support (deprecated for new contracts)
- TEAL v7: Added more opcodes (deprecated for new contracts)
- TEAL v8: Added ABI-related opcodes (recommended minimum)
- TEAL v9: Latest version with additional features

**Always use pragma version 8 or higher for all new contracts.** This ensures compatibility with ABI methods and access to the latest features.

Example:

```
#pragma version 8
// Your TEAL code here
```

Always check that your TEAL code is compatible with the version specified in the `#pragma version` directive.

## Troubleshooting Common Issues

### Garbled String Output

If you see output like `Hello, X�!` in the logs, use base64 encoding for the input string.

### ABI Method Not Found

Make sure your method signature exactly matches what's in the contract, including parameter types and return type.

### Unknown Opcode Errors

If you see errors like `unknown opcode: method_hash` or `unknown opcode: abi_return`, check the TEAL version compatibility. Some opcodes are only available in newer versions.
