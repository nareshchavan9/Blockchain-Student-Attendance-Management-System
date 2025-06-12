const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const AttendanceManagement = await hre.ethers.getContractFactory("AttendanceManagement");
  const attendanceManagement = await AttendanceManagement.deploy();

  await attendanceManagement.waitForDeployment(); // Ethers v6

  console.log("AttendanceManagement contract deployed to:", await attendanceManagement.getAddress());
  // Deployed to: 0x...
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});