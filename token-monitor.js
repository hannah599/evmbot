require('dotenv').config();
const { ethers } = require('ethers');

const ERC20_ABI = [
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)"
];

class TokenMonitor {
    constructor(rpcUrl, tokenAddress, watchFromAddress = null, watchToAddress = null) {
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
        this.tokenAddress = tokenAddress;
        this.watchFromAddress = watchFromAddress;
        this.watchToAddress = watchToAddress;
        this.isMonitoring = false;
    }

    async getTokenInfo() {
        try {
            const [name, symbol, decimals] = await Promise.all([
                this.tokenContract.name(),
                this.tokenContract.symbol(),
                this.tokenContract.decimals()
            ]);
            return { name, symbol, decimals };
        } catch (error) {
            console.error('Failed to get token info:', error.message);
            return null;
        }
    }

    shouldMonitorTransfer(from, to) {
        if (this.watchFromAddress && this.watchToAddress) {
            return from.toLowerCase() === this.watchFromAddress.toLowerCase() && 
                   to.toLowerCase() === this.watchToAddress.toLowerCase();
        } else if (this.watchFromAddress) {
            return from.toLowerCase() === this.watchFromAddress.toLowerCase();
        } else if (this.watchToAddress) {
            return to.toLowerCase() === this.watchToAddress.toLowerCase();
        }
        return true;
    }

    logTransferType(from, to) {
        if (this.watchFromAddress && this.watchToAddress) {
            console.log(`🔍 Monitored transfer: ${this.watchFromAddress} → ${this.watchToAddress}`);
        } else if (this.watchFromAddress) {
            console.log(`🔍 Address ${this.watchFromAddress} sent tokens`);
        } else if (this.watchToAddress) {
            console.log(`🔍 Address ${this.watchToAddress} received tokens`);
        }
    }

    async startMonitoring() {
        if (this.isMonitoring) {
            console.log('Monitoring is already running...');
            return;
        }

        const tokenInfo = await this.getTokenInfo();
        if (!tokenInfo) {
            console.error('Unable to get token info, monitoring terminated');
            return;
        }

        console.log(`Starting to monitor token: ${tokenInfo.name} (${tokenInfo.symbol})`);
        console.log(`Token address: ${this.tokenAddress}`);
        console.log(`Decimals: ${tokenInfo.decimals}`);
        
        let monitoringMode = '';
        if (this.watchFromAddress && this.watchToAddress) {
            monitoringMode = `Monitor transfers from ${this.watchFromAddress} to ${this.watchToAddress} only`;
        } else if (this.watchFromAddress) {
            monitoringMode = `Monitor transfers from address ${this.watchFromAddress} only`;
        } else if (this.watchToAddress) {
            monitoringMode = `Monitor transfers to address ${this.watchToAddress} only`;
        } else {
            monitoringMode = 'Monitor all transfers';
        }
        console.log(`🎯 Monitoring mode: ${monitoringMode}`);
        console.log('----------------------------');

        this.isMonitoring = true;

        this.tokenContract.on('Transfer', (from, to, value, event) => {
            const shouldMonitor = this.shouldMonitorTransfer(from, to);
            if (!shouldMonitor) {
                return;
            }

            const amount = ethers.formatUnits(value, tokenInfo.decimals);
            const timestamp = new Date().toISOString();
            
            console.log(`[${timestamp}] Transfer detected:`);
            console.log(`  From: ${from}`);
            console.log(`  To: ${to}`);
            console.log(`  Amount: ${amount} ${tokenInfo.symbol}`);
            console.log(`  Transaction hash: ${event.log.transactionHash}`);
            console.log(`  Block number: ${event.log.blockNumber}`);
            console.log('----------------------------');

            this.logTransferType(from, to);

            if (from === ethers.ZeroAddress) {
                console.log(`⚠️  Mint detected: Added ${amount} ${tokenInfo.symbol}`);
            }
            if (to === ethers.ZeroAddress) {
                console.log(`⚠️  Burn detected: Burned ${amount} ${tokenInfo.symbol}`);
            }

            const amountNum = parseFloat(amount);
            const threshold = process.env.LARGE_AMOUNT_THRESHOLD || 1000000;
            if (amountNum > threshold) {
                console.log(`🚨 Large transfer alert: ${amount} ${tokenInfo.symbol}`);
            }
        });

        this.tokenContract.on('error', (error) => {
            console.error('Monitoring error:', error.message);
        });
    }

    stopMonitoring() {
        if (this.isMonitoring) {
            this.tokenContract.removeAllListeners();
            this.isMonitoring = false;
            console.log('Monitoring stopped');
        }
    }
}

async function main() {
    try {
        console.log('=== ERC-20 Token Transfer Monitor ===');
        
        const rpcUrl = process.env.RPC_URL || 'https://eth.llamarpc.com';
        const tokenAddress = process.env.TOKEN_ADDRESS;
        const watchFromAddress = process.env.WATCH_FROM_ADDRESS;
        const watchToAddress = process.env.WATCH_TO_ADDRESS;
        
        if (!tokenAddress) {
            console.error('Error: Please set TOKEN_ADDRESS in .env file');
            console.log('Example: TOKEN_ADDRESS=0xdAC17F958D2ee523a2206206994597C13D831ec7');
            return;
        }
        
        if (!ethers.isAddress(tokenAddress)) {
            console.error('Error: Invalid contract address');
            return;
        }

        if (watchFromAddress && !ethers.isAddress(watchFromAddress)) {
            console.error('Error: Invalid watch address WATCH_FROM_ADDRESS');
            return;
        }

        if (watchToAddress && !ethers.isAddress(watchToAddress)) {
            console.error('Error: Invalid watch address WATCH_TO_ADDRESS');
            return;
        }

        console.log(`RPC node: ${rpcUrl}`);
        console.log(`Monitoring contract: ${tokenAddress}`);
        if (watchFromAddress) {
            console.log(`Monitoring outgoing from: ${watchFromAddress}`);
        }
        if (watchToAddress) {
            console.log(`Monitoring incoming to: ${watchToAddress}`);
        }
        
        const monitor = new TokenMonitor(rpcUrl, tokenAddress, watchFromAddress, watchToAddress);
        
        console.log('\nPress Ctrl+C to stop monitoring\n');
        
        await monitor.startMonitoring();

        process.on('SIGINT', () => {
            console.log('\nStopping monitoring...');
            monitor.stopMonitoring();
            process.exit(0);
        });

    } catch (error) {
        console.error('Program error:', error.message);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { TokenMonitor };