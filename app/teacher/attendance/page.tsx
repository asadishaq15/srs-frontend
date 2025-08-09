"use client"

import * as React from "react"
import { Calendar, Users, UserCheck, UserX, Clock, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "react-toastify"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import axios from "axios"
import { getLocalStorageValue } from "@/lib/utils"

interface Course {
  _id: string
  courseName: string
  courseCode: string
}

interface Teacher {
  _id: string
  firstName: string
  lastName: string
}

interface AttendanceStudent {
  _id: string
  studentId: string
  studentName: string
  attendance: string
  note: string
}

interface AttendanceReport {
  status: string
  percentage: number
  count: number
  students: string[]
}

interface AttendanceData {
  _id: string
  students: AttendanceStudent[]
  attendanceReport: AttendanceReport[]
}

const sections = ["None", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")]

export default function AttendancePage() {
  const [courses, setCourses] = React.useState<Course[]>([])
  const [teachers, setTeachers] = React.useState<Teacher[]>([])
  const [loading, setLoading] = React.useState(true)
  const [loadingAttendance, setLoadingAttendance] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [attendanceData, setAttendanceData] = React.useState<AttendanceData | null>(null)
  const [noDataMessage, setNoDataMessage] = React.useState<string | null>(null)
  const [studentsForNewAttendance, setStudentsForNewAttendance] = React.useState<any[]>([])
  const [creatingAttendance, setCreatingAttendance] = React.useState(false)
  const [loadingStudents, setLoadingStudents] = React.useState(false)
  const [savingAttendance, setSavingAttendance] = React.useState(false)

  // Form states
  const selectedTeacher = getLocalStorageValue("id")
  const [selectedCourse, setSelectedCourse] = React.useState("")
  // const [selectedTeacher, setSelectedTeacher] = React.useState("")
  const [selectedSection, setSelectedSection] = React.useState("")
  const [roomNumber, setRoomNumber] = React.useState("")
  const [selectedDate, setSelectedDate] = React.useState("")

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesResponse, teachersResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_SRS_SERVER}/course`),
          fetch(`${process.env.NEXT_PUBLIC_SRS_SERVER}/teachers`),
        ])

        if (!coursesResponse.ok || !teachersResponse.ok) {
          throw new Error("Failed to fetch data")
        }

        const coursesData = await coursesResponse.json()
        const teachersData = await teachersResponse.json()

        setCourses(coursesData)
        setTeachers(teachersData.data)
      } catch (err) { 
        console.log(err)
        // setError("Failed to load data")
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleLoadAttendance = async () => {
    if (!selectedCourse || !selectedTeacher || !selectedSection || !roomNumber || !selectedDate) {
      toast.error("Please fill in all fields")
      return
    }

    setLoadingAttendance(true)
    setError(null)
    setNoDataMessage(null)
    setAttendanceData(null)

    try {
      const rawDate = selectedDate
                      ? new Date(selectedDate)
                      : new Date();
                    
                    const gbFormatted = rawDate.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }).replace(/\//g, "-");
                    
                    const [day, month, year] = gbFormatted.split("-");
                    const formattedDate = `${year}-${month}-${day}`;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SRS_SERVER}/attendance/getTeacherViewAttendance?` +
          new URLSearchParams({
            room: roomNumber,
            section: selectedSection,
            date: formattedDate,
            courseId: selectedCourse,
            teacherId: selectedTeacher,
          }),
      )

      if (!response.ok) {
        if (response.status === 404) {
          setNoDataMessage("No attendance data available for this class on the selected date.")
          return
        }
        throw new Error("Failed to fetch attendance data")
      }

      const data = await response.json()

      if (!data || !data.students || data.students.length === 0) {
        setNoDataMessage("No attendance data available for this class on the selected date.")
        return
      }

      setAttendanceData(data)
    } catch (err) { 
      toast.error('No Data Found for this Room') 
      console.error("Error fetching attendance data:", err)
      return
    } finally {
      setLoadingAttendance(false)
    }
  }

  const handleCreateAttendance = async () => {
    if (!selectedCourse || !selectedTeacher || !selectedSection || !roomNumber) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoadingStudents(true)
    setCreatingAttendance(true)
    setAttendanceData(null)
    setNoDataMessage(null)
    setError(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SRS_SERVER}/student?className=${roomNumber}`)

      if (!response.ok) {
        throw new Error("Failed to fetch students data")
      }

      const data = await response.json()

      if (!data || !data.data || data.data.length === 0) {
        setNoDataMessage("No students found for this class.")
        setCreatingAttendance(false)
        return
      }

      const formattedStudents = data.data.map((student: any) => ({
        _id: student._id,
        studentId: student.studentId,
        studentName: `${student.firstName} ${student.lastName}`,
        attendance: "Present", 
        note: "",
      }))

      setStudentsForNewAttendance(formattedStudents)

      // Create mock attendance report data
      const mockAttendanceReport = [
        {
          status: "Present",
          percentage: 100,
          count: formattedStudents.length,
          students: formattedStudents.map((s) => s.studentName),
        },
        { status: "Absent", percentage: 0, count: 0, students: [] },
        { status: "Late", percentage: 0, count: 0, students: [] },
        { status: "Excused", percentage: 0, count: 0, students: [] },
      ]

      // Create mock attendance data
      const mockAttendanceData = {
        _id: "new-attendance",
        students: formattedStudents,
        attendanceReport: mockAttendanceReport,
      }

      setAttendanceData(mockAttendanceData)
    } catch (err:any) {
      setError("Failed to load students data")
      console.error("Error fetching students data:", err)
      setCreatingAttendance(false)
    } finally {
      setLoadingStudents(false)
    }
  }

  const updateAttendanceStatus = (studentId: string, newStatus: string) => {
    if (!attendanceData) return

    // Update the student's attendance status
    const updatedStudents = attendanceData.students.map((student) => {
      if (student._id === studentId) {
        return { ...student, attendance: newStatus }
      }
      return student
    })

    // Group students by attendance status
    const studentsByStatus: Record<string, string[]> = {
      Present: [],
      Absent: [],
      Late: [],
      Excused: [],
    }

    updatedStudents.forEach((student) => {
      studentsByStatus[student.attendance].push(student.studentName)
    })

    // Count students by status
    const statusCounts = {
      Present: 0,
      Absent: 0,
      Late: 0,
      Excused: 0,
    }

    updatedStudents.forEach((student) => {
      statusCounts[student.attendance as keyof typeof statusCounts]++
    })

    // Calculate percentages
    const totalStudents = updatedStudents.length
    const updatedReport = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      percentage: Math.round((count / totalStudents) * 100),
      count,
      students: studentsByStatus[status],
    }))

    // Update attendance data
    setAttendanceData({
      ...attendanceData,
      students: updatedStudents,
      attendanceReport: updatedReport,
    })
  }

  const updateStudentNote = (studentId: string, note: string) => {
    if (!attendanceData) return

    const updatedStudents = attendanceData.students.map((student) => {
      if (student._id === studentId) {
        return { ...student, note }
      }
      return student
    })

    setAttendanceData({
      ...attendanceData,
      students: updatedStudents,
    })
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>
  }

  const addActivity = async (activity: any) => { 
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SRS_SERVER}/activity/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(activity),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      } 
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Could not add activity:", error)
      throw error
    }
  }

  return (
    <div className="p-6 space-y-6 w-full">
      <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>

      {/* Class and Date Selection */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="course-select">Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger id="course-select">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.courseName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="section-select">Section</Label>
              <Select value={selectedSection} onValueChange={setSelectedSection}>
                <SelectTrigger id="section-select">
                  <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section} value={section}>
                      {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="room-number">Grade Level</Label>
              <Input
                type="text"
                id="room-number"
                placeholder="Enter Grade Level"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-select">Date</Label>
              <Input
                type="date"
                id="date-select"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div className="flex items-end space-x-4">
              <Button className="w-full" onClick={handleLoadAttendance} disabled={loadingAttendance || loadingStudents}>
                {loadingAttendance ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Calendar className="mr-2 h-4 w-4" />
                )}
                Load Attendance
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={handleCreateAttendance}
                disabled={loadingAttendance || loadingStudents}
              >
                {loadingStudents ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Users className="mr-2 h-4 w-4" />
                )}
                Create Attendance
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {noDataMessage ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">{noDataMessage}</p>
          <p className="text-sm text-gray-500 mt-2">Please try a different date or class.</p>
        </div>
      ) : !attendanceData ? (
        <div className="text-center text-gray-500 mt-8">Attendance will be Shown Here</div>
      ) : (
        <>
          {/* Attendance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {attendanceData.attendanceReport.map((report) => (
              <TooltipProvider key={report.status}>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <Card className="hover:shadow-md transition-shadow cursor-help">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{report.status}</CardTitle>
                        {report.status === "Present" && <UserCheck className="h-4 w-4 text-muted-foreground" />}
                        {report.status === "Absent" && <UserX className="h-4 w-4 text-muted-foreground" />}
                        {report.status === "Late" && <Clock className="h-4 w-4 text-muted-foreground" />}
                        {report.status === "Excused" && <Users className="h-4 w-4 text-muted-foreground" />}
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{report.percentage}%</div>
                        <p className="text-xs text-muted-foreground">{report.count} students</p>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs w-64 p-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">
                        {report.status} Students ({report.count})
                      </h4>
                      {report.students && report.students.length > 0 ? (
                        <div className="max-h-48 overflow-y-auto pr-2">
                          <ul className="space-y-1">
                            {report.students.map((student, index) => (
                              <li key={index} className="text-sm py-1 border-b border-gray-100 last:border-0">
                                {student}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No students in this category</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>

          {/* Attendance Marking Table */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Record</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceData.students.map((student) => (
                    <TableRow key={student._id}>
                      <TableCell className="font-medium">{student.studentName}</TableCell>
                      <TableCell>{student.studentId}</TableCell>
                      <TableCell>
                        {creatingAttendance ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-24 p-0">
                                <Badge
                                  variant={
                                    student.attendance === "Present"
                                      ? "default"
                                      : student.attendance === "Absent"
                                        ? "destructive"
                                        : student.attendance === "Late"
                                          ? "warning"
                                          : "secondary"
                                  }
                                >
                                  {student.attendance}
                                </Badge>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => updateAttendanceStatus(student._id, "Present")}>
                                Present
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateAttendanceStatus(student._id, "Absent")}>
                                Absent
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateAttendanceStatus(student._id, "Late")}>
                                Late
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateAttendanceStatus(student._id, "Excused")}>
                                Excused
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <Badge
                            variant={
                              student.attendance === "Present"
                                ? "default"
                                : student.attendance === "Absent"
                                  ? "destructive"
                                  : student.attendance === "Late"
                                    ? "warning"
                                    : "secondary"
                            }
                          >
                            {student.attendance}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {creatingAttendance ? (
                          <Input
                            type="text"
                            value={student.note}
                            onChange={(e) => updateStudentNote(student._id, e.target.value)}
                            placeholder="Add note"
                            className="h-8"
                          />
                        ) : (
                          student.note
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            {creatingAttendance && (
              <div className="flex justify-end mt-4">
                <Button
                  onClick={async () => {
                    if (!attendanceData || !selectedTeacher || !selectedCourse || !roomNumber || !selectedSection) {
                      toast.error("Missing required information")
                      return
                    }

                    setSavingAttendance(true)

                    try {
                      const rawDate = selectedDate
                      ? new Date(selectedDate)
                      : new Date();
                    
                    const gbFormatted = rawDate.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }).replace(/\//g, "-");
                    
                    const [day, month, year] = gbFormatted.split("-");
                    const formattedDate = `${year}-${month}-${day}`;
                    
                    console.log(formattedDate); //
                      const payload = {
                        teacherId: selectedTeacher,
                        courseId: selectedCourse,
                        date: formattedDate,
                        class: roomNumber,
                        section: selectedSection,
                        students: attendanceData.students.map((student) => ({
                          _id: student._id,
                          studentId: student.studentId,
                          studentName: student.studentName,
                          attendance: student.attendance,
                          note: student.note,
                        })),
                      }
                     console.log('data sent ' , payload);
                      const response = await axios.post(
                        `${process.env.NEXT_PUBLIC_SRS_SERVER}/attendance/markAttendance`,
                        payload,
                      )

                      if (response.status === 200 || response.status === 201) {
                        toast.success("Attendance saved successfully!")

                        // Log activity for attendance taking
                        try {
                          const activities = {
                            teacher: {
                              takeAttendance: {
                                action: "You have taken attendance",
                                description: "Attendance recorded for {className} on {date}",
                              },
                            },
                          }

                          // Format the date for display in the activity
                          const displayDate = selectedDate
                            ? new Date(selectedDate).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })
                            : new Date().toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })

                          const message = activities.teacher.takeAttendance.description
                            .replace("{className}", roomNumber)
                            .replace("{date}", displayDate)

                          const activity = {
                            title: activities.teacher.takeAttendance.action,
                            subtitle: message,
                            performBy: "Teacher",
                          }

                          await addActivity(activity)
                        } catch (activityError) {
                          console.error("Error logging activity:", activityError)
                        }

                        setCreatingAttendance(false)
                      } else {
                        throw new Error("Failed to save attendance")
                      }
                    } catch (error:any) {
                      console.log('ccatch',error)
                      if(error.response.data.status == 409){
                        toast.info(error.response.data.message)
                        return
                      }
                      console.error("Error saving attendance:", error)
                      toast.error("Failed to save attendance. Please try again.")
                    } finally {
                      setSavingAttendance(false)
                    }
                  }}
                  disabled={savingAttendance}
                >
                  {savingAttendance ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Attendance"
                  )}
                </Button>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
