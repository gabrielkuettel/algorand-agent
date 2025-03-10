# Algorand Smart Contract Tool Examples

This document provides examples of how to use the Algorand smart contract tools, with a special focus on string handling.

## String Handling in Algorand Smart Contracts

When passing string arguments to Algorand smart contracts, you have two main options:

1. **Direct strings**: For simple ASCII strings, you can pass them directly
2. **Base64-encoded strings**: For non-ASCII characters or to ensure proper encoding, use base64

### Base64 Encoding Examples

| Original String | Base64 Encoded         |
| --------------- | ---------------------- |
| "Hello"         | "SGVsbG8="             |
| "Alice"         | "QWxpY2U="             |
| "Hello, World!" | "SGVsbG8sIFdvcmxkIQ==" |

## Example: Regular App Call with String Arguments

```json
{
  "tool": "mcp__app_call",
  "params": {
    "sender": "NNWVV6BRUVCVFFQ6FJHFAVRSUR37FAZE67BVDTKZF2SPDL5JJBRRQX2FEY",
    "appId": "4863",
    "appArgs": [
      "QWxpY2U=" // Base64 encoded "Alice"
    ],
    "note": "Testing with base64 encoded string"
  }
}
```

## Example: ABI Method Call with String Arguments

```json
{
  "tool": "mcp__app_call_method-call",
  "params": {
    "sender": "NNWVV6BRUVCVFFQ6FJHFAVRSUR37FAZE67BVDTKZF2SPDL5JJBRRQX2FEY",
    "appId": "4860",
    "method": "hello(string)void",
    "methodArgs": [
      "QWxpY2U=" // Base64 encoded "Alice"
    ],
    "note": "Testing method call with string parameter"
  }
}
```

## Example: Creating a Smart Contract with String Handling

```json
{
  "tool": "mcp__app_create",
  "params": {
    "sender": "NNWVV6BRUVCVFFQ6FJHFAVRSUR37FAZE67BVDTKZF2SPDL5JJBRRQX2FEY",
    "approvalProgram": "#pragma version 8\n// ... TEAL code ...",
    "clearStateProgram": "#pragma version 8\nint 1\nreturn",
    "globalInts": 1,
    "globalBytes": 1,
    "note": "Creating a smart contract with string handling"
  }
}
```

## Example: ABI-Compatible TEAL Program (Pragma Version 8)

Here's an example of a simple ABI-compatible TEAL program that implements a "hello" method:

```
#pragma version 8

// Handle method routing via ABI
txn ApplicationID
int 0
==
bnz handle_create

// Check for method call
txna ApplicationArgs 0
method "hello(string)string"
==
bnz handle_hello

// Default: approve everything else
b approve

handle_create:
    int 1
    return

handle_hello:
    // Get the name parameter (skip first 2 bytes of ABI encoding)
    txna ApplicationArgs 1
    extract 2 0

    // Create the greeting
    byte "Hello, "
    swap
    concat
    byte "!"
    concat

    // Return the result
    // Format: 0x151f7c75 + return value
    byte 0x151f7c75  // Return prefix
    swap
    concat
    log

approve:
    int 1
    return
```

This program:

1. Uses pragma version 8 (required for ABI compatibility)
2. Implements the "hello(string)string" method
3. Properly handles ABI method routing
4. Returns a properly formatted ABI response

## Common Issues and Solutions

### Issue: Garbled String Output

If you see output like `Hello, X�!` in the logs, it means the string wasn't properly encoded. Use base64 encoding for the input string.

**Wrong:**

```json
"appArgs": ["Alice"]
```

**Right:**

```json
"appArgs": ["QWxpY2U="]  // Base64 encoded "Alice"
```

### Issue: ABI Method Not Found

Make sure your method signature exactly matches what's in the contract, including parameter types and return type.

**Example:**

```json
"method": "hello(string)void"
```

### Issue: TEAL Version Compatibility

Different TEAL versions support different opcodes. Make sure your TEAL code is compatible with the version specified in the `#pragma version` directive.
