"use client"

import { useState, type ChangeEvent, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StudentForm } from "./student-form"
import { uploadImageToAWS } from "@/lib/awsUpload"
import { addActivity } from "@/lib/actitivityFunctions"
import { activities } from "@/lib/activities"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface StudentGuardianModalProps {
  isOpen: boolean
  onClose: () => void
  studentData?: any
  handleDone?: any
}

// Parent info
interface ParentData {
  _id?: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  password?: string
}

export default function StudentGuardianModal({ isOpen, onClose, studentData, handleDone }: StudentGuardianModalProps) {
  const [currentStep, setCurrentStep] = useState<"student" | "parent">("student")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<any>({
    studentId: "",
    firstName: "",
    lastName: "",
    class: "",
    section: "",
    gender: "Male",
    dob: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    enrollDate: new Date().toISOString().split("T")[0],
    expectedGraduation: new Date().getFullYear().toString(),
    profilePhoto: null,
    parents: [], // array of parent IDs
    emergencyContact: "",
    transcripts: [],
    iipFlag: false,
    honorRolls: false,
    athletics: false,
    clubs: "",
    lunch: "",
    nationality: "",
  })

  // For "parent step"
  const [parentList, setParentList] = useState<ParentData[]>([])
  const [parentSearch, setParentSearch] = useState("")
  const [selectedParent, setSelectedParent] = useState<ParentData | null>(null)
  const [parentForm, setParentForm] = useState<ParentData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  })
  const [parentIsNew, setParentIsNew] = useState(true)
  const [parentFormErrors, setParentFormErrors] = useState<any>({})

  const [errors, setErrors] = useState<any>({})

  // For file uploads
  const [studentPhotoPreview, setStudentPhotoPreview] = useState<string | null>(null)
  const [transcriptPreviews, setTranscriptPreviews] = useState<{ name: string; size: number }[]>([])

  // Fetch parents for search/autocomplete
  useEffect(() => {
    if (parentSearch.length < 2) {
      setParentList([])
      return
    }
    const fetchParents = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_SRS_SERVER}/parent`)
        // Filter by name/email in frontend
        setParentList(
          res.data.filter(
            (p: ParentData) =>
              p.firstName.toLowerCase().includes(parentSearch.toLowerCase()) ||
              p.lastName.toLowerCase().includes(parentSearch.toLowerCase()) ||
              p.email.toLowerCase().includes(parentSearch.toLowerCase())
          )
        )
      } catch (e) {
        setParentList([])
      }
    }
    fetchParents()
  }, [parentSearch])

  useEffect(() => {
    if (studentData) {
      setFormData({
        studentId: studentData.studentId || "",
        firstName: studentData.firstName || "",
        lastName: studentData.lastName || "",
        class: studentData.class || "",
        section: studentData.section || "",
        gender: studentData.gender || "Male",
        dob: studentData.dob ? new Date(studentData.dob).toISOString().split("T")[0] : "",
        email: studentData.email || "",
        phone: studentData.phone || "",
        address: studentData.address || "",
        enrollDate: studentData.enrollDate
          ? new Date(studentData.enrollDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        expectedGraduation: studentData.expectedGraduation || new Date().getFullYear().toString(),
        profilePhoto: null,
        parents: studentData.parents ? studentData.parents.map((p: any) => p._id) : [],
        emergencyContact: studentData.emergencyContact || "",
        transcripts: [],
        iipFlag: studentData.iipFlag || false,
        honorRolls: studentData.honorRolls || false,
        athletics: studentData.athletics || false,
        clubs: studentData.clubs || "",
        lunch: studentData.lunch || "",
        nationality: studentData.nationality || "",
      })
      setSelectedParent(studentData.parents && studentData.parents.length > 0 ? {
        _id: studentData.parents[0]._id,
        firstName: studentData.parents[0].firstName,
        lastName: studentData.parents[0].lastName,
        email: studentData.parents[0].email,
        phone: studentData.parents[0].phone,
        address: studentData.parents[0].address,
      } : null)
    }
  }, [studentData])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (errors[name]) setErrors((prev: any) => ({ ...prev, [name]: "" }))
  }

  const handleSelectChange = (name: string, value: string | boolean) => {
    setFormData({ ...formData, [name]: value })
    if (errors[name]) setErrors((prev: any) => ({ ...prev, [name]: "" }))
  }

  const handleStudentPhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFormData({ ...formData, profilePhoto: file })
      const reader = new FileReader()
      reader.onload = (event) => setStudentPhotoPreview(event.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  // Transcripts
  const handleTranscriptChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setFormData((prev: any) => ({
        ...prev,
        transcripts: [...prev.transcripts, ...newFiles],
      }))
      const newPreviews = newFiles.map((file) => ({ name: file.name, size: file.size }))
      setTranscriptPreviews((prev) => [...prev, ...newPreviews])
    }
  }
  const removeTranscript = (index: number) => {
    setFormData((prev: any) => {
      const updated = [...prev.transcripts]
      updated.splice(index, 1)
      return { ...prev, transcripts: updated }
    })
    setTranscriptPreviews((prev) => {
      const updated = [...prev]
      updated.splice(index, 1)
      return updated
    })
  }

  // ==========================
  // Parent step logic
  // ==========================

  const handleParentSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setParentSearch(e.target.value)
    setParentIsNew(true)
    setSelectedParent(null)
  }

  const selectExistingParent = (parent: ParentData) => {
    setSelectedParent(parent)
    setParentIsNew(false)
    setParentForm({
      ...parent,
      password: "",
    })
    setParentFormErrors({})
  }

  const handleParentFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setParentForm((prev) => ({ ...prev, [name]: value }))
    setParentFormErrors((prev: any) => ({ ...prev, [name]: "" }))
  }

  const validateStudentForm = () => {
    const newErrors: any = {}
    if (!formData.firstName) newErrors.firstName = "First name required"
    if (!formData.lastName) newErrors.lastName = "Last name required"
    if (!formData.class) newErrors.class = "Class required"
    if (!formData.section) newErrors.section = "Section required"
    if (!formData.dob) newErrors.dob = "DOB required"
    if (!formData.email) newErrors.email = "Email required"
    if (!formData.address) newErrors.address = "Address required"
    if (!formData.enrollDate) newErrors.enrollDate = "Enrollment date required"
    if (!formData.expectedGraduation) newErrors.expectedGraduation = "Expected graduation required"
    if (!formData.emergencyContact) newErrors.emergencyContact = "Emergency contact required"
     if (!formData.password || formData.password.length < 6) newErrors.password = "Password (min 6 chars) required"
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fill all student fields")
      return false
    }
    return true
  }

  const validateParentForm = () => {
    const newErrors: any = {}
    if (parentIsNew) {
      if (!parentForm.firstName) newErrors.firstName = "First name required"
      if (!parentForm.lastName) newErrors.lastName = "Last name required"
      if (!parentForm.email) newErrors.email = "Email required"
      if (!parentForm.password || parentForm.password.length < 6) newErrors.password = "Password (min 6 chars) required"
    }
    setParentFormErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fill all parent fields")
      return false
    }
    return true
  }

  // ==========================
  // Continue / Submit
  // ==========================

  const handleContinueToParent = () => {
    if (validateStudentForm()) {
      setCurrentStep("parent")
    }
  }

  const handleBackToStudent = () => setCurrentStep("student")

  const handleSubmit = async () => {
    if (!validateParentForm()) return
    setIsSubmitting(true)
    try {
      let parentId: string

      // 1. Create new parent if needed
      if (parentIsNew) {
        // Check if a parent with this email already exists
        let parentRes;
        try {
          parentRes = await axios.get(`${process.env.NEXT_PUBLIC_SRS_SERVER}/parent/by-email/${encodeURIComponent(parentForm.email)}`);
        } catch (e) {
          parentRes = null;
        }
        let parentObj = null;
        if (parentRes && parentRes.data && parentRes.data._id) {
          parentObj = parentRes.data;
        } else if (parentRes && Array.isArray(parentRes.data) && parentRes.data.length > 0) {
          // Some APIs return an array
          parentObj = parentRes.data[0];
        }
      
        if (parentObj) {
          // Parent already exists, use this
          parentId = parentObj._id;
          toast.info("Parent already exists. Selected existing parent.");
        } else {
          // Parent does not exist, create new
          const res = await axios.post(`${process.env.NEXT_PUBLIC_SRS_SERVER}/parent`, parentForm)
          parentId = res.data._id
        }
      } else if (selectedParent && selectedParent._id) {
        parentId = selectedParent._id
      } else {
        throw new Error("Parent selection error")
      }

      // 2. Upload images/files
      let profilePhotoUrl = null
      let transcriptsUrls: string[] = []
      if (formData.profilePhoto instanceof File) {
        const uploadResponse = await uploadImageToAWS(formData.profilePhoto, () => {})
        profilePhotoUrl = uploadResponse.awsUrl
      }
      for (const transcript of formData.transcripts) {
        const uploadResponse = await uploadImageToAWS(transcript, () => {})
        transcriptsUrls.push(uploadResponse.awsUrl)
      }

      // 3. Prepare student data
      const apiData = {
        ...formData,
        profilePhoto: profilePhotoUrl || "N/A",
        transcripts: transcriptsUrls,
        parents: [parentId],
        password: formData.password,
      }

      // 4. Add/Edit student
      if (studentData) {
        await axios.put(`${process.env.NEXT_PUBLIC_SRS_SERVER}/student/${studentData._id}`, apiData)
        toast.success("Student updated successfully!")
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_SRS_SERVER}/student/add`, apiData)
        toast.success("Student added successfully!")
      }

      await handleDone?.()
      setCurrentStep("student")
      resetForm()
      onClose()
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error(error.response.data.msg)
      } else if (error.response?.data?.msg) {
        toast.error(error.response.data.msg)
      } else {
        toast.error("Error saving student/parent")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      studentId: "",
      firstName: "",
      lastName: "",
      class: "",
      section: "",
      gender: "Male",
      dob: "",
      email: "",
      phone: "",
      address: "",
      enrollDate: new Date().toISOString().split("T")[0],
      expectedGraduation: new Date().getFullYear().toString(),
      profilePhoto: null,
      parents: [],
      emergencyContact: "",
      transcripts: [],
      iipFlag: false,
      honorRolls: false,
      athletics: false,
      clubs: "",
      lunch: "",
      nationality: "",
    })
    setSelectedParent(null)
    setParentForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      password: "",
    })
    setParentSearch("")
    setParentIsNew(true)
    setParentFormErrors({})
    setStudentPhotoPreview(null)
    setTranscriptPreviews([])
    setErrors({})
  }

  const handleCloseRequest = (open: boolean) => {
    if (!isSubmitting && !open) {
      onClose()
      resetForm()
    }
  }

  // ==========================
  // Render
  // ==========================

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseRequest}>
      <DialogContent className="max-w-[95vw] sm:max-w-[80vw] md:max-w-[70vw] lg:max-w-5xl p-0">
        <div className="custom-scrollbar max-h-[80vh] overflow-y-auto">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>
              {studentData ? "Edit " : "Add "}
              {currentStep === "student" ? "Student Information" : "Parent Information"}
            </DialogTitle>
          </DialogHeader>

          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{
                transform: currentStep === "student" ? "translateX(0%)" : "translateX(-50%)",
                width: "200%",
              }}
            >
              {/* Student Form */}
              <div className="w-1/2 flex-shrink-0">
                <StudentForm
                  formData={formData}
                  errors={errors}
                  photoPreview={studentPhotoPreview}
                  onInputChange={handleInputChange}
                  onSelectChange={handleSelectChange}
                  onPhotoChange={handleStudentPhotoChange}
                  onContinue={handleContinueToParent}
                  onCancel={onClose}
                  disabled={isSubmitting}
                  isEditing={!!studentData}
                  transcriptPreviews={transcriptPreviews}
                  onTranscriptChange={handleTranscriptChange}
                  onRemoveTranscript={removeTranscript}
                />
              </div>

              {/* Parent Step */}
              <div className="w-1/2 flex-shrink-0">
                <Card className="mt-8 max-w-xl mx-auto">
                  <CardHeader>
                    <CardTitle>
                      Associate Parent/Guardian
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Parent search or new */}
                    <div className="mb-4">
                      <Label htmlFor="parent-search">Search for existing parent (by name or email):</Label>
                      <Input
                        id="parent-search"
                        placeholder="Type to search parents..."
                        value={parentSearch}
                        onChange={handleParentSearchChange}
                        autoComplete="off"
                        className="mb-2"
                      />
                      {parentSearch.length > 1 && parentList.length > 0 && (
                        <ul className="border rounded bg-white max-h-40 overflow-y-auto">
                          {parentList.map(parent => (
                            <li
                              key={parent._id}
                              className={`p-2 hover:bg-gray-100 cursor-pointer ${selectedParent && selectedParent._id === parent._id ? "font-bold" : ""}`}
                              onClick={() => selectExistingParent(parent)}
                            >
                              {parent.firstName} {parent.lastName} ({parent.email})
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mb-2">
                      <Button
                        type="button"
                        variant={parentIsNew ? "default" : "outline"}
                        onClick={() => { setParentIsNew(true); setSelectedParent(null) }}
                      >
                        Add New Parent
                      </Button>
                      <Button
                        type="button"
                        variant={!parentIsNew ? "default" : "outline"}
                        disabled={!selectedParent}
                        onClick={() => setParentIsNew(false)}
                      >
                        Use Selected Parent
                      </Button>
                    </div>
                    {parentIsNew && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>First Name</Label>
                            <Input name="firstName" value={parentForm.firstName} onChange={handleParentFormChange} />
                            {parentFormErrors.firstName && <div className="text-red-500 text-sm">{parentFormErrors.firstName}</div>}
                          </div>
                          <div>
                            <Label>Last Name</Label>
                            <Input name="lastName" value={parentForm.lastName} onChange={handleParentFormChange} />
                            {parentFormErrors.lastName && <div className="text-red-500 text-sm">{parentFormErrors.lastName}</div>}
                          </div>
                          <div>
                            <Label>Email</Label>
                            <Input name="email" value={parentForm.email} onChange={handleParentFormChange} />
                            {parentFormErrors.email && <div className="text-red-500 text-sm">{parentFormErrors.email}</div>}
                          </div>
                          <div>
                            <Label>Phone</Label>
                            <Input name="phone" value={parentForm.phone} onChange={handleParentFormChange} />
                          </div>
                          <div className="md:col-span-2">
                            <Label>Address</Label>
                            <Input name="address" value={parentForm.address} onChange={handleParentFormChange} />
                          </div>
                          <div className="md:col-span-2">
                            <Label>Password</Label>
                            <Input name="password" type="password" value={parentForm.password} onChange={handleParentFormChange} />
                            {parentFormErrors.password && <div className="text-red-500 text-sm">{parentFormErrors.password}</div>}
                          </div>
                        </div>
                      </>
                    )}
                    {!parentIsNew && selectedParent && (
                      <div className="my-4 p-4 border rounded">
                        <div><b>Name:</b> {selectedParent.firstName} {selectedParent.lastName}</div>
                        <div><b>Email:</b> {selectedParent.email}</div>
                        <div><b>Phone:</b> {selectedParent.phone}</div>
                        <div><b>Address:</b> {selectedParent.address}</div>
                      </div>
                    )}
                    <div className="flex justify-between mt-8">
                      <Button variant="outline" onClick={handleBackToStudent} disabled={isSubmitting}>Back</Button>
                      <Button className="bg-black text-white" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : studentData ? "Update Student" : "Add Student"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
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