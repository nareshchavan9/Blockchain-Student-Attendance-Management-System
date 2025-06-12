// admin-dashboard.tsx

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Users, AlertCircle, Trash2, CheckCircle } from "lucide-react"
import { useWeb3 } from "@/hooks/use-web3"
import { useDataStore } from "@/hooks/use-data-store"
import { useToast } from "@/hooks/use-toast"
import { ethers } from "ethers"
import { getNameByAddress } from "@/lib/address-map"

export default function AdminDashboard() {
  const { account } = useWeb3()
  const { teachers, registerTeacher, unregisterTeacher, courses, forms } = useDataStore()
  const { toast } = useToast()
  const [teacherAddress, setTeacherAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleRegisterTeacher = async () => {
    if (!teacherAddress) return

    // Validate Ethereum address format
    if (!ethers.isAddress(teacherAddress)) {
      toast({
        title: "Error",
        description: "Please enter a valid Ethereum address",
        variant: "destructive",
      })
      return
    }

    // Check if teacher is already registered
    const existingTeacher = teachers.find((t) => t.address.toLowerCase() === teacherAddress.toLowerCase() && t.isActive)
    if (existingTeacher) {
      toast({
        title: "Info",
        description: "This address is already registered as a teacher",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      // Simulate network delay for realism
      await new Promise((resolve) => setTimeout(resolve, 1000))

      registerTeacher(teacherAddress)

      toast({
        title: "Success",
        description: "Teacher registered successfully!",
      })

      setTeacherAddress("")
    } catch (error: any) {
      console.error("Registration error:", error)
      toast({
        title: "Error",
        description: "Failed to register teacher",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnregisterTeacher = async (address: string) => {
    try {
      setIsLoading(true)

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      unregisterTeacher(address)

      toast({
        title: "Success",
        description: "Teacher unregistered successfully!",
      })
    } catch (error: any) {
      console.error("Unregister error:", error)
      toast({
        title: "Error",
        description: "Failed to unregister teacher",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const activeTeachers = teachers.filter((t) => t.isActive)
  const totalCourses = courses.length
  const totalForms = forms.length
  const activeForms = forms.filter((f) => f.status === "open").length

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-gray-600">Manage teachers and system settings</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="w-5 h-5" />
              <span>Register Teacher</span>
            </CardTitle>
            <CardDescription>Add a new teacher to the system by entering their wallet address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teacher-address">Teacher Wallet Address</Label>
              <Input
                id="teacher-address"
                placeholder="0x..."
                value={teacherAddress}
                onChange={(e) => setTeacherAddress(e.target.value)}
              />
            </div>
            <Button onClick={handleRegisterTeacher} disabled={!teacherAddress || isLoading} className="w-full">
              <UserPlus className="w-4 h-4 mr-2" />
              {isLoading ? "Registering..." : "Register Teacher"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Statistics</CardTitle>
            <CardDescription>Overview of the attendance management system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Teachers</span>
                <Badge variant="secondary">{activeTeachers.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Courses</span>
                <Badge variant="outline">{totalCourses}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Forms</span>
                <Badge variant="outline">{totalForms}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Forms</span>
                <Badge variant="default">{activeForms}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">System Status</span>
                <Badge variant="outline" className="text-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Registered Teachers ({activeTeachers.length})</span>
          </CardTitle>
          <CardDescription>Manage registered teachers in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeTeachers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No teachers registered yet</p>
            ) : (
              activeTeachers.map((teacher, index) => {
                const teacherCourses = courses.filter((c) => c.teacher.toLowerCase() === teacher.address.toLowerCase())
                const teacherForms = forms.filter((f) => f.teacher.toLowerCase() === teacher.address.toLowerCase())
                const teacherName = getNameByAddress(teacher.address)

                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{teacherName}</p>
                      <p className="font-mono text-sm text-gray-500">{teacher.address}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Registered: {new Date(teacher.registeredAt).toLocaleDateString()}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs text-gray-600">
                          Courses:{" "}
                          <Badge variant="outline" className="ml-1">
                            {teacherCourses.length}
                          </Badge>
                        </span>
                        <span className="text-xs text-gray-600">
                          Forms:{" "}
                          <Badge variant="outline" className="ml-1">
                            {teacherForms.length}
                          </Badge>
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleUnregisterTeacher(teacher.address)}
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>Important Notes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Only registered teachers can create courses and attendance forms</p>
            <p>• Teachers must have valid wallet addresses to interact with the system</p>
            <p>• Unregistering a teacher doesn't delete their existing courses</p>
            <p>• Make sure to verify teacher addresses before registration</p>

            <p>
              • Admin authentication key: <strong>1111</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}