"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, Users, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getLocalStorageValue } from "@/lib/utils"

// Define types for the activity data
interface Activity {
  _id: string
  title: string
  subtitle: string
  createdAt: string
  performBy: string
}

interface ApiResponse {
  data: Activity[]
}

interface TransformedActivity {
  id: string
  type: string
  title: string
  description: string
  timestamp: string
  user: string
  status: string
}

interface TeacherStats {
  success: boolean
  totalStudents: number
  todayClasses: number
}

interface ScheduleClass {
  _id: string
  courseId: {
    _id: string
    courseCode: string
    courseName: string
    duration: string
  }
  className: string
  section: string
  note: string
  teacherId: {
    _id: string
    firstName: string
    lastName: string
  }
  dayOfWeek: {
    date: string
    startTime: string
    endTime: string
  }[]
}

interface ScheduleResponse {
  data: ScheduleClass[]
  total: number
}

export default function TeacherDashboard() {
  const router = useRouter()
  const [activities, setActivities] = useState<TransformedActivity[]>([])
  const [teacherStats, setTeacherStats] = useState<TeacherStats>({ success: false, totalStudents: 0, todayClasses: 0 })
  const [scheduledClasses, setScheduledClasses] = useState<ScheduleClass[]>([])
  const [dateOption, setDateOption] = useState<string>("today")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const teacherId = getLocalStorageValue("id")

  // Helper function to get relative time
  const getRelativeTime = (date: Date): string => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return `${Math.floor(diffInSeconds / 86400)} days ago`
  }

  const fetchActivities = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_SRS_SERVER}/activity?performBy=Teacher`)

      if (!response.ok) {
        throw new Error("Failed to fetch activities")
      }

      const data: ApiResponse = await response.json()

      console.log('activity', data)

      const transformedActivities = data.data.map((activity) => {
        const timestamp = getRelativeTime(new Date(activity.createdAt))

        return {
          id: activity._id,
          type: "enrollment",
          title: activity.title,
          description: activity.subtitle,
          timestamp,
          user: activity.performBy,
          status: "completed",
        }
      })

      setActivities(transformedActivities)
    } catch (err) {
      console.error("Error fetching activities:", err)
      setError("Failed to load activities. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }
  function getDayName(offset) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const todayIndex = today.getDay();
    const targetIndex = (todayIndex + offset + 7) % 7; 
    return days[targetIndex];
  }
  const fetchTeacherStats = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SRS_SERVER}/schedule/getTotalStudentsAssignedToTeacher/${teacherId}`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch teacher stats")
      }

      const data: TeacherStats = await response.json()
      console.log('teacherStats',data)
      setTeacherStats(data)
    } catch (err) {
      console.error("Error fetching teacher stats:", err)
    }
  }

  const fetchScheduledClasses = async (date: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SRS_SERVER}/schedule?teacherId=${teacherId}&date=${date}`)

      if (!response.ok) {
        throw new Error("Failed to fetch scheduled classes")
      }

      const data: ScheduleResponse = await response.json()
      setScheduledClasses(data.data)
    } catch (err) {
      console.error("Error fetching scheduled classes:", err)
    }
  } 
  const [currentDay , setCurrent] = useState<any>(getDayName(0));

  const handleDateChange = (value: string) => {
    setDateOption(value) 
    let dayName;  
    if (value === 'today') { 
      dayName = getDayName(0)  
    } else if (value === 'yesterday') { 
      dayName = getDayName(-1)
    } 
    else  { 
      dayName = getDayName(1)
    } 
    setCurrent(dayName)
      
    fetchScheduledClasses(value)
  }

  useEffect(() => {
    fetchActivities()
    fetchTeacherStats()
    fetchScheduledClasses(dateOption)
  }, [])

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
        <Button variant="outline" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes Today</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacherStats.todayClasses}</div>
            <p className="text-xs text-muted-foreground">Today's scheduled classes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacherStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">assigned to you</p>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Classes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Scheduled Classes</CardTitle>
          <div className="w-[180px]">
            <Select value={dateOption} onValueChange={handleDateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduledClasses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    No scheduled classes found
                  </TableCell>
                </TableRow>
              ) : (
                scheduledClasses.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">
                      {item.courseId.courseCode} - {item.courseId.courseName}
                    </TableCell>
                    <TableCell>{item.className}</TableCell>
                    <TableCell>{item.section}</TableCell>
                    <TableCell>{currentDay || "N/A"}</TableCell>
                    <TableCell>
                      {item.dayOfWeek[0]?.startTime || "N/A"} - {item.dayOfWeek[0]?.endTime || "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => router.push("/teacher/activities")}>
              View all
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-4">{error}</div>
            ) : activities.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">No recent activities found</div>
            ) : (
              <div className="space-y-8">
                {activities.slice(0, 3).map((activity) => (
                  <div key={activity.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                    <div className="ml-auto font-medium text-sm text-muted-foreground">{activity.timestamp}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
