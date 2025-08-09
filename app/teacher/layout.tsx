"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import TeacherSidebar from "./components/Teacher-Sidebar/TeacherSidebar"
import TeacherMobileSidebar from "./components/Teacher-Mobile-Sidebar/TeacherMobileSidebar" 
import { ToastContainer } from "react-toastify"


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
      <TeacherSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      
      {/* Main Content */}
      <div className="flex w-full flex-1 flex-col lg:pl-72">

      {/* Mob Sidebar */}
      <TeacherMobileSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}/>

        <main className="flex-1">{children} 
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
                /> 
           </main> 
      </div>
    </div>
  )
}
