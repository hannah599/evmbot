# ERC-20 Token Transfer Monitor

A tool for monitoring transfer activities of specified ERC-20 token contracts, suitable for security analysis and anomaly detection.

## Features

- Real-time monitoring of ERC-20 token transfer events
- Display transfer details (sender, receiver, amount, transaction hash, etc.)
- Automatic detection of minting and burning operations
- Large transfer amount alerts
- Support for custom RPC nodes and token contract addresses
- **New**: Support monitoring tokens transferred from specific addresses only
- **New**: Support monitoring tokens transferred to specific addresses only
- **New**: Support precise monitoring by setting both from and to addresses

## Installation

```bash
npm install
```

## Configuration

1. Copy environment variable template:
```bash
cp .env.example .env
```

2. Edit `.env` file and set necessary parameters:
```bash
# RPC node address
RPC_URL=https://eth.llamarpc.com

# Token contract address to monitor
TOKEN_ADDRESS=0xdAC17F958D2ee523a2206206994597C13D831ec7

# Optional: Monitor tokens transferred from specific address only
WATCH_FROM_ADDRESS=0x742d35Cc6aF2C0532845e1a3C8B8d00a5A09df82

# Optional: Monitor tokens transferred to specific address only
WATCH_TO_ADDRESS=0x8ba1f109551bD432803012645Hac136c22C177ec

# Large transfer warning threshold
LARGE_AMOUNT_THRESHOLD=1000000
```

## Usage

```bash
npm install
npm run monitor
```

## Examples

Monitor USDT token transfers:
- Contract address: `0xdAC17F958D2ee523a2206206994597C13D831ec7`
- RPC: Use default node or custom node

Specific transfer monitoring modes:

1. Monitor outgoing transfers from specific address only:
   - Set `WATCH_FROM_ADDRESS=0x742d35Cc6aF2C0532845e1a3C8B8d00a5A09df82`

2. Monitor incoming transfers to specific address only:
   - Set `WATCH_TO_ADDRESS=0x8ba1f109551bD432803012645Hac136c22C177ec`

3. Precise monitoring (transfers between specific addresses):
   - Set both `WATCH_FROM_ADDRESS` and `WATCH_TO_ADDRESS`

## Security Notice

This tool is only for:
- Token transfer activity monitoring
- Security analysis and auditing
- Anomaly transaction detection
- Educational and research purposes

## Dependencies

- ethers.js v6.0+
- Node.js v16+