// 'use client'
// import React from 'react'
// import Image from 'next/image'
// import { useRouter } from 'next/navigation'
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import * as z from "zod"
// import { Button } from "@/components/ui/button"
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form"
// import { Input } from "@/components/ui/input"
// import axios from 'axios'

// const formSchema = z.object({
//   email: z.string().email({
//     message: "Please enter a valid email address.",
//   }),
//   password: z.string().min(3 ,{
//     message: "Password must be at least 3 characters long.",
//   }),
// })

// export default function LoginPage() {
//   const router = useRouter()

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       email: "",
//       password: "",
//     },
//   })

//   async function loginUser(email: string, password: string, type: "Teacher") {
//     try {
//       const response = await axios.post(
//         `${process.env.NEXT_PUBLIC_SRS_SERVER}/user/login`,  // replace with your API URL
//         { email, password },
//         {
//           withCredentials: true, // ❗️This enables sending/receiving cookies
//         }
//       );
  
//       console.log('Login success:', response.data);
//       localStorage.setItem('id',response.data.id)
//       router.push('/teacher/dashboard')
//       return response.data;
//     } catch (err) {
//       console.error('Login failed:', err);
//       return null;
//     }
//   }

//   function onSubmit(values: z.infer<typeof formSchema>) {

  
    
//     if(values.email.includes("admin") && values.email == "admin@example.com"){
//       router.push('/admin/dashboard')
//     }
//     else {
//       loginUser(values.email,values.password,type)
//     }    
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
//       <div className="sm:mx-auto sm:w-full sm:max-w-md">
//         <div className="flex justify-center">
//           <Image
//             src="/Logo/srs.png"
//             alt="SIS Admin Logo"
//             width={96}
//             height={96}
//             className="rounded-full"
//           />
//         </div>
//         <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//           Sign in to SRS 
//         </h2>
//       </div>

//       <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
//         <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//               <FormField
//                 control={form.control}
//                 name="email"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Email address</FormLabel>
//                     <FormControl>
//                       <Input placeholder="you@example.com" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="password"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Password</FormLabel>
//                     <FormControl>
//                       <Input type="password" placeholder="••••••••" {...field} />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <div>
//                 <Button type="submit" className="w-full">
//                   Sign in
//                 </Button>
//               </div>
//             </form>
//           </Form>

//           <div className="mt-6">
//             <div className="relative">
//               <div className="absolute inset-0 flex items-center">
//                 <div className="w-full border-t border-gray-300" />
//               </div>
//               <div className="relative flex justify-center text-sm">
//                 <span className="px-2 bg-white text-gray-500">
//                   Or continue with
//                 </span>
//               </div>
//             </div>

//             {/* <div className="mt-6 grid grid-cols-2 gap-3">
//               <Button variant="outline" className="w-full">
//                 <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
//                   <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
//                 </svg>
//                 Twitter
//               </Button>

//               <Button variant="outline" className="w-full">
//                 <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
//                   <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
//                 </svg>
//                 GitHub
//               </Button>
//             </div> */}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

"use client"
import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import axios from "axios"

// Define the role type
type UserRole = "Teacher" | "Admin" | "Secretary" | "Student" | "Parent"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(3, {
    message: "Password must be at least 3 characters long.",
  }),
  role: z.enum(["Teacher", "Admin", "Secretary", "Student", "Parent"], {
    required_error: "Please select a role.",
  }),
})

export default function LoginPage() {
  const router = useRouter()
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "Teacher",
    },
  })

  async function loginUser(email: string, password: string, role: UserRole) {
    try {
      setLoginError(null)
      setIsLoading(true)
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SRS_SERVER}/user/login`,
        { email, password, role },
        { withCredentials: true }
      )
      // Save id under the correct key for each role
      if (role === "Parent") {
        localStorage.setItem("parentId", response.data.id)
      }
      if (role === "Student") {
        localStorage.setItem("studentId", response.data.id)
      }
      localStorage.setItem("id", response.data.id)
      localStorage.setItem("role", role)
      // Route based on role
      switch (role) {
        case "Admin":
          router.push("/admin/dashboard")
          break
        case "Teacher":
          router.push("/teacher/dashboard")  
          break
        case "Secretary":
          router.push("/teacher/dashboard")
          break
        case "Student":
          router.push("/student/profile")
          break
        case "Parent":
          router.push("/parent/profile")
          break
        default:
          router.push("/")
      }
      return response.data
    } catch (err: any) {
      setLoginError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials and try again."
      )
      return null
    } finally {
      setIsLoading(false)
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Special case for admin demo account
    if (values.role === "Admin") {
      if (values.email === "admin@example.com" && values.password === "123") {
        setTimeout(() => {
          router.push("/admin/dashboard")
          setIsLoading(false)
        }, 1000)
        return
      }
      setLoginError("Invalid Credentials")
      return
    }
    if (values.role === "Secretary") {
      if (values.email === "sec@gmail.com" && values.password === "123") {
        setTimeout(() => {
          router.push("/secretary/schedule-course")
          setIsLoading(false)
        }, 1000)
        return
      }
      setLoginError("Invalid Credentials")
      return
    }
    // Regular login flow
    loginUser(values.email, values.password, values.role as UserRole)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Image src="/Logo/srs.png" alt="SRS Logo" width={96} height={96} className="rounded-full" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to SRS</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {loginError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Login as</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Teacher">Teacher</SelectItem>
                        <SelectItem value="Student">Student</SelectItem>
                        <SelectItem value="Parent">Parent</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Secretary">Secretary</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </div>
            </form>
          </Form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            {/* Social login buttons can be added here if needed */}
          </div>
        </div>
      </div>
    </div>
  )
}
