import React, { useEffect, useState } from 'react'
import { Calendar, FileText, LayoutDashboard, LogOut, Menu, Plus, School, UserPlus, X } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import Link from 'next/link'
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'
import SidebarProfile from '@/components/SidebarProfile'

const AdminSidebar = ({isSidebarOpen,setIsSidebarOpen}:{isSidebarOpen:boolean,setIsSidebarOpen:any}) => {
    const pathname = usePathname()
  // const [isSidebarOpen, setIsSidebarOpen] = useState(false)
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
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Manage Students",
      href: "/admin/manage-students",
      icon: UserPlus,
    },
    {
      name: "Manage Teachers",
      href: "/admin/manage-teachers",
      icon: Plus,
    },
    {
      name: "Generate Report",
      href: "/admin/generate-report",
      icon: FileText,
    },
    {
      name: "Recent Activity",
      href: "/admin/activities",
      icon: Calendar,
    },  
    {
      name: "Add Course",
      href: "/admin/add-course",
      icon: Plus,
    }, 
    {
      name: "Schedule Course",
      href: "/admin/schedule-course",
      icon: Plus,
    }, 
    {
      name: "Departments",
      href: "/admin/departments",
      icon: Plus,
    },
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
          {/* Logo and Close Button */}
          <div className="flex h-16 shrink-0 items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
    <Image
      src="/Logo/srs.png"
      alt="SRS Admin Logo"
      width={44}
      height={32}
      className="h-12 w-12  rounded-full"
    />
    <span className="text-xl font-semibold">SRS Admin</span>
  </Link>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>

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
                <SidebarProfile title='Administrator' />
              </li>
            </ul>
          </nav>
        </div>
      </div>
  )
}

export default AdminSidebar