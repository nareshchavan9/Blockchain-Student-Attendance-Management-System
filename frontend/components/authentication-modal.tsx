"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield, BookOpen, GraduationCap, Lock } from "lucide-react"

interface AuthenticationModalProps {
  role: "admin" | "teacher" | "student"
  onSuccess: () => void
  onCancel: () => void
}

const roleConfig = {
  admin: {
    icon: Shield,
    color: "red",
    key: "1111",
    title: "Administrator Authentication",
    description: "Enter the admin authentication key to continue",
  },
  teacher: {
    icon: BookOpen,
    color: "green",
    key: "2222",
    title: "Teacher Authentication",
    description: "Enter the teacher authentication key to continue",
  },
  student: {
    icon: GraduationCap,
    color: "blue",
    key: "3333",
    title: "Student Authentication",
    description: "Enter the student authentication key to continue",
  },
}

export default function AuthenticationModal({ role, onSuccess, onCancel }: AuthenticationModalProps) {
  const [authKey, setAuthKey] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const config = roleConfig[role]
  const IconComponent = config.icon

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate authentication delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (authKey === config.key) {
      onSuccess()
    } else {
      setError("Invalid authentication key. Please try again.")
    }

    setIsLoading(false)
  }

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4)
    setAuthKey(value)
    setError("")
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div
            className={`mx-auto mb-4 w-16 h-16 bg-${config.color}-100 rounded-full flex items-center justify-center`}
          >
            <IconComponent className={`w-8 h-8 text-${config.color}-600`} />
          </div>
          <CardTitle className="text-xl">{config.title}</CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="auth-key" className="flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>Authentication Key</span>
              </Label>
              <Input
                id="auth-key"
                type="password"
                placeholder="Enter 4-digit key"
                value={authKey}
                onChange={handleKeyChange}
                maxLength={4}
                className="text-center text-lg tracking-widest"
                autoFocus
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>

            <div className="flex space-x-2">
              <Button type="button" onClick={onCancel} variant="outline" className="flex-1" disabled={isLoading}>
                Cancel
              </Button>
              <Button
                type="submit"
                className={`flex-1 bg-${config.color}-600 hover:bg-${config.color}-700`}
                disabled={authKey.length !== 4 || isLoading}
              >
                {isLoading ? "Authenticating..." : "Authenticate"}
              </Button>
            </div>
          </form>

          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              <strong>Demo Keys:</strong> Admin: 1111, Teacher: 2222, Student: 3333
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
