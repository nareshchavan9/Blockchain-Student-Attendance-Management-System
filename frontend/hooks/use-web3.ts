"use client"

import { useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"

// Contract ABI (simplified for key functions)
const CONTRACT_ABI = [
  "function admin() view returns (address)",
  "function isTeacherRegistered(address) view returns (bool)",
  "function registerTeacher(address) external",
  "function unregisterTeacher(address) external",
  "function addCourse(string) external",
  "function createAttendanceForm(uint256, address[], string) external",
  "function submitAttendance(uint256, bool) external",
  "function closeAttendanceForm(uint256) external",
  "function getCourse(uint256) view returns (tuple(uint256 courseId, string name, address teacher, uint256[] formIds, bool isActive))",
  "function getActiveTeacherCourseIds(address) view returns (uint256[])",
  "function getAttendanceForm(uint256) view returns (uint256, uint256, address, uint256, uint256, uint64, uint64, uint8, string)",
  "function getEnrolledStudentsForForm(uint256) view returns (address[])",
  "function getStudentAttendanceStatusForForm(uint256, address) view returns (bool, bool)",
  "function getFormIdsForCourse(uint256) view returns (uint256[])",
  "function getFormsStudentIsEnrolledIn(address) view returns (uint256[])",
  "function getOpenFormsForStudentInCourse(address, uint256) view returns (uint256[])",
  "function courseCounter() view returns (uint256)",
  "function formCounter() view returns (uint256)",
  "event TeacherRegistered(address indexed teacherAddress, bool isRegistered)",
  "event CourseAdded(uint256 indexed courseId, string name, address indexed teacher)",
  "event AttendanceFormCreated(uint256 indexed formId, uint256 indexed courseId, address indexed teacher, uint256 studentCount, string description)",
  "event AttendanceSubmitted(uint256 indexed formId, address indexed studentAddress, bool attended)",
  "event AttendanceFormClosed(uint256 indexed formId, uint256 presentCount, uint256 totalEnrolled)",
]

// Replace with your deployed contract address
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3" // Example localhost address

export function useWeb3() {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const connectWallet = useCallback(async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        // Check if already connected first
        const existingAccounts = await window.ethereum.request({
          method: "eth_accounts",
        })

        let accounts
        if (existingAccounts.length > 0) {
          // Use existing connection
          accounts = existingAccounts
        } else {
          // Request new connection
          accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          })
        }

        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

        setAccount(accounts[0])
        setProvider(provider)
        setContract(contract)
        setIsConnected(true)

        console.log("Wallet connected:", accounts[0])
        console.log("Contract address:", CONTRACT_ADDRESS)
      } catch (error: any) {
        console.error("Error connecting wallet:", error)

        // Handle specific MetaMask errors
        if (error.code === -32002) {
          alert("MetaMask connection request is already pending. Please check your MetaMask extension.")
        } else if (error.code === 4001) {
          alert("Connection rejected by user.")
        } else {
          alert("Failed to connect wallet. Please try again.")
        }
      }
    } else {
      alert("Please install MetaMask!")
    }
  }, [])

  useEffect(() => {
    // Auto-connect if already connected, but don't request new connection
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            // Only auto-connect if we have existing accounts
            connectWallet()
          }
        })
        .catch((error: any) => {
          console.warn("Could not check existing accounts:", error)
        })
    }
  }, [])

  return {
    account,
    provider,
    contract,
    isConnected,
    connectWallet,
  }
}
