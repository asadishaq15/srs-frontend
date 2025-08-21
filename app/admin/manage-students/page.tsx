"use client"

import React, { useEffect, useState, useCallback } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Plus,
  Copy,
  Check,
  Loader2,
  FileText,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { debounce } from "lodash"
import { activities } from "@/lib/activities"
import { addActivity } from "@/lib/actitivityFunctions"
import { ExcelUploadModal } from "./Add-students/excellUpload"
import { toast } from "react-toastify"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import StudentGuardianModal from "./Add-students/AddStudents"
import axios from "axios"

// --- Types ---
interface Parent {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  password?: string
}

interface Guardian {
  guardianName?: string
  guardianEmail?: string
  guardianPhone?: string
  password?: string
}

export interface Student {
  _id: string
  profilePhoto?: string
  studentId: string
  firstName: string
  lastName: string
  class: string
  section?: string
  email: string
  phone: string
  iipFlag?: boolean
  honorRolls?: boolean
  athletics?: boolean
  clubs?: string
  lunch?: string
  nationality?: string
  createdAt?: string
  updatedAt?: string
  password?: string
  parents?: Parent[]
  guardian?: Guardian
  [key: string]: any // For extra dynamic fields
}

export default function StudentsTable() {
  const [students, setStudents] = useState<Student[]>([])
  const [totalPages, setTotalPages] = useState<number>(0)
  const [totalRecords, setTotalRecords] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [limit, setLimit] = useState<number>(10)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [classFilter, setClassFilter] = useState<string>("all")
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)

  // -------- Fetch Students --------
  const fetchStudentData = useCallback(async () => {
    try {
      setIsLoading(true)
      const url =
        classFilter === "all"
          ? `${process.env.NEXT_PUBLIC_SRS_SERVER}/student`
          : `${process.env.NEXT_PUBLIC_SRS_SERVER}/student?className=${encodeURIComponent(
              classFilter
            )}`
      const response = await axios.get(url)
      setStudents(response.data.data || [])
      setTotalPages(response.data.totalPages || 0)
      setTotalRecords(response.data.totalRecordsCount || 0)
      setCurrentPage(response.data.currentPage || 1)
      setLimit(response.data.limit || 10)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching student data:", error)
      setIsLoading(false)
    }
  }, [classFilter])

  // -------- Search by Student ID --------
  const fetchStudentDataBystudentId = useCallback(
    debounce(async (studentId: string) => {
      try {
        setIsLoading(true)
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_SRS_SERVER}/student?studentId=${studentId}`
        )
        setStudents(response.data.data || [])
        setTotalPages(response.data.totalPages || 0)
        setTotalRecords(response.data.totalRecordsCount || 0)
        setCurrentPage(response.data.currentPage || 1)
        setLimit(response.data.limit || 10)
      } catch (error) {
        console.error("Error fetching student data by Student Id:", error)
      } finally {
        setIsLoading(false)
      }
    }, 500),
    []
  )

  // -------- Class Filter (Debounced) --------
  const debouncedRoomSearch = useCallback(
    debounce((value: string) => {
      setClassFilter(value || "all")
    }, 500),
    []
  )

  useEffect(() => {
    fetchStudentData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, fetchStudentData, classFilter])

  // -------- Table Headers --------
  const getTableHeaders = () => {
    if (students.length === 0) return []
    const baseHeaders = Object.keys(students[0]).filter(
      (key) => key !== "__v" && key !== "_id" && key !== "guardian"
    )
    // Ensure iipFlag is first if exists
    const orderedHeaders: string[] = []
    if (baseHeaders.includes("iipFlag")) orderedHeaders.push("iipFlag")
    baseHeaders.forEach((header) => {
      if (header !== "iipFlag") orderedHeaders.push(header)
    })
    // Add guardian headers
    return [
      ...orderedHeaders,
      "Guardian Name",
      "Guardian Email",
      "Guardian Phone",
      "Guardian Password",
    ]
  }

  // -------- Helpers --------
  const formatDate = (dateString?: string): string =>
    dateString ? new Date(dateString).toISOString().slice(0, 10) : ""

  const formatPassword = (password?: string) =>
    password ? password.slice(0, 6) + "..." : ""

  const copyPassword = (password: string, id: string) => {
    navigator.clipboard.writeText(password)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const renderCellContent = (student: Student, key: string) => {
    if (key === "iipFlag") {
      return (
        <div className="flex items-center justify-center">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              student[key]
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {student[key] === true ? "Yes" : "No"}
          </span>
        </div>
      )
    }
    if (key === "profilePhoto") {
      if (student[key] && typeof student[key] === "string" && student[key].startsWith("https")) {
        return (
          <div className="flex items-center justify-center">
            <img
              src={student[key] || "/placeholder.svg"}
              alt="Profile"
              className="h-8 w-8 rounded-full object-cover"
            />
          </div>
        )
      } else {
        return (
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
          </div>
        )
      }
    }
    if (key === "createdAt" || key === "updatedAt") {
      return formatDate(student[key])
    }
    if (key === "password") {
      return (
        <div className="flex items-center">
          <span>{formatPassword(student[key])}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyPassword(student[key], student._id)}
                  className="ml-2"
                >
                  {copiedId === student._id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copiedId === student._id ? "Copied!" : "Copy password"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    }
    if (key.startsWith("Guardian")) {
      if (!student.guardian) return "N/A"
      const guardianKey = key.split(" ")[1].toLowerCase()
      let actualKey: keyof Guardian
      switch (guardianKey) {
        case "email":
          actualKey = "guardianEmail"
          break
        case "phone":
          actualKey = "guardianPhone"
          break
        case "name":
          actualKey = "guardianName"
          break
        case "password":
          actualKey = "password"
          break
        default:
          actualKey = guardianKey as keyof Guardian
      }
      return student.guardian && student.guardian[actualKey]
        ? actualKey === "password"
          ? formatPassword(student.guardian[actualKey])
          : student.guardian[actualKey]
        : "N/A"
    }
    if (typeof student[key] === "object" && student[key] !== null) {
      return "Object"
    }
    if (typeof student[key] === "boolean") {
      return student[key] ? "Yes" : "No"
    }
    return student[key] !== undefined && student[key] !== null
      ? String(student[key])
      : ""
  }

  // -------- Delete Logic --------
  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return
    setIsLoading(true)
    setDeleteConfirmOpen(false)
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_SRS_SERVER}/student/${studentToDelete._id}`
      )
      toast.success("Student deleted successfully", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
      await fetchStudentData()
      const message = activities.admin.deleteStudent.description.replace(
        "{courseName}",
        studentToDelete.firstName
      )
      const activity = {
        title: activities.admin.deleteStudent.action,
        subtitle: message,
        performBy: "Admin",
      }
      await addActivity(activity)
    } catch (error) {
      console.error("Error deleting student:", error)
      toast.error("Failed to delete student", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    } finally {
      setIsLoading(false)
      setStudentToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false)
    setStudentToDelete(null)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  return (
    <div className="container mx-auto py-10 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Students</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setEditingStudent(null)
              setIsModalOpen(true)
            }}
            className="bg-black text-white hover:bg-gray-800"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Student
          </Button>
          <Button
            onClick={() => setOpen(true)}
            className="bg-black text-white hover:bg-gray-800"
          >
            <FileText className="mr-2 h-4 w-4" /> Import Students
          </Button>
          <ExcelUploadModal
            open={open}
            onClose={() => setOpen(false)}
            onOpenChange={setOpen}
            refetch={fetchStudentData}
          />
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Search students by student ID.."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(e.target.value)
            fetchStudentDataBystudentId(e.target.value)
          }}
          className="max-w-sm"
        />
        <Input
          placeholder="Search Grade Level..."
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            debouncedRoomSearch(e.target.value)
          }}
          className="w-[180px]"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="border-gray-900">
            <Loader2 className="animate-spin" />
          </div>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-10">No students found</div>
      ) : (
        <div className="overflow-x-auto w-full">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                {/* Example, you can use getTableHeaders if you want dynamic columns */}
                <TableHead></TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>First Name</TableHead>
                <TableHead>Last Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Parent Name</TableHead>
                <TableHead>Parent Email</TableHead>
                <TableHead>IIP</TableHead>
                <TableHead>Honor Rolls</TableHead>
                <TableHead>Athletics</TableHead>
                <TableHead>Clubs</TableHead>
                <TableHead>Lunch</TableHead>
                <TableHead>Nationality</TableHead>
                <TableHead>Edit</TableHead>
                <TableHead>Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student: Student) => (
                <TableRow key={student._id}>
                  <TableCell>
                    {student.profilePhoto && student.profilePhoto.startsWith("https") ? (
                      <img
                        src={student.profilePhoto}
                        alt="Profile"
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4 text-gray-600" />
                    )}
                  </TableCell>
                  <TableCell>{student.studentId}</TableCell>
                  <TableCell>{student.firstName}</TableCell>
                  <TableCell>{student.lastName}</TableCell>
                  <TableCell>{student.class}</TableCell>
                  <TableCell>{student.section}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.phone}</TableCell>
                  <TableCell>
                    {student.parents && student.parents.length > 0
                      ? student.parents.map((parent: Parent) => (
                          <div key={parent._id}>
                            {parent.firstName} {parent.lastName}
                          </div>
                        ))
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {student.parents && student.parents.length > 0
                      ? student.parents.map((parent: Parent) => (
                          <div key={parent._id}>{parent.email}</div>
                        ))
                      : "N/A"}
                  </TableCell>
                  <TableCell>{student.iipFlag ? "Yes" : "No"}</TableCell>
                  <TableCell>{student.honorRolls ? "Yes" : "No"}</TableCell>
                  <TableCell>{student.athletics ? "Yes" : "No"}</TableCell>
                  <TableCell>{student.clubs}</TableCell>
                  <TableCell>{student.lunch}</TableCell>
                  <TableCell>{student.nationality}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingStudent(student)
                        setIsModalOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleDeleteClick(student)}
                      variant="ghost"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex justify-between items-center mt-4">
        <div>
          Showing {(currentPage - 1) * limit + 1} to{" "}
          {Math.min(currentPage * limit, totalRecords)} of {totalRecords} students
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span>
            {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete student{" "}
              <span className="font-semibold">
                {studentToDelete?.firstName} {studentToDelete?.lastName}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelDelete}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <StudentGuardianModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        studentData={editingStudent}
        handleDone={fetchStudentData}
      />
    </div>
  )
}