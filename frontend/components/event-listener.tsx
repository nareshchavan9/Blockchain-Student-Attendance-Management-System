"use client"

import { useEffect } from "react"
import { useDataStore } from "@/hooks/use-data-store"

// This component listens for localStorage changes across tabs/windows
export default function EventListener() {
  const { teachers, courses, forms } = useDataStore()

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && event.key.startsWith("attendance_")) {
        // Force page refresh when relevant storage changes
        window.location.reload()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  // This component doesn't render anything
  return null
}
