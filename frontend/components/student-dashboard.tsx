// student-dashboard.tsx

"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, BookOpen, Loader2, RefreshCw } from "lucide-react"
import { useWeb3 } from "@/hooks/use-web3"
import { useDataStore } from "@/hooks/use-data-store"
import { useToast } from "@/hooks/use-toast"
import { getNameByAddress } from "@/lib/address-map"

export default function StudentDashboard() {
  const { account } = useWeb3()
  const { getAvailableForms, getCompletedForms, submitAttendance, getCourse, forms } = useDataStore()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const studentName = useMemo(() => getNameByAddress(account), [account])

  // Use useMemo to compute forms instead of useEffect with state
  const availableForms = useMemo(() => {
    if (!account) return []
    const available = getAvailableForms(account)
    console.log("Available forms for", account, ":", available)
    return available
  }, [account, forms, refreshKey, getAvailableForms])

  const completedForms = useMemo(() => {
    if (!account) return []
    const completed = getCompletedForms(account)
    console.log("Completed forms for", account, ":", completed)
    return completed
  }, [account, forms, refreshKey, getCompletedForms])

  // Auto-refresh every 5 seconds to catch new forms
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Force refresh data
  const refreshData = () => {
    setRefreshKey((prev) => prev + 1)
    console.log("Refreshing student dashboard data...")
  }

  const handleSubmitAttendance = async (formId: number, attended: boolean) => {
    if (!account) return

    try {
      setIsLoading(true)

      // Simulate network delay for realism
      await new Promise((resolve) => setTimeout(resolve, 1500))

      submitAttendance(formId, account, attended)

      toast({
        title: "Success",
        description: `Attendance ${attended ? "marked as present" : "marked as absent"}!`,
      })

      refreshData() // Refresh data after submitting attendance
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to submit attendance",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Student Dashboard</h2>
            <p className="text-gray-600">
              Welcome, <strong className="text-blue-700">{studentName}</strong>. Mark your attendance.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            Auto-refresh: 5s
          </Badge>
          <Button onClick={refreshData} size="sm" variant="ghost">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Debug Info */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm">Debug Information</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-1">
          <p>
            Your Address: <code className="bg-white px-1 rounded">{account}</code>
          </p>
          <p>
            Total Forms in System: <Badge variant="outline">{forms.length}</Badge>
          </p>
          <p>
            Available Forms: <Badge variant="default">{availableForms.length}</Badge>
          </p>
          <p>
            Completed Forms: <Badge variant="secondary">{completedForms.length}</Badge>
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Available Forms ({availableForms.length})</span>
          </h3>

          {availableForms.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No attendance forms available</p>
                <p className="text-sm text-gray-500">
                  {forms.length === 0 ? "No forms have been created yet" : "You are not enrolled in any open forms"}
                </p>
                <Button onClick={refreshData} variant="outline" size="sm" className="mt-4">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Check for New Forms
                </Button>
              </CardContent>
            </Card>
          ) : (
            availableForms.map((form) => {
              const course = getCourse(form.courseId)
              const teacherName = getNameByAddress(form.teacher)
              return (
                <Card key={form.formId} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{form.description}</CardTitle>
                        <CardDescription>
                          {course?.name} • Created by <strong className="text-gray-700">{teacherName}</strong>
                        </CardDescription>
                      </div>
                      <Badge variant="default">Open</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600">
                        <p>Form ID: {form.formId}</p>
                        <p>Students Enrolled: {form.enrolledStudents.length}</p>
                        <p>Currently Present: {form.presentCount}</p>
                        <p>Opened: {new Date(form.openTimestamp).toLocaleString()}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleSubmitAttendance(form.formId, true)}
                          disabled={isLoading}
                          className="flex-1"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Mark Present
                        </Button>
                        <Button
                          onClick={() => handleSubmitAttendance(form.formId, false)}
                          disabled={isLoading}
                          variant="outline"
                          className="flex-1"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4 mr-2" />
                          )}
                          Mark Absent
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span>Completed Forms ({completedForms.length})</span>
          </h3>

          {completedForms.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No completed forms yet</p>
                <p className="text-sm text-gray-500">Your attendance history will appear here</p>
              </CardContent>
            </Card>
          ) : (
            completedForms.map((form) => {
              const course = getCourse(form.courseId)
              const studentResponse = form.responses[account!]
              const teacherName = getNameByAddress(form.teacher)
              return (
                <Card key={form.formId} className="border-l-4 border-l-gray-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{form.description}</CardTitle>
                        <CardDescription>
                          {course?.name} • Created by <strong className="text-gray-700">{teacherName}</strong>
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <Badge variant={form.status === "open" ? "default" : "secondary"}>
                          {form.status === "open" ? "Open" : "Closed"}
                        </Badge>
                        {studentResponse && (
                          <Badge variant={studentResponse.attended ? "default" : "destructive"}>
                            {studentResponse.attended ? "Present" : "Absent"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600">
                      <p>Form ID: {form.formId}</p>
                      <p>
                        Total Attendance:{" "}
                        {form.enrolledStudents.length > 0
                          ? Math.round((form.presentCount / form.enrolledStudents.length) * 100)
                          : 0}
                        %
                      </p>
                      {studentResponse && <p>Submitted: {new Date(studentResponse.timestamp).toLocaleString()}</p>}
                      {form.closeTimestamp > 0 && <p>Closed: {new Date(form.closeTimestamp).toLocaleString()}</p>}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>

      {/* All Forms Debug Section */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm">All Forms in System (Debug)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs">
            {forms.length === 0 ? (
              <p>No forms in system</p>
            ) : (
              forms.map((form) => (
                <div key={form.formId} className="p-2 bg-white rounded border">
                  <p>
                    <strong>Form {form.formId}:</strong> {form.description}
                  </p>
                  <p>
                    <strong>Status:</strong> {form.status}
                  </p>
                  <p>
                    <strong>Enrolled Students:</strong> {form.enrolledStudents.length}
                  </p>
                  <p>
                    <strong>Student Addresses:</strong>
                  </p>
                  <ul className="ml-4">
                    {form.enrolledStudents.map((addr, idx) => (
                      <li key={idx} className="font-mono text-xs">
                        {addr} {addr.toLowerCase() === account?.toLowerCase() ? `(YOU - ${studentName})` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}