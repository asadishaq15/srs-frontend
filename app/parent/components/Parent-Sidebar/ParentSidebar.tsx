// app/parent/components/Parent-Sidebar/ParentSidebar.tsx

import React, { useEffect, useState } from 'react'
import { 
  User, Calendar, FileText, Book, Bell, MessageSquare, 
  ClipboardList, FileCheck, AlertTriangle, Clock, X
} from "lucide-react"
import Link from 'next/link'
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import SidebarProfile from '@/components/SidebarProfile'
import StudentSelector from '../StudentSelector'


const ParentSidebar = ({isSidebarOpen, setIsSidebarOpen}:{isSidebarOpen:boolean, setIsSidebarOpen:any}) => {
  const pathname = usePathname()
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
    // {
    //   name: "Communication",
    //   href: "/parent/communication",
    //   icon: MessageSquare,
    // },
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
    // {
    //   name: "Documents & Forms",
    //   href: "/parent/documents",
    //   icon: FileCheck,
    // },
  ]

  if (!isMounted) {
    return null
  }

  return (
    <div
      className={cn(
        "fixed inset-y-0 z-50 flex w-72 flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      {/* Sidebar container */}
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-white px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center justify-between">
          <Link href="/parent" className="flex items-center gap-2">
            <Image
              src="/Logo/srs.png"
              alt="SRS Parent Logo"
              width={44}
              height={32}
              className="h-12 w-12 rounded-full"
            />
            <span className="text-xl font-semibold">SRS Parent</span>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Student Selector */}
        <StudentSelector />
        <Separator className="my-2" />

        {/* Primary Navigation */}
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            {/* Primary Nav Items */}
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`
                          group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6
                          ${isActive ? "bg-gray-50 text-black" : "text-gray-700 hover:bg-gray-50 hover:text-black"}
                        `}
                      >
                        <item.icon
                          className={`h-6 w-6 shrink-0 ${
                            isActive ? "text-black" : "text-gray-400 group-hover:text-black"
                          }`}
                        />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>

            {/* Profile */}
            <li className="-mx-6 mt-auto">
              <Separator className="mb-2" />
              <SidebarProfile title={"Parent"} />
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}

export default ParentSidebar