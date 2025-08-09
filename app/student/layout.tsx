"use client"

import type React from "react"

import { Calendar, FileText, LayoutDashboard, LogOut, Menu, Plus, School, UserCheck, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import StudentSidebar from "./components/Student-Sidebar/StudentSidebar"
import StudentMobileSidebar from "./components/Student-Mobile-Sidebar/StudentMobileSidebar"

export default function TeachersPortal({
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
      name: "My Profile",
      href: "/student/profile",
      icon: LayoutDashboard,
    },
    {
      name: "Attendance",
      href: "/student/attendance",
      icon: UserCheck,
    },
    {
      name: "Grades",
      href: "/student/results",
      icon: Plus,
    },
    {
      name: "Classes Schedule",
      href: "/student/schedule",
      icon: FileText,
    }, 
    {
        name: "Communication",
        href: "/student/communication",
        icon: FileText,
      },
  ]

  if (!isMounted) {
    return null
  }

  return (
    <div className="relative flex min-h-screen">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <StudentSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Main Content */}
      <div className="flex w-full flex-1 flex-col lg:pl-72">
        <StudentMobileSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} /> 
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
