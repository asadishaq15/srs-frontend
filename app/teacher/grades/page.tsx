// "use client"

// import * as React from "react"
// import { Plus, Save, HelpCircle, FileText, PlusCircle, Loader2 } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { toast } from "react-toastify" 
// import { activities } from "@/lib/activities"
// import { WeightageModal } from "./weightage-modal"
// import {  getLocalStorageValue } from "@/lib/utils"

// const studentsData = [
//   { name: "Alice Johnson", id: "10A001", quiz1: 85, midterm: 78, project: 92, final: 88 },
//   { name: "Bob Smith", id: "10A002", quiz1: 72, midterm: 80, project: 85, final: 79 },
//   { name: "Charlie Brown", id: "10A003", quiz1: 90, midterm: 85, project: 88, final: 91 },
//   { name: "Diana Prince", id: "10A004", quiz1: 95, midterm: 92, project: 97, final: 94 },
//   { name: "Ethan Hunt", id: "10A005", quiz1: 78, midterm: 75, project: 80, final: 82 },
// ]

// export default function GradesPage() {
//   const [selectedClass, setSelectedClass] = React.useState("")
//   const [grades, setGrades] = React.useState(studentsData)
//   const [showTable, setShowTable] = React.useState(false)
//   const selectedTeacher = getLocalStorageValue("id")

//   // New state variables
//   const [loading, setLoading] = React.useState(true)
//   const [error, setError] = React.useState("")
//   const [courses, setCourses] = React.useState([])
//   const [teachers, setTeachers] = React.useState([])
//   const [sections, setSections] = React.useState([
//     "none",
//     "A",
//     "B",
//     "C",
//     "D",
//     "E",
//     "F",
//     "G",
//     "H",
//     "I",
//     "J",
//     "K",
//     "L",
//     "M",
//     "N",
//     "O",
//     "P",
//     "Q",
//     "R",
//     "S",
//     "T",
//     "U",
//     "V",
//     "W",
//     "X",
//     "Y",
//     "Z",
//   ])

//   // const [selectedTeacher, setSelectedTeacher] = React.useState("")
//   const [selectedSection, setSelectedSection] = React.useState("")
//   const [roomNumber, setRoomNumber] = React.useState("")
//   const [selectedCourse, setSelectedCourse] = React.useState("")

//   const [students, setStudents] = React.useState([])
//   const [isCreatingGrades, setIsCreatingGrades] = React.useState(false)
//   const [isFetchingStudents, setIsFetchingStudents] = React.useState(false)
//   const [isSavingGrades, setIsSavingGrades] = React.useState(false)
//   const [isLoadingGrades, setIsLoadingGrades] = React.useState(false)
//   const [fetchedGrades, setFetchedGrades] = React.useState([])
//   const [modifiedStudentIds, setModifiedStudentIds] = React.useState(new Set())

//   const [isWeightageModalOpen, setIsWeightageModalOpen] = React.useState(false)
//   const [currentWeightages, setCurrentWeightages] = React.useState({
//     quiz: 25,
//     midTerm: 25,
//     project: 25,
//     finalTerm: 25,
//   })
 
//   // Fetch data on component mount
//   React.useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [coursesResponse, teachersResponse] = await Promise.all([
//           // fetch(`${process.env.NEXT_PUBLIC_SRS_SERVER}/teachers/get/assignedCourses?teacherId=${selectedTeacher}`),
//           fetch(`${process.env.NEXT_PUBLIC_SRS_SERVER}/course`),
//           fetch(`${process.env.NEXT_PUBLIC_SRS_SERVER}/teachers`),
//         ])

//         if (!coursesResponse.ok || !teachersResponse.ok) {
//           throw new Error("Failed to fetch data")
//         }

//         const coursesData = await coursesResponse.json()
//         const teachersData = await teachersResponse.json()

//         setCourses(coursesData) 
//         console.log('data',teachersData)
//         setTeachers(teachersData.data || [])
//       } catch (err) {
//         setError("Failed to load data")
//         console.error("Error fetching data:", err)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchData()
//   }, [])
 

//   const handleGradeChange = (studentId: string, assessment: string, value: string) => {
//     // Track which student's grades have been modified
//     setModifiedStudentIds((prev) => new Set(prev).add(studentId))

//     // Convert empty string to 0, otherwise parse the number
//     const numericValue = value === "" ? 0 : Number(value)

//     setGrades(
//       grades.map((student) =>
//         student.id === studentId ? { ...student, [assessment]: value === "" ? "" : numericValue } : student,
//       ),
//     )
//   }

//   const calculateOverallGrade = (student: any) => {
//     const quiz = student.quiz1 === "" ? 0 : Number(student.quiz1)
//     const midterm = student.midterm === "" ? 0 : Number(student.midterm)
//     const project = student.project === "" ? 0 : Number(student.project)
//     const final = student.final === "" ? 0 : Number(student.final)

//     const total =
//       (quiz * currentWeightages.quiz) / 100 +
//       (midterm * currentWeightages.midTerm) / 100 +
//       (project * currentWeightages.project) / 100 +
//       (final * currentWeightages.finalTerm) / 100

//     return Math.round(total * 10) / 10 // rounding to 1 decimal place
//   }

//   const handleLoadGrading = async () => {
//     if (!selectedSection || !roomNumber || !selectedCourse) {
//       setError("Please fill in all fields")
//       return
//     }

//     setError("")
//     setIsLoadingGrades(true)

//     try {
//       // Call the API to get existing grades
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_SRS_SERVER}/grade/getStudentGrades?class=${roomNumber}&section=${selectedSection}&courseId=${selectedCourse}&teacherId=${selectedTeacher}`,
//       )
//       if (!response.ok) {
//         throw new Error("Failed to load grades")
//       }

//       const gradesData = await response.json()
//       console.log(gradesData)

//       if (!gradesData || gradesData.length === 0) {
//         toast.info("No existing grades were found for the selected criteria")
//         setShowTable(false)
//         return
//       }

//       // Store the original fetched grades
//       setFetchedGrades(gradesData)

//       // Set the weightages from the first grade record
//       if (gradesData.length > 0) {
//         setCurrentWeightages({
//           quiz: gradesData[0].quiz.weightage,
//           midTerm: gradesData[0].midTerm.weightage,
//           project: gradesData[0].project.weightage,
//           finalTerm: gradesData[0].finalTerm.weightage,
//         })
//       }

//       // Format the grades for display in the table
//       const formattedGrades = gradesData.map((grade) => ({
//         name: `${grade.studentId.firstName} ${grade.studentId.lastName}`,
//         id: grade.studentId.studentId,
//         _id: grade.studentId._id,
//         gradeId: grade._id,
//         quiz1: grade.quiz.score,
//         midterm: grade.midTerm.score,
//         project: grade.project.score,
//         final: grade.finalTerm.score,
//       }))

//       setGrades(formattedGrades)
//       setShowTable(true)

//       // Reset modified students tracking
//       setModifiedStudentIds(new Set())

//       toast.success(`Loaded grades for ${formattedGrades.length} student(s)`)
//     } catch (err) {
//       setError(`Error: ${err.message}`)
//       console.error("Error loading grades:", err)
//       toast.error(`Failed to load grades: ${err.message}`)
//     } finally {
//       setIsLoadingGrades(false)
//     }
//   }

//   const handleCreateGrading = async () => {
//     if ( !selectedSection || !roomNumber || !selectedCourse) {
//       setError("Please fill in all fields")
//       return
//     }

//     setError("")
//     setIsCreatingGrades(true)
//     setIsFetchingStudents(true)

//     try {
//       const response = await fetch(`${process.env.NEXT_PUBLIC_SRS_SERVER}/student?className=${roomNumber}`)
//       if (!response.ok) {
//         throw new Error("Failed to fetch students")
//       }

//       const studentData = await response.json()

//       setStudents(studentData.data || [])
//       if (studentData.data.length === 0) {
//         toast.error("No Students Found In this Room")
//         return
//       }
//       // Prepare grades data
//       const gradesData = {
//         grades: studentData.data.map((student) => ({
//           teacherId: selectedTeacher,
//           courseId: selectedCourse,
//           studentId: student._id,
//           class: roomNumber,
//           section: selectedSection,
//           quiz: {
//             score: 0,
//             weightage: currentWeightages.quiz,
//           },
//           midTerm: {
//             score: 0,
//             weightage: currentWeightages.midTerm,
//           },
//           project: {
//             score: 0,
//             weightage: currentWeightages.project,
//           },
//           finalTerm: {
//             score: 0,
//             weightage: currentWeightages.finalTerm,
//           },
//           overAll: 0,
//         })),
//       }

//       const createResponse = await fetch(`${process.env.NEXT_PUBLIC_SRS_SERVER}/grade/createGrade`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(gradesData),
//       })

//       if (!createResponse.ok) {
//         throw new Error("Unable to Create Grades")
//       }

//       const createdGrades = await createResponse.json()
//       setFetchedGrades(createdGrades || [])

//       // Show the grades table with the fetched students
//       setShowTable(true)

//       const formattedGrades = studentData.data.map((student) => ({
//         name: `${student.firstName} ${student.lastName}`,
//         id: student.studentId,
//         _id: student._id,
//         gradeId: createdGrades.find((g) => g.studentId._id === student._id)?._id || "",
//         quiz1: 0,
//         midterm: 0,
//         project: 0,
//         final: 0,
//       }))

//       setGrades(formattedGrades)
//       setModifiedStudentIds(new Set())

//       toast.success(`Created grades for ${formattedGrades.length} student(s)`)
//     } catch (err: any) {
//       setError(`You cannot grade it again.`)
//       console.error("Error creating grades:", err)
//       if (err?.response?.status === 400) {
//         toast.error("Grading for this Grade Level already exists")
//       } else {
//         toast.error("Unable to create Grades")
//       }
//     } finally {
//       setIsCreatingGrades(false)
//       setIsFetchingStudents(false)
//     }
//   } 
//   const addActivity = async (activity: any) => { 
//     try {
//       const response = await fetch(`${process.env.NEXT_PUBLIC_SRS_SERVER}/activity/add`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(activity),
//       })
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`)
//       } 
//       const data = await response.json()
//       return data
//     } catch (error) {
//       console.error("Could not add activity:", error)
//       throw error
//     }
//   }

//   const handleSaveWeightages = (newWeightages: {
//     quiz: number
//     midTerm: number
//     project: number
//     finalTerm: number
//   }) => {
//     setCurrentWeightages(newWeightages)

//     if (fetchedGrades.length > 0) {
//       // Mark all students as modified to update all of them when weightages change
//       const allStudentIds = new Set(grades.map((student) => student.id))
    
//       handleSaveGrades(newWeightages , allStudentIds)
//     }
//   }

//   const handleSaveGrades = async (newWeightages : any , allStudentIds?: any) => {
//     if (modifiedStudentIds.size === 0 && !newWeightages) {
//       toast.info("No grades have been modified")
//       return
//     }

//     setIsSavingGrades(true)
//     setError("")

//     try {
//       // Ensure we're using the correct weightages
//       const weightagesForUpdate = newWeightages || currentWeightages
//       const checkIdS = allStudentIds ? allStudentIds : modifiedStudentIds;
//       const modifiedGrades = grades 
//         .filter((student) =>   checkIdS.has(student.id)) // Only include students whose IDs are in modifiedStudentIds
//         .map((student) => {
//           const gradeRecord = fetchedGrades.find(
//             (g) => g.studentId === student._id || (g.studentId && g.studentId._id === student._id),
//           )
//           if (!gradeRecord) {
//             console.error("Could not find grade record for student:", student)
//             return null
//           }

//           const overall = calculateOverallGrade(student)

//           return {
//             _id: student.gradeId || gradeRecord._id,
//             teacherId: selectedTeacher,
//             courseId: selectedCourse,
//             studentId: gradeRecord.studentId,
//             class: roomNumber,
//             section: selectedSection,
//             quiz: {
//               score: typeof student.quiz1 === "string" && student.quiz1 === "" ? 0 : Number(student.quiz1),
//               weightage: weightagesForUpdate.quiz,
//             },
//             midTerm: {
//               score: typeof student.midterm === "string" && student.midterm === "" ? 0 : Number(student.midterm),
//               weightage: weightagesForUpdate.midTerm,
//             },
//             project: {
//               score: typeof student.project === "string" && student.project === "" ? 0 : Number(student.project),
//               weightage: weightagesForUpdate.project,
//             },
//             finalTerm: {
//               score: typeof student.final === "string" && student.final === "" ? 0 : Number(student.final),
//               weightage: weightagesForUpdate.finalTerm,
//             },
//             overAll: overall,
//             __v: gradeRecord.__v || 0,
//             createdAt: gradeRecord.createdAt,
//             updatedAt: new Date().toISOString(),
//           }
//         })
//         .filter(Boolean)
//       console.log("updated", modifiedGrades)

//       const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_SRS_SERVER}/grade/update`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(modifiedGrades),
//       })

//       if (!updateResponse.ok) {
//         throw new Error("Failed to update grades")
//       }

//       toast.success(`Updated grades for ${modifiedGrades.length} student(s)`)
//       const message = activities.teacher.gradeUpdate.description
//       .replace("{className}", roomNumber)

//     const activity = {
//       title: activities.teacher.gradeUpdate.action,
//       subtitle: message,
//       performBy: "Teacher",
//     }

//     await addActivity(activity)
//       setModifiedStudentIds(new Set())
//     } catch (err) {
//       setError(`Error: ${err.message}`)
//       console.error("Error updating grades:", err)
//       toast.error(`Failed to save grades: ${err.message}`)
//     } finally {
//       setIsSavingGrades(false)
//     }
//   }

//   return (
//     <div className="p-6 space-y-6">
//       <h1 className="text-3xl font-bold tracking-tight">Grade Management</h1>

//       {loading ? (
//         <div className="flex items-center justify-center h-64">
//           <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
//           <span className="ml-2 text-lg text-gray-500">Loading...</span>
//         </div>
//       ) : (
//         <>
//           <Card className="shadow-md">
//             <CardHeader>
//               <CardTitle>Grading Configuration</CardTitle>
//               <CardDescription>Select teacher, section, and grade level to manage grades</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* <div className="space-y-2">
//                   <Label htmlFor="teacher-select">Teacher</Label>
//                   <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
//                     <SelectTrigger id="teacher-select">
//                       <SelectValue placeholder="Select a teacher" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {teachers.map((teacher) => (
//                         <SelectItem key={teacher._id} value={teacher._id}>
//                           {`${teacher.firstName} ${teacher.lastName}`}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div> */}
//                 <div className="space-y-2">
//                   <Label htmlFor="course-select">Course</Label>
//                   <Select value={selectedCourse} onValueChange={setSelectedCourse}>
//                     <SelectTrigger id="course-select">
//                       <SelectValue placeholder="Select a course" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {courses.map((course) => (
//                         <SelectItem key={course._id} value={course._id}>
//                           {course.courseName}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="section-select">Section</Label>
//                   <Select value={selectedSection} onValueChange={setSelectedSection}>
//                     <SelectTrigger id="section-select">
//                       <SelectValue placeholder="Select a section" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {sections.map((section) => (
//                         <SelectItem key={section} value={section}>
//                           {section}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="room-number">Grade Level</Label>
//                   <Input
//                     type="text"
//                     id="room-number"
//                     placeholder="Enter Grade Level"
//                     value={roomNumber}
//                     onChange={(e) => setRoomNumber(e.target.value)}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="section-select">Term</Label>
//                   <Select value={selectedSection} onValueChange={setSelectedSection}>
//                     <SelectTrigger id="section-select">
//                       <SelectValue placeholder="Select a section" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {sections.map((section) => (
//                         <SelectItem key={section} value={section}>
//                           {section}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               {error && <p className="text-red-500 mt-4">{error}</p>}

//               <div className="mt-6 flex gap-4">
//                 <Button
//                   variant="outline"
//                   onClick={handleLoadGrading}
//                   disabled={isCreatingGrades || isSavingGrades || isLoadingGrades}
//                 >
//                   {isLoadingGrades ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       Loading...
//                     </>
//                   ) : (
//                     <>
//                       <FileText className="mr-2 h-4 w-4" />
//                       Load Grading
//                     </>
//                   )}
//                 </Button>
//                 <Button onClick={handleCreateGrading} disabled={isCreatingGrades || isSavingGrades || isLoadingGrades}>
//                   {isCreatingGrades ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       Creating...
//                     </>
//                   ) : (
//                     <>
//                       <PlusCircle className="mr-2 h-4 w-4" />
//                       Create Grading
//                     </>
//                   )}
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>

//           {showTable ? (
//             <Card className="shadow-lg">
//               <CardHeader>
//                 <CardTitle>Grade Entry</CardTitle>
//                 <CardDescription>Enter or update student grades</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead className="w-[200px]">Student</TableHead>
//                       <TableHead>ID</TableHead>
//                       <TooltipProvider>
//                         <Tooltip>
//                           <TooltipTrigger asChild>
//                             <TableHead>
//                               Quiz 1 ({currentWeightages.quiz}%) <HelpCircle className="inline-block w-4 h-4 ml-1" />
//                             </TableHead>
//                           </TooltipTrigger>
//                           <TooltipContent>
//                             <p>First quiz of the semester, worth {currentWeightages.quiz}% of the total grade</p>
//                           </TooltipContent>
//                         </Tooltip>
//                       </TooltipProvider>
//                       <TooltipProvider>
//                         <Tooltip>
//                           <TooltipTrigger asChild>
//                             <TableHead>
//                               Midterm ({currentWeightages.midTerm}%){" "}
//                               <HelpCircle className="inline-block w-4 h-4 ml-1" />
//                             </TableHead>
//                           </TooltipTrigger>
//                           <TooltipContent>
//                             <p>Midterm exam, worth {currentWeightages.midTerm}% of the total grade</p>
//                           </TooltipContent>
//                         </Tooltip>
//                       </TooltipProvider>
//                       <TooltipProvider>
//                         <Tooltip>
//                           <TooltipTrigger asChild>
//                             <TableHead>
//                               Project ({currentWeightages.project}%){" "}
//                               <HelpCircle className="inline-block w-4 h-4 ml-1" />
//                             </TableHead>
//                           </TooltipTrigger>
//                           <TooltipContent>
//                             <p>Semester-long project, worth {currentWeightages.project}% of the total grade</p>
//                           </TooltipContent>
//                         </Tooltip>
//                       </TooltipProvider>
//                       <TooltipProvider>
//                         <Tooltip>
//                           <TooltipTrigger asChild>
//                             <TableHead>
//                               Final Exam ({currentWeightages.finalTerm}%){" "}
//                               <HelpCircle className="inline-block w-4 h-4 ml-1" />
//                             </TableHead>
//                           </TooltipTrigger>
//                           <TooltipContent>
//                             <p>Final examination, worth {currentWeightages.finalTerm}% of the total grade</p>
//                           </TooltipContent>
//                         </Tooltip>
//                       </TooltipProvider>
//                       <TableHead>Overall Grade</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {grades.map((student) => (
//                       <TableRow key={student.id} className={modifiedStudentIds.has(student.id) ? "bg-muted/50" : ""}>
//                         <TableCell className="font-medium">{student.name}</TableCell>
//                         <TableCell>{student.id}</TableCell>
//                         <TableCell>
//                           <Input
//                             type="text"
//                             inputMode="numeric"
//                             value={student.quiz1 === 0 && !String(student.quiz1).includes(".") ? "" : student.quiz1}
//                             onChange={(e) => handleGradeChange(student.id, "quiz1", e.target.value)}
//                             className="w-16"
//                             min="0"
//                             max="100"
//                           />
//                         </TableCell>
//                         <TableCell>
//                           <Input
//                             type="text"
//                             inputMode="numeric"
//                             value={
//                               student.midterm === 0 && !String(student.midterm).includes(".") ? "" : student.midterm
//                             }
//                             onChange={(e) => handleGradeChange(student.id, "midterm", e.target.value)}
//                             className="w-16"
//                             min="0"
//                             max="100"
//                           />
//                         </TableCell>
//                         <TableCell>
//                           <Input
//                             type="text"
//                             inputMode="numeric"
//                             value={
//                               student.project === 0 && !String(student.project).includes(".") ? "" : student.project
//                             }
//                             onChange={(e) => handleGradeChange(student.id, "project", e.target.value)}
//                             className="w-16"
//                             min="0"
//                             max="100"
//                           />
//                         </TableCell>
//                         <TableCell>
//                           <Input
//                             type="text"
//                             inputMode="numeric"
//                             value={student.final === 0 && !String(student.final).includes(".") ? "" : student.final}
//                             onChange={(e) => handleGradeChange(student.id, "final", e.target.value)}
//                             className="w-16"
//                             min="0"
//                             max="100"
//                           />
//                         </TableCell>
//                         <TableCell className="font-bold">{calculateOverallGrade(student)}</TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//                 <div className="mt-6 flex justify-between">
//                   <div>
//                     <Button variant="outline" onClick={() => setIsWeightageModalOpen(true)} className="mr-2">
//                       Edit Weightages
//                     </Button>
//                   </div>
//                   <Button
//                     onClick={() => handleSaveGrades(currentWeightages)}
//                     disabled={isSavingGrades || modifiedStudentIds.size === 0}
//                   >
//                     {isSavingGrades ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         Saving...
//                       </>
//                     ) : (
//                       <>
//                         <Save className="mr-2 h-4 w-4" />
//                         Save Grades {modifiedStudentIds.size > 0 && `(${modifiedStudentIds.size})`}
//                       </>
//                     )}
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           ) : (
//             <Card className="shadow-md p-10">
//               <div className="text-center py-8">
//                 <h3 className="text-xl font-medium text-gray-700 mb-2">Grades will be displayed here</h3>
//                 <p className="text-gray-500">
//                   Select a teacher, section, and grade level, then click "Load Grading" or "Create Grading"
//                 </p>
//               </div>
//             </Card>
//           )}
//         </>
//       )}
//       {/* Weightage Modal */}
//       <WeightageModal
//         isOpen={isWeightageModalOpen}
//         onClose={() => setIsWeightageModalOpen(false)}
//         weightages={currentWeightages}
//         onSave={handleSaveWeightages}
//       />
//     </div>
//   )
// }


"use client"

import * as React from "react"
import { Save, HelpCircle, FileText, PlusCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "react-toastify"
import { activities } from "@/lib/activities"
import { WeightageModal } from "./weightage-modal"
import { getLocalStorageValue } from "@/lib/utils"

const studentsData = [
  { name: "Alice Johnson", id: "10A001", quiz1: 85, midterm: 78, project: 92, final: 88 },
  { name: "Bob Smith", id: "10A002", quiz1: 72, midterm: 80, project: 85, final: 79 },
  { name: "Charlie Brown", id: "10A003", quiz1: 90, midterm: 85, project: 88, final: 91 },
  { name: "Diana Prince", id: "10A004", quiz1: 95, midterm: 92, project: 97, final: 94 },
  { name: "Ethan Hunt", id: "10A005", quiz1: 78, midterm: 75, project: 80, final: 82 },
]

export default function GradesPage() {
  const [selectedClass, setSelectedClass] = React.useState("")
  const [grades, setGrades] = React.useState(studentsData)
  const [showTable, setShowTable] = React.useState(false)
  const selectedTeacher = getLocalStorageValue("id")

  // New state variables
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [courses, setCourses] = React.useState([])
  const [teachers, setTeachers] = React.useState([])
  const [sections, setSections] = React.useState([
    "none",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ])

  const [selectedTerm, setSelectedTerm] = React.useState("")

  const [terms] = React.useState(["1st Term", "2nd Term", "3rd Term"])

  // const [selectedTeacher, setSelectedTeacher] = React.useState("")
  const [selectedSection, setSelectedSection] = React.useState("")
  const [roomNumber, setRoomNumber] = React.useState("")
  const [selectedCourse, setSelectedCourse] = React.useState("")

  const [students, setStudents] = React.useState([])
  const [isCreatingGrades, setIsCreatingGrades] = React.useState(false)
  const [isFetchingStudents, setIsFetchingStudents] = React.useState(false)
  const [isSavingGrades, setIsSavingGrades] = React.useState(false)
  const [isLoadingGrades, setIsLoadingGrades] = React.useState(false)
  const [fetchedGrades, setFetchedGrades] = React.useState([])
  const [modifiedStudentIds, setModifiedStudentIds] = React.useState(new Set())

  const [isWeightageModalOpen, setIsWeightageModalOpen] = React.useState(false)
  const [currentWeightages, setCurrentWeightages] = React.useState({
    quiz: 25,
    midTerm: 25,
    project: 25,
    finalTerm: 25,
  })

  // Fetch data on component mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesResponse, teachersResponse] = await Promise.all([
          // fetch(`${process.env.NEXT_PUBLIC_SRS_SERVER}/teachers/get/assignedCourses?teacherId=${selectedTeacher}`),
          fetch(`${process.env.NEXT_PUBLIC_SRS_SERVER}/course`),
          fetch(`${process.env.NEXT_PUBLIC_SRS_SERVER}/teachers`),
        ])

        if (!coursesResponse.ok || !teachersResponse.ok) {
          throw new Error("Failed to fetch data")
        }

        const coursesData = await coursesResponse.json()
        const teachersData = await teachersResponse.json()

        setCourses(coursesData)
        console.log("data", teachersData)
        setTeachers(teachersData.data || [])
      } catch (err) {
        setError("Failed to load data")
        console.error("Error fetching data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleGradeChange = (studentId: string, assessment: string, value: string) => {
    // Track which student's grades have been modified
    setModifiedStudentIds((prev) => new Set(prev).add(studentId))

    // Convert empty string to 0, otherwise parse the number
    const numericValue = value === "" ? 0 : Number(value)

    setGrades(
      grades.map((student) =>
        student.id === studentId ? { ...student, [assessment]: value === "" ? "" : numericValue } : student,
      ),
    )
  }

  const calculateOverallGrade = (student: any) => {
    const quiz = student.quiz1 === "" ? 0 : Number(student.quiz1)
    const midterm = student.midterm === "" ? 0 : Number(student.midterm)
    const project = student.project === "" ? 0 : Number(student.project)
    const final = student.final === "" ? 0 : Number(student.final)

    const total =
      (quiz * currentWeightages.quiz) / 100 +
      (midterm * currentWeightages.midTerm) / 100 +
      (project * currentWeightages.project) / 100 +
      (final * currentWeightages.finalTerm) / 100

    return Math.round(total * 10) / 10 // rounding to 1 decimal place
  }

  const handleLoadGrading = async () => {
    if (!selectedSection || !roomNumber || !selectedCourse || !selectedTerm) {
      setError("Please fill in all fields")
      return
    }

    setError("")
    setIsLoadingGrades(true)

    try {
      // Call the API to get existing grades
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SRS_SERVER}/grade/getStudentGrades?class=${roomNumber}&section=${selectedSection}&courseId=${selectedCourse}&teacherId=${selectedTeacher}&term=${selectedTerm}`,
      )
      if (!response.ok) {
        throw new Error("Failed to load grades")
      }

      const gradesData = await response.json()
      console.log(gradesData)

      if (!gradesData || gradesData.length === 0) {
        toast.info("No existing grades were found for the selected criteria")
        setShowTable(false)
        return
      }

      // Store the original fetched grades
      setFetchedGrades(gradesData)

      // Set the weightages from the first grade record
      if (gradesData.length > 0) {
        setCurrentWeightages({
          quiz: gradesData[0].quiz.weightage,
          midTerm: gradesData[0].midTerm.weightage,
          project: gradesData[0].project.weightage,
          finalTerm: gradesData[0].finalTerm.weightage,
        })
      }

      // Format the grades for display in the table
      const formattedGrades = gradesData.map((grade) => ({
        name: `${grade.studentId.firstName} ${grade.studentId.lastName}`,
        id: grade.studentId.studentId,
        _id: grade.studentId._id,
        gradeId: grade._id,
        quiz1: grade.quiz.score,
        midterm: grade.midTerm.score,
        project: grade.project.score,
        final: grade.finalTerm.score,
      }))

      setGrades(formattedGrades)
      setShowTable(true)

      // Reset modified students tracking
      setModifiedStudentIds(new Set())

      toast.success(`Loaded grades for ${formattedGrades.length} student(s)`)
    } catch (err) {
      setError(`Error: ${err.message}`)
      console.error("Error loading grades:", err)
      toast.error(`Failed to load grades: ${err.message}`)
    } finally {
      setIsLoadingGrades(false)
    }
  }

  const handleCreateGrading = async () => {
    if (!selectedSection || !roomNumber || !selectedCourse || !selectedTerm) {
      setError("Please fill in all fields")
      return
    }

    setError("")
    setIsCreatingGrades(true)
    setIsFetchingStudents(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SRS_SERVER}/student?className=${roomNumber}`)
      if (!response.ok) {
        throw new Error("Failed to fetch students")
      }

      const studentData = await response.json()

      setStudents(studentData.data || [])
      if (studentData.data.length === 0) {
        toast.error("No Students Found In this Room")
        return
      }
      // Prepare grades data
      const gradesData = {
        grades: studentData.data.map((student) => ({
          teacherId: selectedTeacher,
          courseId: selectedCourse,
          studentId: student._id,
          class: roomNumber,
          section: selectedSection,
          term: selectedTerm,
          quiz: {
            score: 0,
            weightage: currentWeightages.quiz,
          },
          midTerm: {
            score: 0,
            weightage: currentWeightages.midTerm,
          },
          project: {
            score: 0,
            weightage: currentWeightages.project,
          },
          finalTerm: {
            score: 0,
            weightage: currentWeightages.finalTerm,
          },
          overAll: 0,
        })),
      }

      const createResponse = await fetch(`${process.env.NEXT_PUBLIC_SRS_SERVER}/grade/createGrade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(gradesData),
      })

      if (!createResponse.ok) {
        throw new Error("Unable to Create Grades")
      }

      const createdGrades = await createResponse.json()
      setFetchedGrades(createdGrades || [])

      // Show the grades table with the fetched students
      setShowTable(true)

      const formattedGrades = studentData.data.map((student) => ({
        name: `${student.firstName} ${student.lastName}`,
        id: student.studentId,
        _id: student._id,
        gradeId: createdGrades.find((g) => g.studentId._id === student._id)?._id || "",
        quiz1: 0,
        midterm: 0,
        project: 0,
        final: 0,
      }))

      setGrades(formattedGrades)
      setModifiedStudentIds(new Set())

      toast.success(`Created grades for ${formattedGrades.length} student(s)`)
    } catch (err: any) {
      setError(`You cannot grade it again.`)
      console.error("Error creating grades:", err)
      if (err?.response?.status === 400) {
        toast.error("Grading for this Grade Level already exists")
      } else {
        toast.error("Unable to create Grades")
      }
    } finally {
      setIsCreatingGrades(false)
      setIsFetchingStudents(false)
    }
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

  const handleSaveWeightages = (newWeightages: {
    quiz: number
    midTerm: number
    project: number
    finalTerm: number
  }) => {
    setCurrentWeightages(newWeightages)

    if (fetchedGrades.length > 0) {
      // Mark all students as modified to update all of them when weightages change
      const allStudentIds = new Set(grades.map((student) => student.id))

      handleSaveGrades(newWeightages, allStudentIds)
    }
  }

  const handleSaveGrades = async (newWeightages: any, allStudentIds?: any) => {
    if (modifiedStudentIds.size === 0 && !newWeightages) {
      toast.info("No grades have been modified")
      return
    }

    setIsSavingGrades(true)
    setError("")

    try {
      // Ensure we're using the correct weightages
      const weightagesForUpdate = newWeightages || currentWeightages
      const checkIdS = allStudentIds ? allStudentIds : modifiedStudentIds
      const modifiedGrades = grades
        .filter((student) => checkIdS.has(student.id)) // Only include students whose IDs are in modifiedStudentIds
        .map((student) => {
          const gradeRecord = fetchedGrades.find(
            (g) => g.studentId === student._id || (g.studentId && g.studentId._id === student._id),
          )
          if (!gradeRecord) {
            console.error("Could not find grade record for student:", student)
            return null
          }

          const overall = calculateOverallGrade(student)

          return {
            _id: student.gradeId || gradeRecord._id,
            teacherId: selectedTeacher,
            courseId: selectedCourse,
            studentId: gradeRecord.studentId,
            class: roomNumber,
            section: selectedSection,
            term: selectedTerm,
            quiz: {
              score: typeof student.quiz1 === "string" && student.quiz1 === "" ? 0 : Number(student.quiz1),
              weightage: weightagesForUpdate.quiz,
            },
            midTerm: {
              score: typeof student.midterm === "string" && student.midterm === "" ? 0 : Number(student.midterm),
              weightage: weightagesForUpdate.midTerm,
            },
            project: {
              score: typeof student.project === "string" && student.project === "" ? 0 : Number(student.project),
              weightage: weightagesForUpdate.project,
            },
            finalTerm: {
              score: typeof student.final === "string" && student.final === "" ? 0 : Number(student.final),
              weightage: weightagesForUpdate.finalTerm,
            },
            overAll: overall,
            __v: gradeRecord.__v || 0,
            createdAt: gradeRecord.createdAt,
            updatedAt: new Date().toISOString(),
          }
        })
        .filter(Boolean)
      console.log("updated", modifiedGrades)

      const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_SRS_SERVER}/grade/update`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(modifiedGrades),
      })

      if (!updateResponse.ok) {
        throw new Error("Failed to update grades")
      }

      toast.success(`Updated grades for ${modifiedGrades.length} student(s)`)
      const message = activities.teacher.gradeUpdate.description.replace("{className}", roomNumber)

      const activity = {
        title: activities.teacher.gradeUpdate.action,
        subtitle: message,
        performBy: "Teacher",
      }

      await addActivity(activity)
      setModifiedStudentIds(new Set())
    } catch (err) {
      setError(`Error: ${err.message}`)
      console.error("Error updating grades:", err)
      toast.error(`Failed to save grades: ${err.message}`)
    } finally {
      setIsSavingGrades(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Grade Management</h1>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-lg text-gray-500">Loading...</span>
        </div>
      ) : (
        <>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Grading Configuration</CardTitle>
              <CardDescription>Select teacher, section, and grade level to manage grades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* <div className="space-y-2">
                  <Label htmlFor="teacher-select">Teacher</Label>
                  <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                    <SelectTrigger id="teacher-select">
                      <SelectValue placeholder="Select a teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher._id} value={teacher._id}>
                          {`${teacher.firstName} ${teacher.lastName}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div> */}
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
                  <Label htmlFor="term-select">Term</Label>
                  <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                    <SelectTrigger id="term-select">
                      <SelectValue placeholder="Select a term" />
                    </SelectTrigger>
                    <SelectContent>
                      {terms.map((term) => (
                        <SelectItem key={term} value={term}>
                          {term}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error && <p className="text-red-500 mt-4">{error}</p>}

              <div className="mt-6 flex gap-4">
                <Button
                  variant="outline"
                  onClick={handleLoadGrading}
                  disabled={isCreatingGrades || isSavingGrades || isLoadingGrades}
                >
                  {isLoadingGrades ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Load Grading
                    </>
                  )}
                </Button>
                <Button onClick={handleCreateGrading} disabled={isCreatingGrades || isSavingGrades || isLoadingGrades}>
                  {isCreatingGrades ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Grading
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {showTable ? (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Grade Entry</CardTitle>
                <CardDescription>Enter or update student grades</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Student</TableHead>
                      <TableHead>ID</TableHead>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <TableHead>
                              Quiz 1 ({currentWeightages.quiz}%) <HelpCircle className="inline-block w-4 h-4 ml-1" />
                            </TableHead>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>First quiz of the semester, worth {currentWeightages.quiz}% of the total grade</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <TableHead>
                              Midterm ({currentWeightages.midTerm}%){" "}
                              <HelpCircle className="inline-block w-4 h-4 ml-1" />
                            </TableHead>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Midterm exam, worth {currentWeightages.midTerm}% of the total grade</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <TableHead>
                              Project ({currentWeightages.project}%){" "}
                              <HelpCircle className="inline-block w-4 h-4 ml-1" />
                            </TableHead>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Semester-long project, worth {currentWeightages.project}% of the total grade</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <TableHead>
                              Final Exam ({currentWeightages.finalTerm}%){" "}
                              <HelpCircle className="inline-block w-4 h-4 ml-1" />
                            </TableHead>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Final examination, worth {currentWeightages.finalTerm}% of the total grade</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TableHead>Overall Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grades.map((student) => (
                      <TableRow key={student.id} className={modifiedStudentIds.has(student.id) ? "bg-muted/50" : ""}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.id}</TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={student.quiz1 === 0 && !String(student.quiz1).includes(".") ? "" : student.quiz1}
                            onChange={(e) => handleGradeChange(student.id, "quiz1", e.target.value)}
                            className="w-16"
                            min="0"
                            max="100"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={
                              student.midterm === 0 && !String(student.midterm).includes(".") ? "" : student.midterm
                            }
                            onChange={(e) => handleGradeChange(student.id, "midterm", e.target.value)}
                            className="w-16"
                            min="0"
                            max="100"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={
                              student.project === 0 && !String(student.project).includes(".") ? "" : student.project
                            }
                            onChange={(e) => handleGradeChange(student.id, "project", e.target.value)}
                            className="w-16"
                            min="0"
                            max="100"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={student.final === 0 && !String(student.final).includes(".") ? "" : student.final}
                            onChange={(e) => handleGradeChange(student.id, "final", e.target.value)}
                            className="w-16"
                            min="0"
                            max="100"
                          />
                        </TableCell>
                        <TableCell className="font-bold">{calculateOverallGrade(student)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-6 flex justify-between">
                  <div>
                    <Button variant="outline" onClick={() => setIsWeightageModalOpen(true)} className="mr-2">
                      Edit Weightages
                    </Button>
                  </div>
                  <Button
                    onClick={() => handleSaveGrades(currentWeightages)}
                    disabled={isSavingGrades || modifiedStudentIds.size === 0}
                  >
                    {isSavingGrades ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Grades {modifiedStudentIds.size > 0 && `(${modifiedStudentIds.size})`}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-md p-10">
              <div className="text-center py-8">
                <h3 className="text-xl font-medium text-gray-700 mb-2">Grades will be displayed here</h3>
                <p className="text-gray-500">
                  Select a teacher, section, and grade level, then click "Load Grading" or "Create Grading"
                </p>
              </div>
            </Card>
          )}
        </>
      )}
      {/* Weightage Modal */}
      <WeightageModal
        isOpen={isWeightageModalOpen}
        onClose={() => setIsWeightageModalOpen(false)}
        weightages={currentWeightages}
        onSave={handleSaveWeightages}
      />
    </div>
  )
}
