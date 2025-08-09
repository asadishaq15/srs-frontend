// app/parent/layout.tsx
"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { 
  User, Calendar, FileText, Book, Bell, MessageSquare, 
  ClipboardList, FileCheck, AlertTriangle, Clock
} from "lucide-react"

import ParentMobileSidebar from "./components/Parent-Mobile-Sidebar/ParentMobileSidebar"

import { StudentProvider } from "./context/StudentContext"
import ParentSidebar from "./components/Parent-Sidebar/ParentSidebar"


export default function ParentPortal({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  const navigation = [
    {
      name: "Student Profile",
      href: "/parent/profile",
      icon: User,
    },
    {
      name: "Attendance",
      href: "/parent/attendance",
      icon: Clock,
    },
    {
      name: "Grades & Reports",
      href: "/parent/grades",
      icon: Book,
    },
    {
      name: "Class Schedule",
      href: "/parent/schedule",
      icon: FileText,
    },
    {
      name: "Homework & Assignments",
      href: "/parent/homework",
      icon: ClipboardList,
    },
    {
      name: "School Calendar",
      href: "/parent/calendar",
      icon: Calendar,
    },
    {
      name: "Announcements",
      href: "/parent/announcements",
      icon: Bell,
    },
    {
      name: "Communication",
      href: "/parent/communication",
      icon: MessageSquare,
    },
    {
      name: "Behavior Log",
      href: "/parent/behavior",
      icon: AlertTriangle,
    },
    {
      name: "Submit Absence",
      href: "/parent/absence",
      icon: FileCheck,
    },
    {
      name: "Documents & Forms",
      href: "/parent/documents",
      icon: FileCheck,
    },
  ]

  if (!isMounted) {
    return null
  }

  return (
    <StudentProvider>
      <div className="relative flex min-h-screen">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-white transition-opacity lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <ParentSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        {/* Main Content */}
        <div className="flex w-full flex-1 flex-col lg:pl-72">
          <ParentMobileSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /> 
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </StudentProvider>
  )
}