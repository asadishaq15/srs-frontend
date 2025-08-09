"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { CheckIcon, Loader2, Pencil, Plus, Trash2 } from "lucide-react"
import axios from "axios"
import { toast } from "react-toastify"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { activities } from "@/lib/activities"
import { addActivity } from "@/lib/actitivityFunctions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Department {
  _id: string
  departmentName: string
}

interface Course {
  _id: string
  courseName: string
  courseCode: string
  departmentId?: {
    departmentName: any
    _id?: string
  }
  Prerequisites: string
  description: string
  createdAt: string
  courseCredit: number
  active: boolean
  special: boolean
  duration?: string // Add duration field
}

export default function CoursesPage() {
  // State for courses and departments
  const [courses, setCourses] = useState<Course[]>([])
  const [departments, setDepartments] = useState<Department[]>([])

  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDepartmentsLoading, setIsDepartmentsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)

  // Edit state
  const [isEditing, setIsEditing] = useState(false)
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null)

  // Form state
  // Update the formData state to include duration
  const [formData, setFormData] = useState({
    courseName: "",
    courseCode: "",
    departmentId: "",
    Prerequisites: "",
    description: "",
    courseCredit: "",
    active: false,
    special: false,
    duration: "", // Add duration field
  })

  // Add a new state for search query and search loading
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")

  // Add useEffect for debouncing search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500) // 500ms debounce delay

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Modify the fetchCourses function to handle search
  const fetchCourses = async (query = "") => {
    try {
      setIsLoading(true)
      const url = query
        ? `${process.env.NEXT_PUBLIC_SRS_SERVER}/course?name=${encodeURIComponent(query)}`
        : `${process.env.NEXT_PUBLIC_SRS_SERVER}/course`

      const response = await axios.get(url)
      console.log("res", response)
      setCourses(response.data)
    } catch (error) {
      console.error("Error fetching courses:", error)
      toast.error("Failed to load courses")
    } finally {
      setIsLoading(false)
      setIsSearching(false)
    }
  }

  // Add useEffect to handle search query changes
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      setIsSearching(true)
    }
    fetchCourses(debouncedSearchQuery)

    // Update URL with search query
    const url = new URL(window.location.href)
    if (debouncedSearchQuery) {
      url.searchParams.set("name", debouncedSearchQuery)
    } else {
      url.searchParams.delete("name")
    }
    window.history.pushState({}, "", url)
  }, [debouncedSearchQuery])

  // Add a function to handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      setIsDepartmentsLoading(true)
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SRS_SERVER}/department`)
      setDepartments(response.data)
    } catch (error) {
      console.error("Error fetching departments:", error)
      toast.error("Failed to load departments")
    } finally {
      setIsDepartmentsLoading(false)
    }
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const nameParam = urlParams.get("name")

    if (nameParam) {
      setSearchQuery(nameParam)
      setDebouncedSearchQuery(nameParam)
    } else {
      fetchCourses()
    }

    fetchDepartments()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, departmentId: value }))
  }

  // Update the resetForm function to include duration
  const resetForm = () => {
    setFormData({
      courseName: "",
      courseCode: "",
      departmentId: "",
      Prerequisites: "",
      description: "",
      courseCredit: "",
      active: false,
      special: false,
      duration: "", // Reset duration field
    })
    setIsEditing(false)
    setCourseToEdit(null)
  }

  // Open modal for adding a new course
  const openModal = () => {
    resetForm()
    setIsModalOpen(true)
  }

  // Update the openEditModal function to include duration
  const openEditModal = (course: Course) => {
    setCourseToEdit(course)
    setIsEditing(true)

    // Populate form with course data
    setFormData({
      courseName: course.courseName,
      courseCode: course.courseCode,
      departmentId: course.departmentId?._id || "",
      Prerequisites: course.Prerequisites,
      description: course.description,
      courseCredit: course.courseCredit.toString(),
      active: course.active,
      special: course.special,
      duration: course.duration || "", // Add duration field
    })

    setIsModalOpen(true)
  }

  // Handle modal close
  const handleModalClose = () => {
    resetForm()
    setIsModalOpen(false)
  }

  // Open delete confirmation modal
  const openDeleteModal = (course: Course) => {
    setCourseToDelete(course)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return

    try {
      setIsDeleting(true)
      await axios.delete(`${process.env.NEXT_PUBLIC_SRS_SERVER}/course/${courseToDelete._id}`)
      toast.success("Course deleted successfully!")
      const message = activities.admin.deleteCourse.description.replace("{courseName}", courseToDelete.courseName)
      const activity = {
        title: activities.admin.deleteCourse.action,
        subtitle: message,
        performBy: "Admin",
      }
      const act = await addActivity(activity)
      setIsDeleteModalOpen(false)
      setCourseToDelete(null)
      fetchCourses() // Refresh courses list
    } catch (error) {
      console.error("Error deleting course:", error)
      toast.error("Failed to delete course")
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle form submission (for both add and edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.courseName || !formData.courseCode || !formData.departmentId || !formData.description) {
      toast.error("Please fill all required fields")
      return
    }

    // if (!formData.active && !formData.special) {
    //   toast.error("Either Active or Special status must be selected")
    //   return
    // }

    try {
      setIsSubmitting(true)
      // Convert courseCredit to number for API
      const dataToSubmit = {
        ...formData,
        courseCredit: formData.courseCredit ? Number.parseInt(formData.courseCredit) : undefined,
      }
      console.log(dataToSubmit)
      if (isEditing && courseToEdit) {
        const res = await axios.patch(`${process.env.NEXT_PUBLIC_SRS_SERVER}/course/${courseToEdit._id}`, dataToSubmit)
        console.log("res", res)
        toast.success("Course updated successfully!")
        const message = activities.admin.updatedCourse.description.replace("{courseName}", formData.courseName)
        const activity = {
          title: activities.admin.updatedCourse.action,
          subtitle: message,
          performBy: "Admin",
        }
        const act = await addActivity(activity)
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_SRS_SERVER}/course/add`, dataToSubmit)
        toast.success("Course added successfully!")
        const message = activities.admin.addCourse.description.replace("{courseName}", formData.courseName)
        const activity = {
          title: activities.admin.addCourse.action,
          subtitle: message,
          performBy: "Admin",
        }
        const act = await addActivity(activity)
      }

      setIsModalOpen(false)
      resetForm()
      fetchCourses()
    } catch (error: any) {
      if (error.status === 409) {
        toast.error(error.response.data.message)
        return
      }
      console.error(`Error ${isEditing ? "updating" : "adding"} course:`, error)
      toast.error(`Failed to ${isEditing ? "update" : "add"} course`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Find department name by ID
  const getDepartmentName = (departmentId: string) => {
    const department = departments.find((dept) => dept._id === departmentId)
    return department ? department.departmentName : "Unknown Department"
  }

  const handleSwitchChange = (field: "active" | "special") => {
    setFormData((prev) => {
      if (field === "active") {
        return { ...prev, active: !prev.active }
      } else {
        return { ...prev, special: !prev.special }
      }
    })
  }

  const handleCreditChange = (value: string) => {
    setFormData((prev) => ({ ...prev, courseCredit: value }))
  }

  // Add a handler for duration select change
  const handleDurationChange = (value: string) => {
    setFormData((prev) => ({ ...prev, duration: value }))
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-800 to-black bg-clip-text text-transparent">
            Courses
          </h1>
          <p className="text-muted-foreground mt-1">Manage your school's course catalog</p>
        </div>
        <Button onClick={openModal} className="bg-black text-white hover:bg-black/90">
          <Plus className="mr-2 h-4 w-4" /> Add Course
        </Button>
      </div>
      <div className="mb-6 mt-4">
        <div className="relative flex">
          <Input
            type="text"
            placeholder="Search courses by name..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 border-gray-300 focus:border-black focus:ring-black"
          />
          {isSearching ? (
            <Loader2 className="h-4 w-4 absolute left-3 top-3 animate-spin text-gray-500" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 absolute left-3 top-3 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Courses List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading courses...</span>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium text-gray-700">No courses found</h3>
          <p className="text-gray-500 mt-1">Get started by adding your first course</p>
          <Button onClick={openModal} className="mt-4 bg-black text-white hover:bg-black/90">
            <Plus className="mr-2 h-4 w-4" /> Add Course
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course._id} className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{course.courseName}</CardTitle>
                    <CardDescription className="mt-1">Code: {course.courseCode}</CardDescription>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => openEditModal(course)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => openDeleteModal(course)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Department:</span>{" "}
                    {course.departmentId?.departmentName || getDepartmentName(course.departmentId?._id || "")}
                  </div>
                  {course.Prerequisites && (
                    <div className="text-sm">
                      <span className="font-medium">Prerequisites:</span> {course.Prerequisites}
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="font-medium">Credits:</span> {course.courseCredit || "N/A"}
                  </div>
                  {course.duration && (
                    <div className="text-sm">
                      <span className="font-medium">Duration:</span> {course.duration}
                    </div>
                  )}
                  <div className="flex space-x-2 mt-1">
                    {course.active && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                    {course.special && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Special
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 line-clamp-2 mt-1">{course.description}</div>
                  <div className="text-xs text-gray-500 mt-2">
                    Added on {new Date(course.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Course Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Course" : "Add New Course"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the details for this course."
                : "Enter the details for the new course you want to add to the curriculum."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="courseName" className="font-medium">
                    Course Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="courseName"
                    placeholder="Introduction to Computer Science"
                    value={formData.courseName}
                    onChange={handleChange}
                    className="border-gray-300 focus:border-black focus:ring-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="courseCode" className="font-medium">
                    Course Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="courseCode"
                    placeholder="CS101"
                    value={formData.courseCode}
                    onChange={handleChange}
                    className="border-gray-300 focus:border-black focus:ring-black"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="font-medium">
                  Department <span className="text-red-500">*</span>
                </Label>
                {isDepartmentsLoading ? (
                  <div className="flex items-center space-x-2 h-10 px-3 border rounded-md border-gray-300">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    <span className="text-sm text-gray-500">Loading departments...</span>
                  </div>
                ) : (
                  <Select onValueChange={handleSelectChange} value={formData.departmentId}>
                    <SelectTrigger id="department" className="border-gray-300 focus:border-black focus:ring-black">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept._id} value={dept._id}>
                          {dept.departmentName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="Prerequisites" className="font-medium">
                  Prerequisites
                </Label>
                <Input
                  id="Prerequisites"
                  placeholder="e.g., MATH101, CS100 (or 'None')"
                  value={formData.Prerequisites}
                  onChange={handleChange}
                  className="border-gray-300 focus:border-black focus:ring-black"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseCredit" className="font-medium">
                  Course Credit
                </Label>
                <Input
                  id="courseCredit"
                  type="number"
                  placeholder="3"
                  value={formData.courseCredit}
                  onChange={(e) => {
                    const value = e.target.value
                    if (/^\d*$/.test(value)) {
                      handleCreditChange(value)
                    }
                  }}
                  className="border-gray-300 focus:border-black focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="active" className="font-medium">
                      Active Course
                    </Label>
                    <div
                      className="relative inline-flex h-6 w-11 items-center cursor-pointer rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 
        bg-input data-[state=checked]:bg-black"
                      data-state={formData.active ? "checked" : "unchecked"}
                      role="switch"
                      aria-checked={formData.active}
                      onClick={() => handleSwitchChange("active")}
                    >
                      <span
                        className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${formData.active ? "translate-x-5" : "translate-x-0"}`}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Enable if this course is currently active</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="special" className="font-medium">
                      Special Course
                    </Label>
                    <div
                      className="relative inline-flex h-6 w-11 items-center cursor-pointer rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 
        bg-input data-[state=checked]:bg-black"
                      data-state={formData.special ? "checked" : "unchecked"}
                      role="switch"
                      aria-checked={formData.special}
                      onClick={() => handleSwitchChange("special")}
                    >
                      <span
                        className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${formData.special ? "translate-x-5" : "translate-x-0"}`}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Enable if this is a special course</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="font-medium">
                  Duration
                </Label>
                <Select onValueChange={handleDurationChange} value={formData.duration}>
                  <SelectTrigger id="duration" className="border-gray-300 focus:border-black focus:ring-black">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full Year">Full Year</SelectItem>
                    <SelectItem value="Semester">Semester</SelectItem>
                    <SelectItem value="Quarter">Quarter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-medium">
                  Course Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide a detailed description of the course content, objectives, and learning outcomes."
                  className="min-h-[100px] border-gray-300 focus:border-black focus:ring-black"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleModalClose}
                disabled={isSubmitting}
                className="border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-black text-white hover:bg-black/90" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? "Updating Course..." : "Adding Course..."}
                  </>
                ) : (
                  <>
                    <CheckIcon className="mr-2 h-4 w-4" /> {isEditing ? "Update Course" : "Add Course"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete the course{" "}
              <span className="font-semibold">{courseToDelete?.courseName}</span>? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={handleDeleteCourse}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Confirm Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

