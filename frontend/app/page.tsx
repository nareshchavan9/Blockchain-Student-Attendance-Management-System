"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Wallet } from "lucide-react"
import { useWeb3 } from "@/hooks/use-web3"
import AdminDashboard from "@/components/admin-dashboard"
import TeacherDashboard from "@/components/teacher-dashboard"
import StudentDashboard from "@/components/student-dashboard"
import RoleSelection from "@/components/role-selection"
import AuthenticationModal from "@/components/authentication-modal"
import EventListener from "@/components/event-listener"

export default function HomePage() {
  const { account, isConnected, connectWallet, contract } = useWeb3()
  const [selectedRole, setSelectedRole] = useState<"admin" | "teacher" | "student" | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  const handleRoleSelect = (role: "admin" | "teacher" | "student") => {
    setSelectedRole(role)
    setShowAuth(true)
  }

  const handleAuthSuccess = () => {
    setIsAuthenticated(true)
    setShowAuth(false)
  }

  const handleAuthCancel = () => {
    setSelectedRole(null)
    setShowAuth(false)
  }

  const handleLogout = () => {
    setSelectedRole(null)
    setIsAuthenticated(false)
    setShowAuth(false)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Student Attendance System</CardTitle>
            <CardDescription>Connect your MetaMask wallet to access the attendance management system</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={connectWallet} className="w-full" size="lg">
              <Wallet className="w-4 h-4 mr-2" />
              Connect MetaMask
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!selectedRole || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">Attendance Management</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="font-mono text-xs">
                  {account?.slice(0, 6)}...{account?.slice(-4)}
                </Badge>
                <Badge variant="secondary">Connected</Badge>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <RoleSelection onRoleSelect={handleRoleSelect} />
        </main>

        {showAuth && selectedRole && (
          <AuthenticationModal role={selectedRole} onSuccess={handleAuthSuccess} onCancel={handleAuthCancel} />
        )}

        {/* Add event listener for cross-tab updates */}
        <EventListener />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Attendance Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="font-mono text-xs">
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {selectedRole}
              </Badge>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedRole === "admin" && <AdminDashboard />}
        {selectedRole === "teacher" && <TeacherDashboard />}
        {selectedRole === "student" && <StudentDashboard />}
      </main>

      {/* Add event listener for cross-tab updates */}
      <EventListener />
    </div>
  )
}
