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
import Link from 'next/link'

const SidebarProfile = ({title}:{title:string}) => {
  return (
    <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-16 w-full justify-start gap-x-4 px-6 py-3 hover:bg-gray-50">
                      <Image
                        className="h-8 w-8 rounded-full bg-gray-50"
                        src="/Logo/srs.png"
                        alt=""
                        width={32}
                        height={32}
                      />
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-semibold leading-6 text-gray-900">SRS</span>
                        <span className="text-xs leading-6 text-gray-400">{title}</span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                    <Link href={'/'} className='flex cursor-pointer' >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                      </Link>

                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
  )
}

export default SidebarProfile