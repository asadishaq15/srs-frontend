"use client"

import { useEffect, useState, useCallback } from "react"
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus, Copy, Check, Loader2, FileText, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { debounce } from "lodash"
import { activities } from "@/lib/activities"
import { addActivity } from "@/lib/actitivityFunctions"
import { ExcelUploadModal } from "./Add-students/excellUpload"
import { toast } from "react-toastify"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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

export default function StudentsTable() {
  const [students, setStudents] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [totalRecords, setTotalRecords] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [classFilter, setClassFilter] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [open, setOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copiedId, setCopiedId] = useState(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState(null)

  const fetchStudentData = useCallback(async () => {
    try {
      console.log(classFilter)
      setIsLoading(true)
      const url =
        classFilter === "all"
          ? `${process.env.NEXT_PUBLIC_SRS_SERVER}/student`
          : `${process.env.NEXT_PUBLIC_SRS_SERVER}/student?className=${encodeURIComponent(classFilter)}`
      const response = await axios.get(url)
      console.log("response", response)
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

  const fetchStudentDataBystudentId = useCallback(
    debounce(async (studentId: any) => {
      try {
        setIsLoading(true)
        const response = await axios.get(`${process.env.NEXT_PUBLIC_SRS_SERVER}/student?studentId=${studentId}`)
        console.log("response", response)
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
    [],
  )

  const debouncedRoomSearch = useCallback(
    debounce((value) => {
      setClassFilter(value || "all")
    }, 500),
    [],
  )

  useEffect(() => {
    fetchStudentData()
  }, [currentPage, fetchStudentData, classFilter])

  const getTableHeaders = () => {
    if (students.length === 0) return []
    const baseHeaders = Object.keys(students[0]).filter((key) => key !== "__v" && key !== "_id" && key !== "guardian")

    // Ensure iipFlag is the first column if it exists
    const orderedHeaders = ["iipFlag"]

    // Add all other headers except iipFlag (which we already added)
    baseHeaders.forEach((header) => {
      if (header !== "iipFlag") {
        orderedHeaders.push(header)
      }
    })

    // Add guardian headers
    return [...orderedHeaders, "Guardian Name", "Guardian Email", "Guardian Phone", "Guardian Password"]
  }

  const formatDate = (dateString: any): string => {
    return new Date(dateString).toISOString().slice(0, 10)
  }

  const formatPassword = (password: any) => {
    return password.slice(0, 6) + "..."
  }

  const copyPassword = (password: any, id: any) => {
    navigator.clipboard.writeText(password)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const renderCellContent = (student: any, key: any) => {
    if (key === "iipFlag") {
      return (
        <div className="flex items-center justify-center">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${student[key] ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            {student[key] === true ? "Yes" : "No"}
          </span>
        </div>
      )
    }
    if (key === "profilePhoto") {
      if (student[key] && student[key].startsWith("https")) {
        return (
          <div className="flex items-center justify-center">
            <img src={student[key] || "/placeholder.svg"} alt="Profile" className="h-8 w-8 rounded-full object-cover" />
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
                  {copiedId === student._id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
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
      const guardianKey = key.split(" ")[1].toLowerCase()

      const actualKey =
        guardianKey === "email"
          ? "guardianEmail"
          : guardianKey === "phone"
            ? "guardianPhone"
            : guardianKey === "name"
              ? "guardianName"
              : guardianKey === "password"
                ? "password"
                : `guardian${guardianKey.charAt(0).toUpperCase() + guardianKey.slice(1)}`

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
      if (student[key] === true) {
        return "Yes"
      } else if (student[key] === false) {
        return "No"
      }
    }
    return String(student[key] || "")
  }

  const handleDeleteClick = (student: any) => {
    setStudentToDelete(student)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return

    setIsLoading(true)
    setDeleteConfirmOpen(false)

    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_SRS_SERVER}/student/${studentToDelete._id}`)
      console.log("response", response)
      toast.success("Student deleted successfully", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })

      await fetchStudentData()
      const message = activities.admin.deleteStudent.description.replace("{courseName}", studentToDelete.firstName)

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
          <Button onClick={() => setOpen(true)} className="bg-black text-white hover:bg-gray-800">
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
          onChange={(e) => {
            setSearchTerm(e.target.value)
            fetchStudentDataBystudentId(e.target.value)
          }}
          className="max-w-sm"
        />
        <Input
          placeholder="Search Grade Level..."
          onChange={(e) => {
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
                {getTableHeaders().map((header) => (
                  <TableHead key={header} className={header === "guardian" ? "" : "whitespace-nowrap"}>
                    {header.charAt(0).toUpperCase() + header.slice(1).replace(/([A-Z])/g, " $1")}
                  </TableHead>
                ))}
                <TableHead className="whitespace-nowrap">Edit</TableHead>
                <TableHead className="whitespace-nowrap">Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student._id}>
                  {getTableHeaders().map((key) => (
                    <TableCell key={key} className="whitespace-nowrap">
                      {renderCellContent(student, key)}
                    </TableCell>
                  ))}
                  <TableCell className="whitespace-nowrap">
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
                  <TableCell className="whitespace-nowrap">
                    <Button onClick={() => handleDeleteClick(student)} variant="ghost" size="sm">
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
          Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalRecords)} of {totalRecords}{" "}
          students
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
