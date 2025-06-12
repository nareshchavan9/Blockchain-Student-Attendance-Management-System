"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, BookOpen, GraduationCap } from "lucide-react"

interface RoleSelectionProps {
  onRoleSelect: (role: "admin" | "teacher" | "student") => void
}

export default function RoleSelection({ onRoleSelect }: RoleSelectionProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Select Your Role</h2>
        <p className="text-gray-600">Choose your role to access the appropriate dashboard</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl">Administrator</CardTitle>
            <CardDescription>Manage teachers and system settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Register/Unregister Teachers
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                System Overview
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Full System Access
              </div>
            </div>
            <Button onClick={() => onRoleSelect("admin")} className="w-full bg-red-600 hover:bg-red-700">
              Continue as Admin
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-xl">Teacher</CardTitle>
            <CardDescription>Create courses and manage attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Create & Manage Courses
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Create Attendance Forms
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                View Attendance Reports
              </div>
            </div>
            <Button onClick={() => onRoleSelect("teacher")} className="w-full bg-green-600 hover:bg-green-700">
              Continue as Teacher
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <GraduationCap className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Student</CardTitle>
            <CardDescription>Mark attendance for your courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                View Available Forms
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Submit Attendance
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                View Attendance History
              </div>
            </div>
            <Button onClick={() => onRoleSelect("student")} className="w-full bg-blue-600 hover:bg-blue-700">
              Continue as Student
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
