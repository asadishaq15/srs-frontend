"use client"

import { useState, useEffect } from "react"
import { FileText, Loader2, Search, Save, Filter, StickyNote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import axios from "axios"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"

// Define the Lesson Plan type based on the API response
interface CourseOutline {
  _id: string
  teacherId: string
  status: string
  document: string
  courseName: string
  createdAt: string
  updatedAt: string
  __v: number
  isStatusChanged?: boolean
  originalStatus?: string
  teacher?: {
    firstName: string
    lastName: string
  }
  notes?: string
}

// Lesson Plan status enum
enum CourseOutlineStatus {
  Pending = "Pending",
  Rejected = "Rejected",
  Approved = "Approved",
}

export default function CourseOutlineAdmin() {
  const [courseOutlines, setCourseOutlines] = useState<CourseOutline[]>([])
  const [isLoadingOutlines, setIsLoadingOutlines] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [courses, setCourses] = useState<any[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = useState(true)
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("all")
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [openNoteId, setOpenNoteId] = useState<string | null>(null)

  // Fetch Lesson Plans and courses on component mount
  useEffect(() => {
    fetchCourseOutlines()
    fetchCourses()
  }, [])

  // Function to fetch courses from the API
  const fetchCourses = async () => {
    setIsLoadingCourses(true)
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SRS_SERVER}/course?active=true`)
      setCourses(response.data)
    } catch (error) {
      console.error("Error fetching courses:", error)
      toast.error("Failed to load courses")
    } finally {
      setIsLoadingCourses(false)
    }
  }

  // Function to fetch teacher data
  const fetchTeacherData = async (teacherId: string) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SRS_SERVER}/teachers/${teacherId}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching teacher with ID ${teacherId}:`, error)
      return null
    }
  }

  // Function to fetch Lesson Plans from the API
  const fetchCourseOutlines = async () => {
    setIsLoadingOutlines(true)
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SRS_SERVER}/course-outline/admin`)
      console.log(response)

      // Add tracking properties for status changes
      const outlines = response.data.map((outline: CourseOutline, index: number) => ({
        ...outline,
        originalStatus: outline.status,
        isStatusChanged: false,
        // Add sample notes for testing if they don't exist
        notes:
          outline.notes ||
          (index % 3 === 0
            ? "This is a sample note for testing the modal functionality. It should appear when clicking the View Notes button.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, eget aliquam nisl nunc eget nisl. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, eget aliquam nisl nunc eget nisl.\n\nNullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, eget aliquam nisl nunc eget nisl. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, eget aliquam nisl nunc eget nisl."
            : ""),
      }))

      // Fetch teacher data for each outline
      const outlinesWithTeachers = await Promise.all(
        outlines.map(async (outline: CourseOutline) => {
          if (outline.teacherId) {
            const teacherData = await fetchTeacherData(outline.teacherId)
            return {
              ...outline,
              teacher: teacherData,
            }
          }
          return outline
        }),
      )

      setCourseOutlines(outlinesWithTeachers)
    } catch (error) {
      console.error("Error fetching Lesson Plans:", error)
      toast.error("Failed to load Lesson Plans")
    } finally {
      setIsLoadingOutlines(false)
    }
  }

  // Handle status change for a Lesson Plan
  const handleStatusChange = (outlineId: string, newStatus: string) => {
    setCourseOutlines((prevOutlines) =>
      prevOutlines.map((outline) => {
        if (outline._id === outlineId) {
          const isChanged = outline.originalStatus !== newStatus
          return {
            ...outline,
            status: newStatus,
            isStatusChanged: isChanged,
          }
        }
        return outline
      }),
    )

    // Check if any outlines have changes
    const anyChanges = courseOutlines.some((outline) =>
      outline._id === outlineId ? outline.originalStatus !== newStatus : outline.isStatusChanged,
    )

    setHasChanges(anyChanges)
  }

  // Save all changes
  const saveChanges = async () => {
    setIsSaving(true)

    try {
      // Get all outlines with changes
      const changedOutlines = courseOutlines.filter((outline) => outline.isStatusChanged)

      // Create an array of promises for each update
      const updatePromises = changedOutlines.map((outline) =>
        axios.patch(`${process.env.NEXT_PUBLIC_SRS_SERVER}/course-outline/${outline._id}/status`, {
          status: outline.status,
        }),
      )

      await Promise.all(updatePromises)

      setCourseOutlines((prevOutlines) =>
        prevOutlines.map((outline) => ({
          ...outline,
          originalStatus: outline.status,
          isStatusChanged: false,
        })),
      )

      setHasChanges(false)
      toast.success(`Successfully updated ${changedOutlines.length} Lesson Plan(s)`)
    } catch (error) {
      console.error("Error saving changes:", error)
      toast.error("Failed to save changes")
    } finally {
      setIsSaving(false)
    }
  }

  // Filter outlines based on search query and selected course
  const filteredOutlines = courseOutlines.filter((outline) => {
    const matchesSearch = outline.courseName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCourse = selectedCourseFilter === "all" || outline.courseName === selectedCourseFilter
    return matchesSearch && matchesCourse
  })

  // Get unique course names from outlines
  const uniqueCourseNames = Array.from(new Set(courseOutlines.map((outline) => outline.courseName)))

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  // Get status badge with appropriate styling
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <Badge className="bg-green-600 hover:bg-green-700">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-600 hover:bg-red-700">Rejected</Badge>
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Find the outline with the open note
  const activeOutline = courseOutlines.find((outline) => outline._id === openNoteId)

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Notes Modal */}
      <Dialog open={!!openNoteId} onOpenChange={(open) => !open && setOpenNoteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-purple-600" />
              <span>Course Notes</span>
            </DialogTitle>
            <DialogDescription>
              {activeOutline?.courseName} - {activeOutline?.teacher?.firstName} {activeOutline?.teacher?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto p-4 bg-gray-50 rounded-md border border-gray-100 text-gray-800">
            {activeOutline?.notes?.split("\n").map((line, i) => (
              <p key={i} className={i > 0 ? "mt-3" : ""}>
                {line}
              </p>
            ))}
          </div>
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Lesson Plan Administration</h1>
          <p className="text-gray-600">Review and manage Lesson Plans submitted by teachers</p>
        </div>

        {hasChanges && (
          <Button onClick={saveChanges} className="bg-black hover:bg-gray-800 text-white" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        )}
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold">All Lesson Plans</CardTitle>
              <CardDescription>Review and update status of submitted Lesson Plans</CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search outlines..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="w-full sm:w-64">
                <Select value={selectedCourseFilter} onValueChange={setSelectedCourseFilter}>
                  <SelectTrigger className="w-full">
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter by course" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {uniqueCourseNames.map((courseName) => (
                      <SelectItem key={courseName} value={courseName}>
                        {courseName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs defaultValue="all" className="w-full">
            <div className="border-b border-gray-100">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                <TabsTrigger
                  value="all"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-black data-[state=active]:bg-transparent"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="approved"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-black data-[state=active]:bg-transparent"
                >
                  Approved
                </TabsTrigger>
                <TabsTrigger
                  value="pending"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-black data-[state=active]:bg-transparent"
                >
                  Pending
                </TabsTrigger>
                <TabsTrigger
                  value="rejected"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-black data-[state=active]:bg-transparent"
                >
                  Rejected
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="p-0">
              <div className="divide-y divide-gray-100">
                {isLoadingOutlines ? (
                  <div className="py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-500" />
                    <p className="text-gray-500">Loading Lesson Plans...</p>
                  </div>
                ) : filteredOutlines.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Course</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Teacher Name</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Uploaded</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Updated</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Notes</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOutlines.map((outline) => (
                          <tr
                            key={outline._id}
                            className={`hover:bg-gray-50 transition-colors ${
                              outline.isStatusChanged ? "bg-yellow-50" : ""
                            }`}
                          >
                            <td className="px-4 py-4 text-sm">
                              <div className="font-medium text-gray-900">{outline.courseName}</div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              {outline.teacher?.firstName} {outline.teacher?.lastName}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">{formatDate(outline.createdAt)}</td>
                            <td className="px-4 py-4 text-sm text-gray-500">{formatDate(outline.updatedAt)}</td>
                            <td className="px-4 py-4 text-sm">
                              <Select
                                value={outline.status}
                                onValueChange={(value) => handleStatusChange(outline._id, value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value={CourseOutlineStatus.Pending}>Pending</SelectItem>
                                  <SelectItem value={CourseOutlineStatus.Approved}>Approved</SelectItem>
                                  <SelectItem value={CourseOutlineStatus.Rejected}>Rejected</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-4 py-4 text-sm">
                              {outline.notes ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:text-purple-800 hover:border-purple-300"
                                  onClick={() => setOpenNoteId(outline._id)}
                                >
                                  <StickyNote className="h-4 w-4 mr-1.5" />
                                  View Notes
                                </Button>
                              ) : (
                                <span className="text-gray-400 text-xs">No notes</span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(outline.document, "_blank")}
                                >
                                  <FileText className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                {outline.isStatusChanged && (
                                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                    Modified
                                  </Badge>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-gray-500">No Lesson Plans found</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="approved" className="p-0">
              <div className="divide-y divide-gray-100">
                {isLoadingOutlines ? (
                  <div className="py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-500" />
                    <p className="text-gray-500">Loading Lesson Plans...</p>
                  </div>
                ) : filteredOutlines.filter((o) => o.status.toLowerCase() === "approved").length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Course</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Teacher Name</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Uploaded</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Updated</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Notes</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOutlines
                          .filter((o) => o.status.toLowerCase() === "approved")
                          .map((outline) => (
                            <tr
                              key={outline._id}
                              className={`hover:bg-gray-50 transition-colors ${
                                outline.isStatusChanged ? "bg-yellow-50" : ""
                              }`}
                            >
                              <td className="px-4 py-4 text-sm">
                                <div className="font-medium text-gray-900">{outline.courseName}</div>
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-500">
                                {outline.teacher
                                  ? `${outline.teacher.firstName} ${outline.teacher.lastName}`
                                  : outline.teacherId}
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-500">{formatDate(outline.createdAt)}</td>
                              <td className="px-4 py-4 text-sm text-gray-500">{formatDate(outline.updatedAt)}</td>
                              <td className="px-4 py-4 text-sm">
                                <Select
                                  value={outline.status}
                                  onValueChange={(value) => handleStatusChange(outline._id, value)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={CourseOutlineStatus.Pending}>Pending</SelectItem>
                                    <SelectItem value={CourseOutlineStatus.Approved}>Approved</SelectItem>
                                    <SelectItem value={CourseOutlineStatus.Rejected}>Rejected</SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-4 py-4 text-sm">
                                {outline.notes ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:text-purple-800 hover:border-purple-300"
                                    onClick={() => setOpenNoteId(outline._id)}
                                  >
                                    <StickyNote className="h-4 w-4 mr-1.5" />
                                    View Notes
                                  </Button>
                                ) : (
                                  <span className="text-gray-400 text-xs">No notes</span>
                                )}
                              </td>
                              <td className="px-4 py-4 text-sm">
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(outline.document, "_blank")}
                                  >
                                    <FileText className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                  {outline.isStatusChanged && (
                                    <Badge
                                      variant="outline"
                                      className="bg-yellow-100 text-yellow-800 border-yellow-200"
                                    >
                                      Modified
                                    </Badge>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-gray-500">No approved Lesson Plans found</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="pending" className="p-0">
              <div className="divide-y divide-gray-100">
                {isLoadingOutlines ? (
                  <div className="py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-500" />
                    <p className="text-gray-500">Loading Lesson Plans...</p>
                  </div>
                ) : filteredOutlines.filter((o) => o.status.toLowerCase() === "pending").length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Course</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Teacher Name</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Uploaded</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Updated</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Notes</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOutlines
                          .filter((o) => o.status.toLowerCase() === "pending")
                          .map((outline) => (
                            <tr
                              key={outline._id}
                              className={`hover:bg-gray-50 transition-colors ${
                                outline.isStatusChanged ? "bg-yellow-50" : ""
                              }`}
                            >
                              <td className="px-4 py-4 text-sm">
                                <div className="font-medium text-gray-900">{outline.courseName}</div>
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-500">
                                {outline.teacher
                                  ? `${outline.teacher.firstName} ${outline.teacher.lastName}`
                                  : outline.teacherId}
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-500">{formatDate(outline.createdAt)}</td>
                              <td className="px-4 py-4 text-sm text-gray-500">{formatDate(outline.updatedAt)}</td>
                              <td className="px-4 py-4 text-sm">
                                <Select
                                  value={outline.status}
                                  onValueChange={(value) => handleStatusChange(outline._id, value)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={CourseOutlineStatus.Pending}>Pending</SelectItem>
                                    <SelectItem value={CourseOutlineStatus.Approved}>Approved</SelectItem>
                                    <SelectItem value={CourseOutlineStatus.Rejected}>Rejected</SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-4 py-4 text-sm">
                                {outline.notes ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:text-purple-800 hover:border-purple-300"
                                    onClick={() => setOpenNoteId(outline._id)}
                                  >
                                    <StickyNote className="h-4 w-4 mr-1.5" />
                                    View Notes
                                  </Button>
                                ) : (
                                  <span className="text-gray-400 text-xs">No notes</span>
                                )}
                              </td>
                              <td className="px-4 py-4 text-sm">
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(outline.document, "_blank")}
                                  >
                                    <FileText className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                  {outline.isStatusChanged && (
                                    <Badge
                                      variant="outline"
                                      className="bg-yellow-100 text-yellow-800 border-yellow-200"
                                    >
                                      Modified
                                    </Badge>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-gray-500">No pending Lesson Plans found</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="rejected" className="p-0">
              <div className="divide-y divide-gray-100">
                {isLoadingOutlines ? (
                  <div className="py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-500" />
                    <p className="text-gray-500">Loading Lesson Plans...</p>
                  </div>
                ) : filteredOutlines.filter((o) => o.status.toLowerCase() === "rejected").length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Course</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Teacher Name</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Uploaded</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Updated</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Notes</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOutlines
                          .filter((o) => o.status.toLowerCase() === "rejected")
                          .map((outline) => (
                            <tr
                              key={outline._id}
                              className={`hover:bg-gray-50 transition-colors ${
                                outline.isStatusChanged ? "bg-yellow-50" : ""
                              }`}
                            >
                              <td className="px-4 py-4 text-sm">
                                <div className="font-medium text-gray-900">{outline.courseName}</div>
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-500">
                                {outline.teacher
                                  ? `${outline.teacher.firstName} ${outline.teacher.lastName}`
                                  : outline.teacherId}
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-500">{formatDate(outline.createdAt)}</td>
                              <td className="px-4 py-4 text-sm text-gray-500">{formatDate(outline.updatedAt)}</td>
                              <td className="px-4 py-4 text-sm">
                                <Select
                                  value={outline.status}
                                  onValueChange={(value) => handleStatusChange(outline._id, value)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={CourseOutlineStatus.Pending}>Pending</SelectItem>
                                    <SelectItem value={CourseOutlineStatus.Approved}>Approved</SelectItem>
                                    <SelectItem value={CourseOutlineStatus.Rejected}>Rejected</SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                              <td className="px-4 py-4 text-sm">
                                {outline.notes ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:text-purple-800 hover:border-purple-300"
                                    onClick={() => setOpenNoteId(outline._id)}
                                  >
                                    <StickyNote className="h-4 w-4 mr-1.5" />
                                    View Notes
                                  </Button>
                                ) : (
                                  <span className="text-gray-400 text-xs">No notes</span>
                                )}
                              </td>
                              <td className="px-4 py-4 text-sm">
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(outline.document, "_blank")}
                                  >
                                    <FileText className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                  {outline.isStatusChanged && (
                                    <Badge
                                      variant="outline"
                                      className="bg-yellow-100 text-yellow-800 border-yellow-200"
                                    >
                                      Modified
                                    </Badge>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-gray-500">No rejected Lesson Plans found</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
