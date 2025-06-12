// src/lib/address-map.ts
"use client"

// A mapping of wallet addresses to human-readable names.
// The keys MUST be lowercase ethereum addresses for the lookup to work.
// Replace the placeholder names with the actual names for your dApp.
export const ADDRESS_NAME_MAP: { [key: string]: string } = {
  // Your provided addresses (now in lowercase):
  "Wallet Account Address-1": "Student 1",    // Change this name
  "Wallet Account Address-2": "Student 2",  // Change this name
  "Wallet Account Address-3": "Student 3",   // Change this name
  "Wallet Account Address-4":"student-4",
  // You can keep these Hardhat test addresses for local testing or remove them.
  "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266": "Admin ",
  "0x70997970c51812dc3a010c7d01b50e0d17dc79c8": "Prof. Brian",
  "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc": "Dr. Catherine",
  "0x90f79bf6eb2c4f870365e785982e1f101e93b906": "Student Dave",
  "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65": "Student Eve",
};

/**
 * A utility function to get a name for a given address.
 * Falls back to a truncated address if no name is found in the map.
 * @param address The Ethereum address.
 * @returns A human-readable name or a truncated address.
 */
export function getNameByAddress(address?: string): string {
  if (!address) return "Unknown";
  
  // This correctly converts any incoming address (mixed-case or not) to lowercase for lookup.
  const lowerCaseAddress = address.toLowerCase();

  if (ADDRESS_NAME_MAP[lowerCaseAddress]) {
    return ADDRESS_NAME_MAP[lowerCaseAddress];
  }
  
  // Fallback if the address is not in the map
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}