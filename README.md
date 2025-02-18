# ERC-20 代币转账监听工具

用于监听指定 ERC-20 代币合约的转账活动，适用于安全分析和异常检测。

## 功能特性

- 实时监听 ERC-20 代币转账事件
- 显示转账详情（发送方、接收方、数量、交易哈希等）
- 自动检测铸币和销毁操作
- 大额转账警告
- 支持自定义 RPC 节点和代币合约地址
- **新增**: 支持仅监听从特定地址转出的代币
- **新增**: 支持仅监听转入到特定地址的代币
- **新增**: 支持同时设置转出和转入地址进行精确监听

## 安装

```bash
npm install
```

## 配置

1. 复制环境变量模板：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，设置必要参数：
```bash
# RPC 节点地址
RPC_URL=https://eth.llamarpc.com

# 要监听的代币合约地址
TOKEN_ADDRESS=0xdAC17F958D2ee523a2206206994597C13D831ec7

# 可选：仅监听从特定地址转出的代币
WATCH_FROM_ADDRESS=0x742d35Cc6aF2C0532845e1a3C8B8d00a5A09df82

# 可选：仅监听转入到特定地址的代币
WATCH_TO_ADDRESS=0x8ba1f109551bD432803012645Hac136c22C177ec

# 大额转账警告阈值
LARGE_AMOUNT_THRESHOLD=1000000
```

## 使用方法

```bash
npm install
npm run monitor
```

## 示例

监听 USDT 代币转账：
- 合约地址：`0xdAC17F958D2ee523a2206206994597C13D831ec7`
- RPC：使用默认节点或自定义节点

监听特定转账模式：

1. 仅监听特定地址转出：
   - 设置 `WATCH_FROM_ADDRESS=0x742d35Cc6aF2C0532845e1a3C8B8d00a5A09df82`

2. 仅监听特定地址转入：
   - 设置 `WATCH_TO_ADDRESS=0x8ba1f109551bD432803012645Hac136c22C177ec`

3. 精确监听（特定地址间的转账）：
   - 同时设置 `WATCH_FROM_ADDRESS` 和 `WATCH_TO_ADDRESS`

## 安全提醒

此工具仅用于：
- 代币转账活动监控
- 安全分析和审计
- 异常交易检测
- 教育和研究目的

## 依赖项

- ethers.js v6.0+
- Node.js v16+