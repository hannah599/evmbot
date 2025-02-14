const { ethers } = require('ethers');

const ERC20_ABI = [
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)"
];

class TokenMonitor {
    constructor(rpcUrl, tokenAddress) {
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
        this.tokenAddress = tokenAddress;
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
            console.error('获取代币信息失败:', error.message);
            return null;
        }
    }

    async startMonitoring() {
        if (this.isMonitoring) {
            console.log('监听已在运行中...');
            return;
        }

        const tokenInfo = await this.getTokenInfo();
        if (!tokenInfo) {
            console.error('无法获取代币信息，监听终止');
            return;
        }

        console.log(`开始监听代币: ${tokenInfo.name} (${tokenInfo.symbol})`);
        console.log(`代币地址: ${this.tokenAddress}`);
        console.log(`小数位数: ${tokenInfo.decimals}`);
        console.log('----------------------------');

        this.isMonitoring = true;

        this.tokenContract.on('Transfer', (from, to, value, event) => {
            const amount = ethers.formatUnits(value, tokenInfo.decimals);
            const timestamp = new Date().toLocaleString('zh-CN');
            
            console.log(`[${timestamp}] 检测到转账:`);
            console.log(`  从: ${from}`);
            console.log(`  到: ${to}`);
            console.log(`  数量: ${amount} ${tokenInfo.symbol}`);
            console.log(`  交易哈希: ${event.log.transactionHash}`);
            console.log(`  区块号: ${event.log.blockNumber}`);
            console.log('----------------------------');

            if (from === ethers.ZeroAddress) {
                console.log(`⚠️  铸币检测: 新增 ${amount} ${tokenInfo.symbol}`);
            }
            if (to === ethers.ZeroAddress) {
                console.log(`⚠️  销毁检测: 销毁 ${amount} ${tokenInfo.symbol}`);
            }

            const amountNum = parseFloat(amount);
            if (amountNum > 1000000) {
                console.log(`🚨 大额转账警告: ${amount} ${tokenInfo.symbol}`);
            }
        });

        this.tokenContract.on('error', (error) => {
            console.error('监听错误:', error.message);
        });
    }

    stopMonitoring() {
        if (this.isMonitoring) {
            this.tokenContract.removeAllListeners();
            this.isMonitoring = false;
            console.log('监听已停止');
        }
    }
}

async function main() {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    function question(prompt) {
        return new Promise((resolve) => {
            rl.question(prompt, resolve);
        });
    }

    try {
        console.log('=== ERC-20 代币转账监听工具 ===');
        
        const rpcUrl = await question('请输入 RPC 节点地址 (默认使用 Ethereum 主网): ') 
            || 'https://eth.llamarpc.com';
        
        const tokenAddress = await question('请输入要监听的代币合约地址: ');
        
        if (!ethers.isAddress(tokenAddress)) {
            console.error('无效的合约地址');
            rl.close();
            return;
        }

        const monitor = new TokenMonitor(rpcUrl, tokenAddress);
        
        console.log('\n按 Ctrl+C 停止监听\n');
        
        await monitor.startMonitoring();

        process.on('SIGINT', () => {
            console.log('\n正在停止监听...');
            monitor.stopMonitoring();
            rl.close();
            process.exit(0);
        });

    } catch (error) {
        console.error('程序错误:', error.message);
        rl.close();
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { TokenMonitor };