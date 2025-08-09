"use client"

import type React from "react"

import { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Loader2, Plus, Trash } from "lucide-react" // Import Trash icon
import { toast } from "react-toastify"
import { activities } from "@/lib/activities"
import { addActivity } from "@/lib/actitivityFunctions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Department {
  _id: string
  departmentName: string
  createdAt: string
  updatedAt: string
  __v: number
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newDepartmentName, setNewDepartmentName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false) // State for delete confirmation modal
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null) // Department to delete
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [departmentToEdit, setDepartmentToEdit] = useState<Department | null>(null)
  const [editDepartmentName, setEditDepartmentName] = useState("")

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SRS_SERVER}/department`)

      setDepartments(response.data)
    } catch (error) {
      console.error("Error fetching departments:", error)
      toast.error("Failed to load departments")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newDepartmentName.trim()) {
      toast.error("Department name is required")
      return
    }

    try {
      setIsSubmitting(true)
      await axios.post(`${process.env.NEXT_PUBLIC_SRS_SERVER}/department/add`, {
        departmentName: newDepartmentName,
      })

      toast.success("Department added successfully")
      const message = activities.admin.addDepartment.description.replace("{departmentName}", newDepartmentName)

      const activity = {
        title: activities.admin.addDepartment.action,
        subtitle: message,
        performBy: "Admin",
      }
      const act = await addActivity(activity)
      setNewDepartmentName("")
      setIsModalOpen(false)
      fetchDepartments() 
    } catch (error: any) {
      console.error("Error updating department:", error)
      if (error.response && error.response.status === 409) {
        toast.error(error.response.data.message)
      } else {
        toast.error("Failed to update department maybe This department already exists")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteDepartment = async () => {
    if (!departmentToDelete) return

    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_SRS_SERVER}/department/${departmentToDelete._id}`)
      toast.success("Department deleted successfully")
      fetchDepartments()
      const message = activities.admin.deleteDepartment.description.replace("{departmentName}", newDepartmentName)

      const activity = {
        title: activities.admin.deleteDepartment.action,
        subtitle: message,
        performBy: "Admin",
      }
      const act = await addActivity(activity)
    } catch (error: any) {
      console.error("Error updating department:", error)
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data.message)
      } else {
        toast.error("Failed to delete")
      } 
    }
     finally {
      setIsDeleteModalOpen(false)
      setDepartmentToDelete(null)
    }
  }

  const openDeleteConfirmationModal = (department: Department) => {
    setDepartmentToDelete(department) // Set the department to delete
    setIsDeleteModalOpen(true) // Open the delete confirmation modal
  }

  const openEditModal = (department: Department) => {
    setDepartmentToEdit(department)
    setEditDepartmentName(department.departmentName)
    setIsEditModalOpen(true)
  }

  const handleEditDepartment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editDepartmentName.trim() || !departmentToEdit) {
      toast.error("Department name is required")
      return
    }

    try {
      setIsSubmitting(true)
      await axios.put(`${process.env.NEXT_PUBLIC_SRS_SERVER}/department/${departmentToEdit._id}`, {
        departmentName: editDepartmentName,
      })

      toast.success("Department updated successfully")
      const message =
        activities.admin.updateDepartment?.description?.replace("{departmentName}", editDepartmentName) ||
        `Updated department ${editDepartmentName}`

      const activity = {
        title: activities.admin.updateDepartment?.action || "Update Department",
        subtitle: message,
        performBy: "Admin",
      }
      await addActivity(activity)

      setIsEditModalOpen(false)
      fetchDepartments() 
    } catch (error: any) {
      console.error("Error updating department:", error)
      if (error.response && error.response.status === 409) {
        toast.error(error.response.data.message)
      } else {
        toast.error("Failed to update department maybe This department already exists")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-8 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Departments</h1>
        <Button onClick={() => setIsModalOpen(true)} className="bg-black text-white hover:bg-gray-800">
          <Plus className="mr-2 h-4 w-4" /> Add Department
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((department) => (
            <Card key={department._id} className="border border-gray-200">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{department.departmentName}</CardTitle>
                  <div className="flex gap-2">
                    {/* <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModal(department)}
                      className="text-blue-500 hover:bg-blue-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-pencil"
                      >
                        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                    </Button> */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteConfirmationModal(department)}
                      className="text-red-500 hover:bg-red-50"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">Added on {new Date(department.createdAt).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Department Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddDepartment}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="departmentName" className="text-right col-span-1">
                  Name
                </label>
                <Input
                  id="departmentName"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter department name"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-black text-white hover:bg-gray-800" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
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
              Are you sure you want to delete the department{" "}
              <span className="font-semibold">{departmentToDelete?.departmentName}</span>? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="bg-red-500 text-white hover:bg-red-600" onClick={handleDeleteDepartment}>
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Department Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditDepartment}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="editDepartmentName" className="text-right col-span-1">
                  Name
                </label>
                <Input
                  id="editDepartmentName"
                  value={editDepartmentName}
                  onChange={(e) => setEditDepartmentName(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter department name"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-black text-white hover:bg-gray-800" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Update"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

