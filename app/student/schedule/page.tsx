"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { format, addDays } from "date-fns"
import { Calendar, Clock, MapPin, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface ScheduleItem {
  _id: string
  courseId: {
    _id: string
    courseCode: string
    courseName: string
    description: string
    courseCredit: number
  }
  className: string
  section: string
  teacherId: {
    _id: string
    firstName: string
    lastName: string
    email: string
    department: string
  }
  dayOfWeek: Array<{
    date: string
    startTime: string
    endTime: string
  }>
}

interface Class {
  id: string
  name: string
  time: string
  location: string
  startTime: string
  endTime: string
}

export default function Schedule() {
  const [todayClasses, setTodayClasses] = useState<Class[]>([])
  const [tomorrowClasses, setTomorrowClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("today")

  const fetchSchedule = async (date: string) => {
    try {
      setLoading(true)
      const studentId = localStorage.getItem("id")

      if (!studentId) {
        throw new Error("Student ID not found in localStorage")
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_SRS_SERVER}/schedule/by-student?studentId=${studentId}&date=${date}`

      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error(`Failed to fetch schedule: ${response.statusText}`)
      }

      const data: ScheduleItem[] = await response.json()
      return transformScheduleData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return []
    } finally {
      setLoading(false)
    }
  }

  const transformScheduleData = (data: ScheduleItem[]): Class[] => {
    const classes: Class[] = []

    data.forEach((item) => {
      item.dayOfWeek.forEach((schedule) => {
        classes.push({
          id: `${item._id}-${schedule.date}`,
          name: item.courseId.courseName,
          time: `${schedule.startTime} - ${schedule.endTime}`,
          location: `Grade Level ${item.className}`,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
        })
      })
    })

    return classes
  }

  useEffect(() => {
    const loadSchedules = async () => {
      setLoading(true)
      try {
        const [todayData, tomorrowData] = await Promise.all([fetchSchedule("today"), fetchSchedule("tomorrow")])

        setTodayClasses(todayData)
        setTomorrowClasses(tomorrowData)
      } catch (err) {
        setError("Failed to load schedules")
      } finally {
        setLoading(false)
      }
    }

    loadSchedules()
  }, [])

  const handleTabChange = async (value: string) => {
    setActiveTab(value)

    // If we don't have data for the selected tab, fetch it
    if (value === "today" && todayClasses.length === 0) {
      const data = await fetchSchedule("today")
      setTodayClasses(data)
    } else if (value === "tomorrow" && tomorrowClasses.length === 0) {
      const data = await fetchSchedule("tomorrow")
      setTomorrowClasses(data)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-lg text-gray-600 dark:text-gray-400">Loading schedule...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-red-500 text-lg mb-4">Error loading schedule</p>
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 dark:text-white">Class Schedule</h1>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
          </TabsList>
          <TabsContent value="today">
            <ScheduleDay classes={todayClasses} day="Today" />
          </TabsContent>
          <TabsContent value="tomorrow">
            <ScheduleDay classes={tomorrowClasses} day="Tomorrow" />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}

function ScheduleDay({ classes, day }: { classes: Class[]; day: string }) {
  const currentDate = day === "Today" ? new Date() : addDays(new Date(), 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Calendar className="w-6 h-6 mr-2 text-blue-500" />
          {day}'s Schedule ({format(currentDate, "MMMM d, yyyy")})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {classes.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">No classes scheduled for {day.toLowerCase()}.</p>
        ) : (
          <div className="space-y-6">
            {classes.map((cls, index) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{cls.name}</h3>
                      <Badge variant="secondary" className="text-sm">
                        {cls.startTime}
                      </Badge>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{cls.time}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{cls.location}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
