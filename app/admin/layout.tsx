"use client"

import type React from "react"
import { Calendar, FileText, LayoutDashboard, Plus, UserPlus } from "lucide-react"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import AdminSidebar from "./components/Admin-Sidebar/AdminSidebar"
import AdminMobileSidebar from "./components/Admin-Mobile-Sidebar/AdminMobileSidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Manage Students", href: "/admin/manage-students", icon: UserPlus },
    { name: "Manage Teachers", href: "/admin/manage-teachers", icon: Plus },
    { name: "Generate Report", href: "/admin/generate-report", icon: FileText },
    { name: "Recent Activity", href: "/admin/activities", icon: Calendar }, 
    // { name: "Add Course", href: "/admin/add-course", icon: Plus },

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
      <AdminSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* Main Content */}
      <div className="flex w-full flex-1 flex-col lg:pl-72">
        {/* Top Navbar for Mobile */}
        <AdminMobileSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

        {/* Page Content */}
        <main className="flex-1">{children}</main>

        {/* Toast Notification Container */}
        <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        limit={1}
      />    </div>
    </div>
  )
}
