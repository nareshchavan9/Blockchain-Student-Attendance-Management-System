"use client"
import { useCallback } from "react"
import { useLocalStorage } from "./use-local-storage"

export interface Teacher {
  address: string
  registeredAt: string
  isActive: boolean
}

export interface Course {
  courseId: number
  name: string
  teacher: string
  formIds: number[]
  isActive: boolean
  createdAt: string
}

export interface AttendanceForm {
  formId: number
  courseId: number
  teacher: string
  enrolledStudents: string[]
  responses: { [studentAddress: string]: { attended: boolean; timestamp: string } }
  presentCount: number
  openTimestamp: number
  closeTimestamp: number
  status: "open" | "closed"
  description: string
  createdAt: string
}

export function useDataStore() {
  const [teachers, setTeachers] = useLocalStorage<Teacher[]>("attendance_teachers", [])
  const [courses, setCourses] = useLocalStorage<Course[]>("attendance_courses", [])
  const [forms, setForms] = useLocalStorage<AttendanceForm[]>("attendance_forms", [])
  const [courseCounter, setCourseCounter] = useLocalStorage<number>("course_counter", 0)
  const [formCounter, setFormCounter] = useLocalStorage<number>("form_counter", 0)

  // Teacher management
  const registerTeacher = useCallback(
    (address: string) => {
      const newTeacher: Teacher = {
        address,
        registeredAt: new Date().toISOString(),
        isActive: true,
      }
      setTeachers((prev) => [...prev.filter((t) => t.address.toLowerCase() !== address.toLowerCase()), newTeacher])
      return newTeacher
    },
    [setTeachers],
  )

  const unregisterTeacher = useCallback(
    (address: string) => {
      setTeachers((prev) =>
        prev.map((t) => (t.address.toLowerCase() === address.toLowerCase() ? { ...t, isActive: false } : t)),
      )
    },
    [setTeachers],
  )

  const isTeacherRegistered = useCallback(
    (address: string) => {
      return teachers.some((t) => t.address.toLowerCase() === address.toLowerCase() && t.isActive)
    },
    [teachers],
  )

  // Course management
  const createCourse = useCallback(
    (name: string, teacherAddress: string) => {
      const newCourseId = courseCounter + 1
      const newCourse: Course = {
        courseId: newCourseId,
        name,
        teacher: teacherAddress,
        formIds: [],
        isActive: true,
        createdAt: new Date().toISOString(),
      }
      setCourses((prev) => [...prev, newCourse])
      setCourseCounter(newCourseId)
      return newCourse
    },
    [courseCounter, setCourses, setCourseCounter],
  )

  const getTeacherCourses = useCallback(
    (teacherAddress: string) => {
      return courses.filter(
        (course) => course.teacher.toLowerCase() === teacherAddress.toLowerCase() && course.isActive,
      )
    },
    [courses],
  )

  const getCourse = useCallback(
    (courseId: number) => {
      return courses.find((course) => course.courseId === courseId)
    },
    [courses],
  )

  // Form management
  const createAttendanceForm = useCallback(
    (courseId: number, teacherAddress: string, description: string, studentAddresses: string[]) => {
      const newFormId = formCounter + 1
      const newForm: AttendanceForm = {
        formId: newFormId,
        courseId,
        teacher: teacherAddress,
        enrolledStudents: studentAddresses,
        responses: {},
        presentCount: 0,
        openTimestamp: Date.now(),
        closeTimestamp: 0,
        status: "open",
        description,
        createdAt: new Date().toISOString(),
      }

      setForms((prev) => [...prev, newForm])
      setFormCounter(newFormId)

      // Update course to include this form
      setCourses((prev) =>
        prev.map((course) =>
          course.courseId === courseId ? { ...course, formIds: [...course.formIds, newFormId] } : course,
        ),
      )

      return newForm
    },
    [formCounter, setForms, setFormCounter, setCourses],
  )

  const submitAttendance = useCallback(
    (formId: number, studentAddress: string, attended: boolean) => {
      setForms((prev) =>
        prev.map((form) => {
          if (form.formId === formId && form.status === "open") {
            const newResponses = {
              ...form.responses,
              [studentAddress]: { attended, timestamp: new Date().toISOString() },
            }

            const newPresentCount = Object.values(newResponses).filter((response) => response.attended).length

            return {
              ...form,
              responses: newResponses,
              presentCount: newPresentCount,
            }
          }
          return form
        }),
      )
    },
    [setForms],
  )

  const closeAttendanceForm = useCallback(
    (formId: number) => {
      setForms((prev) =>
        prev.map((form) =>
          form.formId === formId
            ? {
                ...form,
                status: "closed" as const,
                closeTimestamp: Date.now(),
              }
            : form,
        ),
      )
    },
    [setForms],
  )

  const getStudentForms = useCallback(
    (studentAddress: string) => {
      return forms.filter((form) =>
        form.enrolledStudents.some((addr) => addr.toLowerCase() === studentAddress.toLowerCase()),
      )
    },
    [forms],
  )

  const getAvailableForms = useCallback(
    (studentAddress: string) => {
      return forms.filter(
        (form) =>
          form.status === "open" &&
          form.enrolledStudents.some((addr) => addr.toLowerCase() === studentAddress.toLowerCase()) &&
          !form.responses[studentAddress],
      )
    },
    [forms],
  )

  const getCompletedForms = useCallback(
    (studentAddress: string) => {
      return forms.filter(
        (form) =>
          form.enrolledStudents.some((addr) => addr.toLowerCase() === studentAddress.toLowerCase()) &&
          (form.responses[studentAddress] || form.status === "closed"),
      )
    },
    [forms],
  )

  const getFormsByTeacher = useCallback(
    (teacherAddress: string) => {
      return forms.filter((form) => form.teacher.toLowerCase() === teacherAddress.toLowerCase())
    },
    [forms],
  )

  return {
    // Data
    teachers,
    courses,
    forms,

    // Teacher methods
    registerTeacher,
    unregisterTeacher,
    isTeacherRegistered,

    // Course methods
    createCourse,
    getTeacherCourses,
    getCourse,

    // Form methods
    createAttendanceForm,
    submitAttendance,
    closeAttendanceForm,
    getStudentForms,
    getAvailableForms,
    getCompletedForms,
    getFormsByTeacher,
  }
}
