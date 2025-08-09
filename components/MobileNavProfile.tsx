import React from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { Button } from './ui/button'
import Image from 'next/image'
import { LogOut } from 'lucide-react'

const MobileNavProfile = () => {
  return (
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
  )
}

export default MobileNavProfile