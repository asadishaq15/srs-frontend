"use client"

import type React from "react"

import { useState, useEffect } from "react"
import axios from "axios"
import { Camera, Upload, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "react-toastify"
import { activities } from "@/lib/activities"
import { addActivity } from "@/lib/actitivityFunctions"

interface Teacher {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  department: string
  gender: string
  address: string
  qualification: string
}

interface AddTeacherModalProps {
  isOpen: boolean
  onClose: () => void
  teacherData?: Teacher | null
  onSuccess: () => void
}

export default function AddTeacherModal({ isOpen, onClose, teacherData, onSuccess }: AddTeacherModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "Male",
    phone: "",
    email: "",
    department: "",
    address: "",
    qualification: "",
  })

  const [departments, setDepartments] = useState<{ _id: string; name: string }[]>([])
  const [isDepartmentsLoading, setIsDepartmentsLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  useEffect(() => {
    fetchDepartments()

    if (teacherData) {
      setFormData({
        firstName: teacherData.firstName,
        lastName: teacherData.lastName,
        gender: teacherData.gender,
        phone: teacherData.phone,
        email: teacherData.email,
        department: teacherData.department,
        address: teacherData.address || "",
        qualification: teacherData.qualification || "",
      })
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        gender: "Male",
        phone: "",
        email: "",
        department: "",
        address: "",
        qualification: "",
      })
    }
  }, [teacherData])

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (value: string, field: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({ ...prev, gender: value }))
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      console.log('formdata',formData);
      if (teacherData?._id) {
        const response = await axios.put(`${process.env.NEXT_PUBLIC_SRS_SERVER}/teachers/${teacherData._id}`, formData)
        console.log(response)
        if (response.data.status == 409) {
          toast.error(response.data.msg)
        } else {
          toast.success("Teacher updated successfully!")
          const message = activities.admin.updateTeacher.description.replace("{teacherName}", formData.firstName)
          const activity = {
            title: activities.admin.updateTeacher.action,
            subtitle: message,
            performBy: "Admin", 
            
          }
          const upd = await addActivity(activity) 
          onSuccess()
          onClose() 
          setFormData({
            firstName: "",
            lastName: "",
            gender: "Male",
            phone: "",
            email: "",
            department: "",
            address: "",
            qualification: "",
          })
        }
      } else {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_SRS_SERVER}/teachers/add`, formData)
        console.log(response)
        if (response.data.status == 409) {
          toast.error(response.data.msg)
        } else {
          toast.success("Teacher added successfully!")
          const message = activities.admin.addTeacher.description.replace("{teacherName}", formData.firstName)
          const activity = {
            title: activities.admin.addTeacher.action,
            subtitle: message,
            performBy: "Admin",
          } 
          const act = await addActivity(activity) 
          console.log('act',act)
          onSuccess()
          onClose()
          setFormData({
            firstName: "",
            lastName: "",
            gender: "Male",
            phone: "",
            email: "",
            department: "",
            address: "",
            qualification: "",
          })
        }
      }

    } catch (error: any) {
      console.error("Error saving teacher:", error)

      if (error.response && error.response.status === 409) {
        toast.error("This email is already registered to another teacher")
      } else {
        toast.error(teacherData ? "Failed to update teacher" : "Failed to add teacher")
      }
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[80vw] md:max-w-[70vw] lg:max-w-5xl p-6">
        <div className="custom-scrollbar max-h-[80vh] overflow-y-auto">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>{teacherData ? "Edit Teacher" : "Add New Teacher"}</DialogTitle>
          </DialogHeader>
          <div className="p-6 space-y-8">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Photo Upload */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Teacher Photo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="flex h-32 w-32 sm:h-40 sm:w-40 items-center justify-center rounded-full bg-gray-100 overflow-hidden">
                        {photoPreview ? (
                          <img
                            src={photoPreview || "/placeholder.svg"}
                            alt="Teacher preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User className="h-16 w-16 sm:h-20 sm:w-20 text-gray-400" />
                        )}
                      </div>
                      <label className="absolute bottom-0 right-0 rounded-full bg-black p-2 text-white shadow-lg cursor-pointer">
                        <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                      </label>
                    </div>
                    <label className="cursor-pointer">
                      <Button variant="outline" className="mt-4">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Photo
                      </Button>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    </label>
                  </div>

                  <Separator />
                </CardContent>
              </Card>

              {/* Personal Details */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="Enter first name"
                        className="border-gray-200"
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter last name"
                        className="border-gray-200"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <RadioGroup value={formData.gender} onValueChange={handleRadioChange} className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Male" id="male" />
                        <Label htmlFor="male">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Female" id="female" />
                        <Label htmlFor="female">Female</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter email"
                        className={`border-gray-200 ${teacherData ? "opacity-70" : ""}`}
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!!teacherData}
                        style={teacherData ? { cursor: "not-allowed" } : undefined}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter phone number"
                        className="border-gray-200"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => handleSelectChange(value, "department")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                      {isDepartmentsLoading ? (
  <SelectItem value="ok" disabled>
    Loading departments...
  </SelectItem>
) : departments.length > 0 ? (
  departments.map((dept) => (
    <SelectItem key={dept._id} value={dept.departmentName}>
      {dept.departmentName}
    </SelectItem>
  ))
) : (
  <SelectItem value="none" disabled>
    No departments available
  </SelectItem>
)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter address"
                      className="min-h-[80px] border-gray-200"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qualification">Qualifications</Label>
                    <Textarea
                      id="qualification"
                      placeholder="Enter academic qualifications"
                      className="min-h-[100px] border-gray-200"
                      value={formData.qualification}
                      onChange={handleChange}
                    />
                  </div>

                  <Separator />

                  <div className="flex justify-end space-x-4">
                    <Button variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      className="bg-black text-white hover:bg-gray-800"
                      onClick={handleSubmit}
                      disabled={isLoading}
                    >
                      {isLoading ? "Submitting..." : teacherData ? "Update" : "Submit"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #888 #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #888;
          border-radius: 6px;
          border: 3px solid #f1f1f1;
        }
      `}</style>
    </Dialog>
  )
}

