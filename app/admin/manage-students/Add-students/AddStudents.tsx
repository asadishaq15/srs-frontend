"use client"

import { useState, type ChangeEvent, useEffect } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StudentForm } from "./student-form"
import { GuardianForm } from "./guardian-form"   
import { uploadImageToAWS } from "@/lib/awsUpload"
import { addActivity } from "@/lib/actitivityFunctions"
import { activities } from "@/lib/activities"

interface StudentGuardianModalProps {
  isOpen: boolean
  onClose: () => void
  studentData?: any
  handleDone?: any
}

interface StudentData {
  studentId: string
  firstName: string
  lastName: string
  class: string
  section: string
  gender: string
  dob: string
  email: string
  phone: string
  address: string
  enrollDate: string
  expectedGraduation: string
  profilePhoto: any
  guardianName: string
  guardianEmail: string
  guardianPhone: string
  guardianPhoto: any
  guardianRelation: string
  guardianProfession: string
  transcripts: File[] // Add this line
  iipFlag: boolean // Add this line
  honorRolls: boolean // Add this line
  athletics: boolean // Add this line
  clubs: string // Add this line
  lunch: string // Add this line
  nationality: string // Add this line
  emergencyContact: string 
}

interface FormErrors {
  studentId: string
  firstName: string
  lastName: string
  class: string
  section: string
  dob: string
  email: string
  phone: string
  address: string
  expectedGraduation: string
  guardianName: string
  guardianEmail: string
  guardianPhone: string
  guardianRelation: string
  guardianProfession: string
  iipFlag: boolean // Add this line
  clubs: string // Add this line
  lunch: string // Add this line
  nationality: string // Add this line
  emergencyContact: string
}

export default function StudentGuardianModal({ isOpen, onClose, studentData, handleDone }: StudentGuardianModalProps) {
  const [currentStep, setCurrentStep] = useState<"student" | "guardian">("student")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<StudentData>({
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
    guardianName: "",
    guardianEmail: "",
    guardianPhone: "",
    guardianPhoto: null,
    guardianRelation: "",
    guardianProfession: "",
    transcripts: [], // Add this line
    iipFlag: false, // Add this line
    honorRolls: false, // Add this line
    athletics: false, // Add this line
    clubs: "", // Add this line
    lunch: "", // Add this line
    nationality: "", // Add this line
    emergencyContact: ""
  })

  const [errors, setErrors] = useState<FormErrors>({
    studentId: "",
    firstName: "",
    lastName: "",
    class: "",
    section: "",
    dob: "",
    email: "",
    phone: "",
    address: "",
    expectedGraduation: "",
    guardianName: "",
    guardianEmail: "",
    guardianPhone: "",
    guardianRelation: "",
    guardianProfession: "",
    iipFlag: false, // Add this line
    clubs: "", // Add this line
    lunch: "", // Add this line
    nationality: "", // Add this line
    emergencyContact: ""
  })

  const [studentPhotoPreview, setStudentPhotoPreview] = useState<string | null>(null)
  const [guardianPhotoPreview, setGuardianPhotoPreview] = useState<string | null>(null)
  const [transcriptPreviews, setTranscriptPreviews] = useState<{ name: string; size: number }[]>([]) // Add this line

  useEffect(() => {
    if (currentStep === "student") {
      setErrors((prev) => ({
        ...prev,
        guardianName: "",
        guardianEmail: "",
        guardianPhone: "",
      }))
    } else {
      setErrors((prev) => ({
        ...prev,
        studentId: "",
        firstName: "",
        lastName: "",
        class: "",
        section: "",
        dob: "",
        email: "",
        phone: "",
        address: "",
        expectedGraduation: "",
        emergencyContact:""
      }))
    }
  }, [currentStep])

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
        guardianName: studentData.guardian.guardianName || "",
        guardianEmail: studentData.guardian.guardianEmail || "",
        guardianPhone: studentData.guardian.guardianPhone || "",
        guardianPhoto: "no",
        guardianRelation: studentData.guardian.guardianRelation,
        guardianProfession: studentData.guardian.guardianProfession,
        transcripts: [], // Add this line
        iipFlag: studentData.iipFlag || false, // Add this line
        honorRolls: studentData.honorRolls || false, // Add this line
        athletics: studentData.athletics || false, // Add this line
        clubs: studentData.clubs || "", // Add this line
        lunch: studentData.lunch || "", // Add this line
        nationality: studentData.nationality || "", // Add this line
        emergencyContact: studentData.emergencyContact || "N/A"
      })
    }
  }, [studentData])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (name: string, value: string | boolean) => {
    setFormData({ ...formData, [name]: value })

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }
  useEffect(() => {
    console.log("student", studentData)
  }, [studentData])

  const handleStudentPhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFormData({ ...formData, profilePhoto: file })

      const reader = new FileReader()
      reader.onload = (event) => {
        setStudentPhotoPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGuardianPhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFormData({ ...formData, guardianPhoto: file })

      const reader = new FileReader()
      reader.onload = (event) => {
        setGuardianPhotoPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleTranscriptChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setFormData((prev) => ({
        ...prev,
        transcripts: [...prev.transcripts, ...newFiles],
      }))

      // Update previews
      const newPreviews = newFiles.map((file) => ({
        name: file.name,
        size: file.size,
      }))

      setTranscriptPreviews((prev) => [...prev, ...newPreviews])
    }
  }

  const removeTranscript = (index: number) => {
    setFormData((prev) => {
      const updatedTranscripts = [...prev.transcripts]
      updatedTranscripts.splice(index, 1)
      return {
        ...prev,
        transcripts: updatedTranscripts,
      }
    })

    setTranscriptPreviews((prev) => {
      const updatedPreviews = [...prev]
      updatedPreviews.splice(index, 1)
      return updatedPreviews
    })
  }

  const validateStudentForm = () => {
    const newErrors = { ...errors }
    let isValid = true

    // if (!formData.studentId) {
    //   newErrors.studentId = "Roll number is required"
    //   isValid = false
    // }

    if (!formData.firstName) {
      newErrors.firstName = "First name is required"
      isValid = false
    }

    if (!formData.lastName) {
      newErrors.lastName = "Last name is required"
      isValid = false
    }

    if (!formData.class) {
      newErrors.class = "Class is required"
      isValid = false
    }

    if (!formData.section) {
      newErrors.section = "Section is required"
      isValid = false
    }

    if (!formData.dob) {
      newErrors.dob = "Date of birth is required"
      isValid = false
    }

    if (!formData.email) {
      newErrors.email = "Email is required"
      isValid = false
    }
    if (!formData.emergencyContact) {
      newErrors.emergencyContact = "Emergency Contact is required"
      isValid = false
    }
   
    if(!formData.phone){
      formData.phone = "N/A"
    }

    

    if (!formData.address) {
      newErrors.address = "Address is required"
      isValid = false
    }

    if (!formData.expectedGraduation) {
      newErrors.expectedGraduation = "Expected graduation year is required"
      isValid = false
    }

    setErrors(newErrors)

    if (!isValid) {
      toast.error("Please fill all required fields correctly", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    }

    return isValid
  }

  const validateGuardianForm = () => {
    const newErrors = { ...errors }
    let isValid = true

    if (!formData.guardianName) {
      newErrors.guardianName = "Guardian name is required"
      isValid = false
    }

    if(!formData.emergencyContact){
      newErrors.emergencyContact = "Emergency Contact required"
      isValid = false
    }

    if (!formData.guardianEmail) {
      newErrors.guardianEmail = "Guardian email is required"
      isValid = false
    } else if (!/^\S+@\S+\.\S+$/.test(formData.guardianEmail)) {
      newErrors.guardianEmail = "Invalid email format"
      isValid = false
    }

    if (!formData.guardianPhone) {
      formData.guardianPhone = "N/A"
      // newErrors.guardianPhone = "Guardian phone number is required"
      // isValid = false
    } 

    setErrors(newErrors)

    if (!isValid) {
      toast.error("Please fill all required guardian fields correctly", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    }

    return isValid
  }
  function generateCode(): string {
    let length = 10
  const timestamp = Date.now().toString(); // e.g., '1718542400000'
  const random = Math.floor(Math.random() * 1000000).toString(); // 6-digit random number

  // Combine timestamp and random, then trim or pad to the desired length
  const combined = timestamp + random;

  // Ensure fixed length by slicing from the end (more randomness)
  return combined.slice(-length);
}


  const handleContinueToGuardian = () => {
    if (validateStudentForm()) {
      setCurrentStep("guardian")
    }
  }

  const handleBackToStudent = () => {
    setCurrentStep("student")
  }

  const handleSubmit = async () => {
  if (!validateGuardianForm()) {
    return
  }

  setIsSubmitting(true)

  try {
    let apiData
    let profilePhotoUrl = null
    let guardianPhotoUrl = null
    let transcriptsUrls = []

    // Upload profile photo if exists
    if (formData.profilePhoto instanceof File) {
      const uploadResponse = await uploadImageToAWS(formData.profilePhoto, (progress) => {
        console.log(`Uploading profile photo: ${progress}%`)
      })
      profilePhotoUrl = uploadResponse.awsUrl
    }

    // Upload guardian photo if exists
    if (formData.guardianPhoto instanceof File) {
      const uploadResponse = await uploadImageToAWS(formData.guardianPhoto, (progress) => {
        console.log(`Uploading guardian photo: ${progress}%`)
      })
      guardianPhotoUrl = uploadResponse.awsUrl
    }

    // Upload transcripts if they exist
    if (formData.transcripts.length > 0) {
      for (const transcript of formData.transcripts) {
        const uploadResponse = await uploadImageToAWS(transcript, (progress) => {
          console.log(`Uploading transcript ${transcript.name}: ${progress}%`)
        })
        transcriptsUrls.push(uploadResponse.awsUrl)
      }
    }

    if (studentData) {
    
      apiData = {
        studentId: formData.studentId,
        firstName: formData.firstName || "",
        lastName: formData.lastName || "",
        class: formData.class || "",
        section: formData.section || "",
        gender: formData.gender || "",
        dob: formData.dob || "",
        email: formData.email || "",
        phone: formData.phone || "",
        address: formData.address || "",
        enrollDate: formData.enrollDate || "",
        expectedGraduation: formData.expectedGraduation || "",
        profilePhoto: profilePhotoUrl || studentData.profilePhoto || "no",
        guardianName: formData.guardianName || "",
        guardianEmail: formData.guardianEmail || "",
        guardianPhone: formData.guardianPhone || "",
        guardianPhoto: guardianPhotoUrl || studentData.guardian?.guardianPhoto || "no",
        guardianRelation: formData.guardianRelation || "",
        guardianProfession: formData.guardianProfession || "",
        iipFlag: formData.iipFlag || false,
        honorRolls: Boolean(formData.honorRolls),
        athletics: Boolean(formData.athletics),
        clubs: formData.clubs || "",
        lunch: formData.lunch || "",
        nationality: formData.nationality || "",
        transcripts: transcriptsUrls.length > 0 ? transcriptsUrls.join(',') : studentData.transcripts || "no",
        emergencyContact: formData.emergencyContact || "N/A",
      }

      console.log("api data", apiData)
      const response = await axios.put(`${process.env.NEXT_PUBLIC_SRS_SERVER}/student/${studentData._id}`, apiData)
      if (response.data.status == 409) {
        toast.error(response.data.msg)
      } else {
        toast.success("Student updated successfully", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })
        await handleDone()   
        const message = activities.admin.updateStudent.description.replace('{studentName}', apiData.firstName);
        
        const activity = { 
          title: activities.admin.updateStudent.action, 
          subtitle: message, 
          performBy: "Admin"
        }; 
        const act = await addActivity(activity);  
        console.log('activity', act);
         
        resetForm()
        onClose()
      }
    } else {
      apiData = {
        studentId: generateCode(),
        firstName: formData.firstName || "",
        lastName: formData.lastName || "",
        class: formData.class || "",
        section: formData.section || "",
        gender: formData.gender || "",
        dob: formData.dob || "",
        email: formData.email || "",
        phone: formData.phone || "",
        address: formData.address || "",
        enrollDate: formData.enrollDate || "",
        expectedGraduation: formData.expectedGraduation || "",
        profilePhoto: profilePhotoUrl || "no",
        guardianName: formData.guardianName || "",
        guardianEmail: formData.guardianEmail || "",
        guardianPhone: formData.guardianPhone || "",
        guardianPhoto: guardianPhotoUrl || "no",
        guardianRelation: formData.guardianRelation || "",
        guardianProfession: formData.guardianProfession || "",
        iipFlag: formData.iipFlag || false,
        honorRolls: Boolean(formData.honorRolls),
        athletics: Boolean(formData.athletics),
        clubs: formData.clubs || "",
        lunch: formData.lunch || "",
        nationality: formData.nationality || "",
        transcripts: transcriptsUrls.length > 0 ? transcriptsUrls.join(',') : "no",
        emergencyContact: formData.emergencyContact || "N/A",
      }

      console.log("AddingData", apiData)
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SRS_SERVER}/student/add`, apiData)
      console.log("response", response)
      if (response.data.status == 409) {
        toast.error(response.data.msg)
      } else {
        toast.success("Student added successfully", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        })
        await handleDone()   
        const message = activities.admin.updateStudent.description.replace('{studentName}', apiData.firstName);
        const activity = { 
          title: activities.admin.addStudent.action, 
          subtitle: message, 
          performBy: "Admin"
        }; 
        const act = await addActivity(activity);  
        console.log('activity', act);
         
        resetForm()
        onClose()
      }
    }
  } catch (error) {
    console.error("Error in form submission:", error)
    if (error.response && error.response.status === 409) {
      toast.error("This Email is Already Registered", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    } else {
      toast.error("An error occurred while submitting the form", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    }
  } finally {
    setIsSubmitting(false)
  }
}

  const resetForm = () => {
    setCurrentStep("student")
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
      guardianName: "",
      guardianEmail: "",
      guardianPhone: "",
      guardianPhoto: null,
      guardianRelation: "",
      guardianProfession: "",
      transcripts: [], // Add this line
      iipFlag: false, // Add this line
      honorRolls: false, // Add this line
      athletics: false, // Add this line
      clubs: "", // Add this line
      lunch: "", // Add this line
      nationality: "", // Add this line
      emergencyContact: ""
    })
    setStudentPhotoPreview(null)
    setGuardianPhotoPreview(null)
    setTranscriptPreviews([]) // Add this line
    setErrors({
      studentId: "",
      firstName: "",
      lastName: "",
      class: "",
      section: "",
      dob: "",
      email: "",
      phone: "",
      address: "",
      expectedGraduation: "",
      guardianName: "",
      guardianEmail: "",
      guardianPhone: "",
      guardianRelation: "",
      guardianProfession: "",
      iipFlag: false, // Add this line
      clubs: "", // Add this line
      lunch: "", // Add this line
      nationality: "", // Add this line
      emergencyContact: ""
    })
  }

  const handleCloseRequest = (open: boolean) => {
    if (!isSubmitting && !open) {
      onClose()
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleCloseRequest}>
        <DialogContent className="max-w-[95vw] sm:max-w-[80vw] md:max-w-[70vw] lg:max-w-5xl p-0">
          <div className="custom-scrollbar max-h-[80vh] overflow-y-auto">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>
                {studentData ? "Edit " : "Add "}
                {currentStep === "student" ? "Student Information" : "Guardian Information"}
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
                <div className="w-1/2 flex-shrink-0">
                  <StudentForm
                    formData={formData}
                    errors={errors}
                    photoPreview={studentPhotoPreview}
                    onInputChange={handleInputChange}
                    onSelectChange={handleSelectChange}
                    onPhotoChange={handleStudentPhotoChange}
                    onContinue={handleContinueToGuardian}
                    onCancel={onClose}
                    disabled={isSubmitting}
                    isEditing={!!studentData}
                    transcriptPreviews={transcriptPreviews} // Add this line
                    onTranscriptChange={handleTranscriptChange} // Add this line
                    onRemoveTranscript={removeTranscript} // Add this line
                  />
                </div>
                <div className="w-1/2 flex-shrink-0">
                  <GuardianForm
                    formData={formData}
                    errors={errors}
                    photoPreview={guardianPhotoPreview}
                    onInputChange={handleInputChange}
                    onPhotoChange={handleGuardianPhotoChange}
                    onSubmit={handleSubmit}
                    onBack={handleBackToStudent}
                    isSubmitting={isSubmitting}
                    disabled={isSubmitting}
                    isEditing={!!studentData}
                  />
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
    </>
  )
}

