import React, { useEffect, useState } from 'react'
import { LogOut, Menu} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'

const AdminMobileSidebar = ({isSidebarOpen,setIsSidebarOpen}:{isSidebarOpen:boolean,setIsSidebarOpen:any})=> {
    const pathname = usePathname()
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false)
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
    <>
    {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b bg-white px-4 shadow-sm sm:gap-x-6 lg:hidden">
    <Button
      variant="ghost"
      size="icon"
      className="-m-2.5 p-2.5 text-gray-700"
      onClick={() => setIsSidebarOpen(true)}
    >
      <span className="sr-only">Open sidebar</span>
      <Menu className="h-6 w-6" />
    </Button>

    {/* Logo for Mobile */}
    <div className="flex flex-1 items-center gap-x-3">
      <Image src={'/Logo/srs.png'} alt='srs logo' height={8} width={8}  className="h-8 w-8 rounded-full" />
      <span className="text-xl font-semibold">SRS Admin</span>
    </div>

    {/* Mobile Profile Menu */}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="-m-2.5 p-2.5 text-gray-700">
          <span className="sr-only">Open user menu</span>
          <Image
            className="h-8 w-8 rounded-full bg-gray-50"
            src="https://external-preview.redd.it/auth0-stable-support-for-app-router-v0-9hlmLSqkruo0AYwR-TJd50zI1txBKsK5e1Qputn2lGM.jpg?width=1080&crop=smart&auto=webp&s=f25c5459703d0f6d74df1a2bc49103c8629fd396"
            alt=""
            width={32}
            height={32}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
  </>

  )
}

export default AdminMobileSidebar