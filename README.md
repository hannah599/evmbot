# ERC-20 代币转账监听工具

用于监听指定 ERC-20 代币合约的转账活动，适用于安全分析和异常检测。

## 功能特性

- 实时监听 ERC-20 代币转账事件
- 显示转账详情（发送方、接收方、数量、交易哈希等）
- 自动检测铸币和销毁操作
- 大额转账警告
- 支持自定义 RPC 节点和代币合约地址

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

## 安全提醒

此工具仅用于：
- 代币转账活动监控
- 安全分析和审计
- 异常交易检测
- 教育和研究目的

## 依赖项

- ethers.js v6.0+
- Node.js v16+