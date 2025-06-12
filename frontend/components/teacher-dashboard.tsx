// teacher-dashboard.tsx

"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Plus, ClipboardList, Loader2, RefreshCw, Copy } from "lucide-react"
import { useWeb3 } from "@/hooks/use-web3"
import { useDataStore } from "@/hooks/use-data-store"
import { useToast } from "@/hooks/use-toast"
import { ethers } from "ethers"
import { getNameByAddress } from "@/lib/address-map"

export default function TeacherDashboard() {
  const { account } = useWeb3()
  const {
    isTeacherRegistered,
    createCourse,
    getTeacherCourses,
    createAttendanceForm,
    closeAttendanceForm,
    getFormsByTeacher,
    getCourse,
    teachers,
  } = useDataStore()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Form states
  const [courseName, setCourseName] = useState("")
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [formDescription, setFormDescription] = useState("")
  const [studentAddresses, setStudentAddresses] = useState("")

  const teacherName = useMemo(() => getNameByAddress(account), [account])

  // Use useMemo to compute data instead of useEffect with state
  const courses = useMemo(() => {
    if (!account) return []
    return getTeacherCourses(account)
  }, [account, getTeacherCourses, refreshKey])

  const forms = useMemo(() => {
    if (!account) return []
    return getFormsByTeacher(account)
  }, [account, getFormsByTeacher, refreshKey])

  const [isRegistered, setIsRegistered] = useState(false)

  // Check if teacher is registered whenever account or teachers change
  useEffect(() => {
    if (account) {
      setIsRegistered(isTeacherRegistered(account))
    }
  }, [account, teachers, isTeacherRegistered])

  // Force refresh data
  const refreshData = () => {
    setRefreshKey((prev) => prev + 1)
  }

  // Copy current account address to clipboard
  const copyAccountAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account)
      toast({
        title: "Copied!",
        description: "Account address copied to clipboard",
      })
    }
  }

  // Add current account to student addresses
  const addCurrentAccount = () => {
    if (account) {
      const currentAddresses = studentAddresses.split("\n").filter((addr) => addr.trim())
      if (!currentAddresses.some((addr) => addr.toLowerCase() === account.toLowerCase())) {
        setStudentAddresses((prev) => (prev ? `${prev}\n${account}` : account))
        toast({
          title: "Added",
          description: "Your account address added to student list",
        })
      } else {
        toast({
          title: "Already Added",
          description: "Your account is already in the student list",
        })
      }
    }
  }

  const handleCreateCourse = async () => {
    if (!account || !courseName || !isRegistered) return

    try {
      setIsLoading(true)

      // Simulate network delay for realism
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const newCourse = createCourse(courseName, account)

      toast({
        title: "Success",
        description: `Course "${newCourse.name}" created successfully!`,
      })

      setCourseName("")
      refreshData() // Refresh data after creating course
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create course",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateAttendanceForm = async () => {
    if (!account || !selectedCourseId || !formDescription || !studentAddresses || !isRegistered) return

    try {
      setIsLoading(true)
      const addresses = studentAddresses
        .split("\n")
        .map((addr) => addr.trim())
        .filter((addr) => addr)

      // Validate addresses
      for (const addr of addresses) {
        if (!ethers.isAddress(addr)) {
          toast({
            title: "Error",
            description: `Invalid address: ${addr}`,
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
      }

      console.log("Creating form with addresses:", addresses)

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const newForm = createAttendanceForm(selectedCourseId, account, formDescription, addresses)

      console.log("Created form:", newForm)

      toast({
        title: "Success",
        description: `Attendance form "${newForm.description}" created successfully with ${addresses.length} students!`,
      })

      setFormDescription("")
      setStudentAddresses("")
      setSelectedCourseId(null)
      refreshData() // Refresh data after creating form
    } catch (error: any) {
      console.error("Error creating form:", error)
      toast({
        title: "Error",
        description: "Failed to create attendance form",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseForm = async (formId: number) => {
    try {
      setIsLoading(true)

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      closeAttendanceForm(formId)

      toast({
        title: "Success",
        description: "Attendance form closed successfully!",
      })

      refreshData() // Refresh data after closing form
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to close form",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isRegistered) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Teacher Registration Required</h3>
            <p className="text-gray-600 mb-4">
              You need to be registered as a teacher by an admin to access this dashboard.
            </p>
            <p className="text-sm text-gray-500">
              Please contact an administrator to register your wallet address: <br />
              <strong className="text-lg">{teacherName}</strong>
              <br />
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">{account}</code>
            </p>
            <Button onClick={refreshData} variant="outline" className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Registration Status
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h2>
            <p className="text-gray-600">
              Welcome, <strong className="text-green-700">{teacherName}</strong>. Manage your courses and attendance.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600">
            Registered Teacher
          </Badge>
          <Button onClick={refreshData} size="sm" variant="ghost">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="courses">My Courses ({courses.length})</TabsTrigger>
          <TabsTrigger value="create-course">Create Course</TabsTrigger>
          <TabsTrigger value="attendance">Attendance Forms ({forms.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          {courses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No courses created yet</p>
                <p className="text-sm text-gray-500">Create your first course to get started</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Card key={course.courseId}>
                  <CardHeader>
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    <CardDescription>Course ID: {course.courseId}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <Badge variant={course.isActive ? "default" : "secondary"}>
                          {course.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Forms</span>
                        <Badge variant="outline">{course.formIds.length}</Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        Created: {new Date(course.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create-course" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Create New Course</span>
              </CardTitle>
              <CardDescription>Add a new course to start managing attendance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="course-name">Course Name</Label>
                <Input
                  id="course-name"
                  placeholder="e.g., Computer Science 101"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateCourse} disabled={!courseName || isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Course...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Course
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ClipboardList className="w-5 h-5" />
                <span>Create Attendance Form</span>
              </CardTitle>
              <CardDescription>Create a new attendance form for your students</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="course-select">Select Course</Label>
                <select
                  id="course-select"
                  className="w-full p-2 border rounded-md"
                  value={selectedCourseId || ""}
                  onChange={(e) => setSelectedCourseId(Number(e.target.value) || null)}
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.courseId} value={course.courseId}>
                      {course.name} (ID: {course.courseId})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="form-description">Form Description</Label>
                <Input
                  id="form-description"
                  placeholder="e.g., Lecture 1 - Introduction"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="student-addresses">Student Addresses (one per line)</Label>
                  <div className="flex space-x-2">
                    <Button onClick={copyAccountAddress} size="sm" variant="outline">
                      <Copy className="w-3 h-3 mr-1" />
                      Copy My Address
                    </Button>
                    <Button onClick={addCurrentAccount} size="sm" variant="outline">
                      <Plus className="w-3 h-3 mr-1" />
                      Add Me
                    </Button>
                  </div>
                </div>
                <Textarea
                  id="student-addresses"
                  placeholder="0x123...
0x456...
0x789..."
                  value={studentAddresses}
                  onChange={(e) => setStudentAddresses(e.target.value)}
                  rows={5}
                />
                <p className="text-xs text-gray-500">
                  Tip: Use "Add Me" button to include your own address for testing
                </p>
              </div>
              <Button
                onClick={handleCreateAttendanceForm}
                disabled={!selectedCourseId || !formDescription || !studentAddresses || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Form...
                  </>
                ) : (
                  <>
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Create Attendance Form
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          {forms.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No attendance forms created yet</p>
                <p className="text-sm text-gray-500">Create a course first, then add attendance forms</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {forms.map((form) => {
                const course = getCourse(form.courseId)
                const isOpen = form.status === "open"

                return (
                  <Card key={form.formId}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{form.description}</CardTitle>
                          <CardDescription>
                            {course?.name} • Form ID: {form.formId}
                          </CardDescription>
                        </div>
                        <Badge variant={isOpen ? "default" : "secondary"}>{isOpen ? "Open" : "Closed"}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{form.enrolledStudents.length}</div>
                          <div className="text-sm text-gray-600">Enrolled</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{form.presentCount}</div>
                          <div className="text-sm text-gray-600">Present</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {Object.keys(form.responses).length - form.presentCount}
                          </div>
                          <div className="text-sm text-gray-600">Absent</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {form.enrolledStudents.length > 0
                              ? Math.round((form.presentCount / form.enrolledStudents.length) * 100)
                              : 0}
                            %
                          </div>
                          <div className="text-sm text-gray-600">Attendance</div>
                        </div>
                      </div>

                      {/* Show enrolled students */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Enrolled Students:</p>
                        <div className="text-xs space-y-1">
                          {form.enrolledStudents.map((addr, idx) => (
                            <div
                              key={idx}
                              className="bg-gray-50 p-2 rounded flex items-center justify-between text-sm"
                            >
                              <div>
                                <span className="font-medium">{getNameByAddress(addr)}</span>
                                {addr.toLowerCase() === account?.toLowerCase() && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    YOU
                                  </Badge>
                                )}
                              </div>
                              <code className="text-xs text-gray-500 font-mono">{addr}</code>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Created: {new Date(form.createdAt).toLocaleDateString()}
                          {form.closeTimestamp > 0 && (
                            <span> • Closed: {new Date(form.closeTimestamp).toLocaleDateString()}</span>
                          )}
                        </div>
                        {isOpen && (
                          <Button
                            onClick={() => handleCloseForm(form.formId)}
                            disabled={isLoading}
                            variant="outline"
                            size="sm"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Closing...
                              </>
                            ) : (
                              "Close Form"
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}