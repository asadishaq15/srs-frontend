"use client"

import { useEffect, useState } from "react"
import { Bell, Calendar, Filter, Loader2, MoreVertical, Search, Trash, User } from "lucide-react"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "react-toastify"

interface Activity {
  _id: string
  title: string
  subtitle: string
  performBy: string
  createdAt: string
  updatedAt: string
  __v: number
}

// Define the API response type
interface ApiResponse {
  totalRecords: number
  totalPages: number
  currentPage: number
  currentLimit: number
  data: Activity[]
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const fetchActivities = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_SRS_SERVER}/activity?performBy=Admin`)

      if (!response.ok) {
        throw new Error("Failed to fetch activities")
      }

      const data: ApiResponse = await response.json()

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

  useEffect(() => {
    fetchActivities()
  }, [])

  // Helper function to calculate relative time
  const getRelativeTime = (date: Date): string => {
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`
    } else {
      return `${diffInDays} days ago`
    }
  }

  // Function to determine which icon to show
  const getActivityIcon = (index: number) => {
    // Rotate through different icons based on index for visual variety
    const iconType = index % 4

    switch (iconType) {
      case 0:
        return <User className="h-5 w-5" />
      case 1:
        return <Calendar className="h-5 w-5" />
      case 2:
        return <Bell className="h-5 w-5" />
      case 3:
        return <Calendar className="h-5 w-5" />
      default:
        return <User className="h-5 w-5" />
    }
  }

  // Function to delete an activity
  const deleteActivity = async (id: string) => {
    try {
      setIsDeleting(id)
      await axios.delete(`${process.env.NEXT_PUBLIC_SRS_SERVER}/activity/${id}`)

      setActivities(activities.filter((activity) => activity.id !== id))

      toast.success("The activity has been successfully deleted.")
    } catch (err) {
      console.error("Error deleting activity:", err)

      toast("Failed to delete the activity. Please try again.")
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Recent Activities </h1>
            <p className="text-gray-500">Track and monitor all Admin activities.</p>
          </div>
          <Button variant="outline" className="h-10">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Button>
        </div>

        {/* Filters */}
        {/* <Card className="border-gray-200">
          <CardContent className="flex items-center gap-6 p-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input placeholder="Search activities..." className="pl-8" />
            </div>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Activity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                <SelectItem value="enrollment">Enrollment</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="attendance">Attendance</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="h-10">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </CardContent>
        </Card> */}

        {/* Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="flex justify-center py-8 text-red-500">
                <p>{error}</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="flex justify-center py-8">
                <p>No activities found.</p>
              </div>
            ) : (
              activities.map((activity, index) => (
                <div key={activity.id}>
                  <div className="flex items-start space-x-4">
                    <div className="rounded-full bg-gray-100 p-2">{getActivityIcon(index)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{activity.title}</h4>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="rounded-full p-1 hover:bg-gray-100">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-40 p-0">
                            <Button
                              variant="ghost"
                              className="flex w-full items-center justify-start text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 text-sm"
                              onClick={() => deleteActivity(activity.id)}
                              disabled={isDeleting === activity.id}
                            >
                              {isDeleting === activity.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Trash className="mr-2 h-4 w-4" />
                              )}
                              {isDeleting === activity.id ? "Deleting..." : "Delete"}
                            </Button>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-gray-500">{activity.timestamp}</span>
                        <span className="text-xs text-gray-500">By {activity.user}</span>
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-50 text-green-700">
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  {index < activities.length - 1 && <Separator className="my-6" />}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

