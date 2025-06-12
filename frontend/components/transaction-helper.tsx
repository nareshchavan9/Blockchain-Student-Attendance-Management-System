"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, CheckCircle } from "lucide-react"

interface TransactionHelperProps {
  networkInfo: any
}

export default function TransactionHelper({ networkInfo }: TransactionHelperProps) {
  const [showTips, setShowTips] = useState(false)

  const getNetworkStatus = () => {
    if (!networkInfo) return { status: "unknown", color: "gray", message: "Network info not available" }

    if (networkInfo.chainId === 1337n || networkInfo.chainId === 31337n) {
      return {
        status: "local",
        color: "blue",
        message: "Local Hardhat Network - Should be fast",
      }
    }

    if (networkInfo.chainId === 1n) {
      return {
        status: "mainnet",
        color: "red",
        message: "Ethereum Mainnet - Can be slow and expensive",
      }
    }

    if (networkInfo.chainId === 11155111n) {
      return {
        status: "testnet",
        color: "green",
        message: "Sepolia Testnet - Moderate speed",
      }
    }

    return {
      status: "other",
      color: "yellow",
      message: `Chain ID: ${networkInfo.chainId}`,
    }
  }

  const networkStatus = getNetworkStatus()

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>Transaction Speed Helper</span>
        </CardTitle>
        <CardDescription>Network status and optimization tips</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Network Status</span>
          <Badge variant="outline" className={`text-${networkStatus.color}-600`}>
            {networkStatus.message}
          </Badge>
        </div>

        {networkInfo && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Gas Price:</span>
              <p className="font-mono">
                {networkInfo.gasPrice ? `${(Number(networkInfo.gasPrice) / 1e9).toFixed(2)} Gwei` : "N/A"}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Chain ID:</span>
              <p className="font-mono">{networkInfo.chainId?.toString() || "N/A"}</p>
            </div>
          </div>
        )}

        <Button onClick={() => setShowTips(!showTips)} variant="outline" size="sm" className="w-full">
          {showTips ? "Hide" : "Show"} Speed Optimization Tips
        </Button>

        {showTips && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span>Why Transactions Are Slow</span>
            </h4>

            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                <div>
                  <strong>Network Congestion:</strong> Too many transactions competing for block space
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                <div>
                  <strong>Low Gas Price:</strong> Your transaction has low priority in the mempool
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                <div>
                  <strong>Block Time:</strong> Ethereum blocks are mined every ~12-15 seconds
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                <div>
                  <strong>Contract Complexity:</strong> Your smart contract operations are expensive
                </div>
              </div>
            </div>

            <h4 className="font-medium flex items-center space-x-2 mt-4">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Speed Optimization Tips</span>
            </h4>

            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                <div>
                  <strong>Use Local Network:</strong> Deploy to Hardhat local network for instant transactions
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                <div>
                  <strong>Increase Gas Price:</strong> Set higher gas price in MetaMask for faster confirmation
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                <div>
                  <strong>Use Testnets:</strong> Sepolia or Goerli testnets are faster than mainnet
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                <div>
                  <strong>Batch Operations:</strong> Combine multiple operations into single transaction
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Quick Fix:</strong> If using Hardhat, make sure your local node is running with:
                <code className="block mt-1 p-1 bg-blue-100 rounded text-xs">npx hardhat node</code>
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
