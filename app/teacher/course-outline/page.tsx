"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Upload, CheckCircle, FileText, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import axios from "axios"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css" 
import { getLocalStorageValue, getTokenFromCookie } from "@/lib/utils"
import { uploadImageToAWS, deleteFromAWS } from "@/lib/awsUpload" // Adjust the import path as needed
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  awsKey?: string
  notes?: string
}

export default function CourseOutlineUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploaded, setIsUploaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState("")
  const [courses, setCourses] = useState<any[]>([]) 
    const teacherId = getLocalStorageValue("id")
  const [isLoadingCourses, setIsLoadingCourses] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [courseOutlines, setCourseOutlines] = useState<CourseOutline[]>([])
  const [isLoadingOutlines, setIsLoadingOutlines] = useState(true)
  const [documentUrl, setDocumentUrl] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [outlineToDelete, setOutlineToDelete] = useState<{ id: string; awsKey: string } | null>(null)
  const [notes, setNotes] = useState("")

  // Static teacherId as specified
  // const teacherId = "68061478bd96ebb2ca9eed46"

  // Sample courses for the dropdown
  // const courses = [
  //   { id: "Mathematics", name: "Mathematics" },
  //   { id: "English Literature", name: "English Literature" },
  //   { id: "Computer Science", name: "Computer Science" },
  //   { id: "Biology", name: "Biology" },
  //   { id: "History", name: "History" },
  //   { id: "Physics", name: "Physics" },
  //   { id: "Science", name: "Science" },
  // ]

  // Fetch Lesson Plans on component mount
  useEffect(() => {
    fetchCourseOutlines()
    fetchCourses()
  }, [])

  // Function to fetch courses from the API
  const fetchCourses = async () => {
    setIsLoadingCourses(true)
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SRS_SERVER}/course?teacherId=${teacherId}`)
      setCourses(response.data)
    } catch (error) {
      console.error("Error fetching courses:", error)
      toast.error("Failed to load courses")
    } finally {
      setIsLoadingCourses(false)
    }
  }

  const fetchCourseOutlines = async () => {
    setIsLoadingOutlines(true)
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SRS_SERVER}/course-outline/teacher?teacherId=${teacherId}`,
      ) 
      console.log('fetchCourseoutline',response)
      setCourseOutlines(response.data)
    } catch (error) {
      console.error("Error fetching Lesson Plans:", error)
      toast.error("Failed to load Lesson Plans")
    } finally {
      setIsLoadingOutlines(false)
    }
  }

  // Filter outlines based on search query
  const filteredOutlines = courseOutlines.filter((outline) =>
    outline.courseName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      setFile(droppedFile)
      // In a real application, you would upload the file to a storage service here
      // and get back a URL to use for the document field
      setDocumentUrl("http-docurl") // Placeholder - replace with actual upload logic
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      // We'll upload to AWS when the form is submitted, not immediately on file selection
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCourse || !file) {
      toast.error("Please select a course and upload a file")
      return
    }

    setIsLoading(true)
    setUploadProgress(0)

    try {
      // Upload file to AWS S3
      const awsUploadResult = await uploadImageToAWS(file, setUploadProgress)

      const payload = {
        teacherId,
        document: awsUploadResult.awsUrl, // Use the AWS URL from the upload result
        courseName: selectedCourse,
        awsKey: awsUploadResult.key, 
        notes: notes, 
      } 
      console.log('payload',payload)

      await axios.post(`${process.env.NEXT_PUBLIC_SRS_SERVER}/course-outline`, payload)

      toast.success("Lesson Plan uploaded successfully")
      setIsUploaded(true)

      fetchCourseOutlines()
    } catch (error) {
      console.error("Error uploading Lesson Plan:", error)

      if (error.response?.data?.statusCode === 409) {
        toast.error(error.response.data.message)
      } else {
        toast.error("Failed to upload Lesson Plan")
      }
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
    }
  }

  const resetForm = () => {
    setFile(null)
    setIsUploaded(false)
    setSelectedCourse("")
    setDocumentUrl("")
    setNotes("")
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <Badge className="bg-black text-white hover:bg-gray-800">Approved</Badge>
      case "rejected":
        return (
          <Badge variant="outline" className="border-gray-400 text-gray-700">
            Rejected
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="border-gray-300 bg-gray-100 text-gray-600">
            Pending
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="border-gray-300 bg-gray-100 text-gray-600">
            {status}
          </Badge>
        )
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  const handleDeleteOutline = async (outlineId: string, awsKey: string) => {
    setOutlineToDelete({ id: outlineId, awsKey })
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!outlineToDelete) return

    try {
      // await deleteFromAWS(outlineToDelete.awsKey)
      await axios.delete(`${process.env.NEXT_PUBLIC_SRS_SERVER}/course-outline/${outlineToDelete.id}`)

      toast.success("Lesson Plan deleted successfully")
      fetchCourseOutlines()
    } catch (error) {
      console.error("Error deleting Lesson Plan:", error)
      toast.error("Failed to delete Lesson Plan")
    } finally {
      setDeleteDialogOpen(false)
      setOutlineToDelete(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* <ToastContainer position="top-right" autoClose={3000} /> */}

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Lesson Plan Management</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Upload and manage your lesson plans efficiently with our intuitive interface
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_1.5fr]">
        <Card className="border border-gray-200 shadow-sm h-fit">
          <CardHeader className="border-b border-gray-100 bg-gray-50">
            <CardTitle className="text-xl font-semibold">Upload Lesson Plan</CardTitle>
            <CardDescription>Select a Lesson and upload the corresponding Plan document</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {!isUploaded ? (
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="course" className="text-sm font-medium">
                      Select Course
                    </Label>
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                      <SelectTrigger id="course" className="w-full">
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingCourses ? (
                          <SelectItem value="loading" disabled>
                            Loading courses...
                          </SelectItem>
                        ) : (
                          courses.map((course) => (
                            <SelectItem key={course._id} value={course.courseName}>
                              {course.courseName} ({course.courseCode})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file-upload" className="text-sm font-medium">
                      Lessan Plan Document
                    </Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center ${
                        isDragging ? "border-black bg-gray-50" : "border-gray-300"
                      } transition-colors duration-200 cursor-pointer`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById("file-upload")?.click()}
                    >
                      <input
                        id="file-upload"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={handleFileChange}
                      />

                      {file ? (
                        <div className="flex items-center justify-center space-x-3">
                          <FileText className="h-6 w-6 text-gray-800" />
                          <span className="font-medium text-gray-800">{file.name}</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex justify-center">
                            <Upload className="h-10 w-10 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Drag and drop your file here or click to browse</p>
                            <p className="text-xs text-gray-500 mt-1">Supports PDF, DOC, DOCX (Max 10MB)</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="notes" className="text-sm font-medium">
                      Notes (Optional)
                    </Label>
                    <textarea
                      id="notes"
                      className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Add any additional notes about this lesson plan..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-black h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-center">{uploadProgress}% Uploaded</p>
                    </div>
                  )}
                </div>

                <div className="mt-8">
                  <Button
                    type="submit"
                    className="w-full bg-black hover:bg-gray-800 text-white"
                    disabled={!file || !selectedCourse || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : "Processing..."}
                      </>
                    ) : (
                      "Upload Lesson Plan"
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="py-8 text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="h-16 w-16 text-black" />
                </div>
                <h3 className="text-xl font-medium">Upload Successful!</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Your Lesson Plan for {selectedCourse} has been uploaded successfully and is pending review.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t border-gray-100 bg-gray-50 flex justify-between">
            {isUploaded ? (
              <Button onClick={resetForm} className="w-full bg-black hover:bg-gray-800 text-white">
                Upload Another Document
              </Button>
            ) : (
              <p className="text-xs text-gray-500 w-full text-center">
                All uploads are securely stored and accessible from your dashboard
              </p>
            )}
          </CardFooter>
        </Card>

        <div className="space-y-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold">Your Lesson Plans</CardTitle>
                  <CardDescription>View and manage your uploaded Lesson Plans</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search outlines..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
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
                      filteredOutlines.map((outline) => (
                        <div
                          key={outline._id}
                          className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start space-x-4">
                            <div className="p-2 bg-gray-100 rounded">
                              <FileText className="h-6 w-6 text-gray-700" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{outline.courseName} Outline</h4>
                              <div className="flex items-center mt-1 space-x-2">
                                <span className="text-xs text-gray-500">Uploaded: {formatDate(outline.createdAt)}</span>
                                {outline.updatedAt !== outline.createdAt && (
                                  <span className="text-xs text-gray-500">
                                    • Updated: {formatDate(outline.updatedAt)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteOutline(outline._id, outline.awsKey || "")
                              }}
                            >
                              <span className="sr-only">Delete</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                              >
                                <path d="M3 6h18"></path>
                                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path>
                                <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                              </svg>
                            </Button>
                            {getStatusBadge(outline.status)}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => window.open(outline.document, "_blank")}
                            >
                              <span className="sr-only">Download</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                              >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" x2="12" y1="15" y2="3" />
                              </svg>
                            </Button>
                          </div>
                        </div>
                      ))
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
                      filteredOutlines
                        .filter((o) => o.status.toLowerCase() === "approved")
                        .map((outline) => (
                          <div
                            key={outline._id}
                            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start space-x-4">
                              <div className="p-2 bg-gray-100 rounded">
                                <FileText className="h-6 w-6 text-gray-700" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{outline.courseName} Outline</h4>
                                <div className="flex items-center mt-1 space-x-2">
                                  <span className="text-xs text-gray-500">
                                    Uploaded: {formatDate(outline.createdAt)}
                                  </span>
                                  {outline.updatedAt !== outline.createdAt && (
                                    <span className="text-xs text-gray-500">
                                      • Updated: {formatDate(outline.updatedAt)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteOutline(outline._id, outline.awsKey || "")
                                }}
                              >
                                <span className="sr-only">Delete</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <path d="M3 6h18"></path>
                                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path>
                                  <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                                  <line x1="10" y1="11" x2="10" y2="17"></line>
                                  <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                              </Button>
                              {getStatusBadge(outline.status)}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => window.open(outline.document, "_blank")}
                              >
                                <span className="sr-only">Download</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="7 10 12 15 17 10" />
                                  <line x1="12" x2="12" y1="15" y2="3" />
                                </svg>
                              </Button>
                            </div>
                          </div>
                        ))
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
                      filteredOutlines
                        .filter((o) => o.status.toLowerCase() === "pending")
                        .map((outline) => (
                          <div
                            key={outline._id}
                            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start space-x-4">
                              <div className="p-2 bg-gray-100 rounded">
                                <FileText className="h-6 w-6 text-gray-700" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{outline.courseName} Outline</h4>
                                <div className="flex items-center mt-1">
                                  <span className="text-xs text-gray-500">
                                    Uploaded: {formatDate(outline.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteOutline(outline._id, outline.awsKey || "")
                                }}
                              >
                                <span className="sr-only">Delete</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <path d="M3 6h18"></path>
                                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path>
                                  <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                                  <line x1="10" y1="11" x2="10" y2="17"></line>
                                  <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                              </Button>
                              {getStatusBadge(outline.status)}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => window.open(outline.document, "_blank")}
                              >
                                <span className="sr-only">Download</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="7 10 12 15 17 10" />
                                  <line x1="12" x2="12" y1="15" y2="3" />
                                </svg>
                              </Button>
                            </div>
                          </div>
                        ))
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
                      filteredOutlines
                        .filter((o) => o.status.toLowerCase() === "rejected")
                        .map((outline) => (
                          <div
                            key={outline._id}
                            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start space-x-4">
                              <div className="p-2 bg-gray-100 rounded">
                                <FileText className="h-6 w-6 text-gray-700" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{outline.courseName} Outline</h4>
                                <div className="flex items-center mt-1 space-x-2">
                                  <span className="text-xs text-gray-500">
                                    Uploaded: {formatDate(outline.createdAt)}
                                  </span>
                                  {outline.updatedAt !== outline.createdAt && (
                                    <span className="text-xs text-gray-500">
                                      • Updated: {formatDate(outline.updatedAt)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteOutline(outline._id, outline.awsKey || "")
                                }}
                              >
                                <span className="sr-only">Delete</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <path d="M3 6h18"></path>
                                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path>
                                  <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                                  <line x1="10" y1="11" x2="10" y2="17"></line>
                                  <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                              </Button>
                              {getStatusBadge(outline.status)}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => window.open(outline.document, "_blank")}
                              >
                                <span className="sr-only">Download</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-4 w-4"
                                >
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="7 10 12 15 17 10" />
                                  <line x1="12" x2="12" y1="15" y2="3" />
                                </svg>
                              </Button>
                            </div>
                          </div>
                        ))
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

          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 bg-gray-50">
              <CardTitle className="text-xl font-semibold">Status Overview</CardTitle>
              <CardDescription>Summary of your Lesson Plan submissions</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border border-gray-200 p-4 text-center">
                  <div className="text-3xl font-bold mb-1">
                    {courseOutlines.filter((o) => o.status.toLowerCase() === "approved").length}
                  </div>
                  <div className="text-sm font-medium text-gray-500">Approved</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-4 text-center">
                  <div className="text-3xl font-bold mb-1">
                    {courseOutlines.filter((o) => o.status.toLowerCase() === "pending").length}
                  </div>
                  <div className="text-sm font-medium text-gray-500">Pending</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-4 text-center">
                  <div className="text-3xl font-bold mb-1">
                    {courseOutlines.filter((o) => o.status.toLowerCase() === "rejected").length}
                  </div>
                  <div className="text-sm font-medium text-gray-500">Rejected</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this Lesson Plan? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
