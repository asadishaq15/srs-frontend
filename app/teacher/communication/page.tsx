"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Chatbot from "./chatbot/chatbot"
import { getLocalStorageValue, getTokenFromCookie } from "@/lib/utils"

interface Course {
  _id: string
  courseId: {
    _id: string
    courseCode: string
    courseName: string
  }
  className: string
  section: string
}

interface ApiResponse {
  data: Course[]
  total: number
}

export default function CommunicationPage() {
  const [selectedClass, setSelectedClass] = useState(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const teacherId = getLocalStorageValue("id")

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SRS_SERVER}/schedule?teacherId=${teacherId}&courseId=true`,{
            method: 'GET', // or 'POST', depending on your use case
            headers: {
              'Content-Type': 'application/json',  // Ensure this header is set if sending JSON
              'Authorization': `Bearer ${getTokenFromCookie()}`, // For authorization token
            }
          }
        )

        if (!response.ok) {
          throw new Error("Failed to fetch courses")
        }

        const data: ApiResponse = await response.json()
        setCourses(data.data)
      } catch (err) {
        console.error("Error fetching courses:", err)
        setError("Failed to load courses. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Communication Dashboard</h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-4">{error}</div>
      ) : courses.length === 0 ? (
        <div className="text-center text-muted-foreground py-4">No courses found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Card key={course._id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle>{course.courseId.courseName}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Section:</strong> {course.section}
                </p>
                <p>
                  <strong>Course Code:</strong> {course.courseId.courseCode}
                </p>
                <p>
                  <strong>Class:</strong> {course.className}
                </p>
                <Button className="mt-4 w-full" onClick={() => setSelectedClass(course)}>
                  Open Chat
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedClass && (
        <Chatbot
          isOpen={!!selectedClass}
          onClose={() => setSelectedClass(null)}
          className={selectedClass.courseId.courseName}
        />
      )}
    </div>
  )
}
