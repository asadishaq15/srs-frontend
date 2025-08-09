"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Book, Award, Bell, TrendingUp, Calendar, Clock, Mail } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const children = [
  { id: 1, name: "Emma Johnson", grade: "11th", cgpa: 3.8 },
  { id: 2, name: "Liam Johnson", grade: "9th", cgpa: 3.5 },
]

const academicData = [
  { semester: "Fall 2022", gpa: 3.7 },
  { semester: "Spring 2023", gpa: 3.8 },
  { semester: "Fall 2023", gpa: 3.9 },
  { semester: "Spring 2024", gpa: 3.8 },
]

const notifications = [
  { id: 1, title: "Parent-Teacher Meeting", message: "Scheduled for next Friday at 3 PM", date: "2023-05-15" },
  { id: 2, title: "Report Card Available", message: "Spring 2024 report card is now available", date: "2023-05-10" },
  { id: 3, title: "School Event", message: "Annual Science Fair next month", date: "2023-05-05" },
]

export default function ParentDashboard() {
  const [selectedChild, setSelectedChild] = useState(children[0])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Parent Dashboard</h1>
          <Select
            onValueChange={(value) =>
              setSelectedChild(children.find((child) => child.id === Number.parseInt(value)) || children[0])
            }
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select child" />
            </SelectTrigger>
            <SelectContent>
              {children.map((child) => (
                <SelectItem key={child.id} value={child.id.toString()}>
                  {child.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedChild.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-8 bg-white dark:bg-gray-800 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center space-x-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={`https://i.pravatar.cc/96?u=${selectedChild.id}`} />
                    <AvatarFallback>
                      {selectedChild.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{selectedChild.name}</h2>
                    <div className="flex space-x-4">
                      <Badge variant="secondary" className="text-lg py-1 px-3">
                        <User className="w-4 h-4 mr-2" />
                        {selectedChild.grade} Grade
                      </Badge>
                      <Badge variant="secondary" className="text-lg py-1 px-3">
                        <Award className="w-4 h-4 mr-2" />
                        CGPA: {selectedChild.cgpa}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <Card className="bg-white dark:bg-gray-800 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <TrendingUp className="mr-2 h-6 w-6 text-blue-500" />
                    Academic Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={academicData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="semester" />
                        <YAxis domain={[0, 4]} />
                        <Tooltip />
                        <Area type="monotone" dataKey="gpa" stroke="#3b82f6" fill="#93c5fd" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <Book className="mr-2 h-6 w-6 text-green-500" />
                    Current Semester Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Mathematics</span>
                        <span className="font-semibold">A (95%)</span>
                      </div>
                      <Progress value={95} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Science</span>
                        <span className="font-semibold">A- (90%)</span>
                      </div>
                      <Progress value={90} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>English</span>
                        <span className="font-semibold">B+ (88%)</span>
                      </div>
                      <Progress value={88} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>History</span>
                        <span className="font-semibold">A (93%)</span>
                      </div>
                      <Progress value={93} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <Card className="bg-white dark:bg-gray-800 shadow-xl col-span-2">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <Bell className="mr-2 h-6 w-6 text-yellow-500" />
                    Recent Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex-shrink-0 mr-4">
                          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                            <Bell className="h-6 w-6 text-yellow-500" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold">{notification.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <Calendar className="mr-2 h-6 w-6 text-purple-500" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-4">
                        <Calendar className="h-6 w-6 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Science Fair</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">May 25, 2023</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4">
                        <Clock className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Parent-Teacher Meeting</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">June 2, 2023</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white dark:bg-gray-800 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <Mail className="mr-2 h-6 w-6 text-indigo-500" />
                  Contact School
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Have questions or concerns? Reach out to us directly.</p>
                <Button className="bg-indigo-500 hover:bg-indigo-600 text-white">Send Message</Button>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

