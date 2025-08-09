"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Book, FileText, Presentation, Beaker, PenTool, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface GradeComponent {
  score: number
  weightage: number
}

interface GradeData {
  studentId: string
  courseId: string
  teacherId: string
  courseName: string
  quiz: GradeComponent
  midTerm: GradeComponent
  project: GradeComponent
  finalTerm: GradeComponent
  overAll: number
}

interface ComponentDisplay {
  name: string
  score: number
  weight: number
  icon: any
}

export default function GradeDetail({ params }: { params: { id: string } }) {
  const [gradeData, setGradeData] = useState<GradeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const courseId = params.id

  useEffect(() => {
    const fetchGradeData = async () => {
      try {
        setLoading(true)
        const studentId = localStorage.getItem("id")

        if (!studentId) {
          throw new Error("Student ID not found in localStorage")
        }

        const apiUrl = `${process.env.NEXT_PUBLIC_SRS_SERVER}/grade/student-course?studentId=${studentId}&courseId=${courseId}`

        const response = await fetch(apiUrl)

        if (!response.ok) {
          throw new Error(`Failed to fetch grade data: ${response.statusText}`)
        }

        const data: GradeData = await response.json()
        setGradeData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchGradeData()
  }, [courseId])

  const getGradeColor = (score: number) => {
    if (score >= 90) return "text-green-500"
    if (score >= 80) return "text-blue-500"
    if (score >= 70) return "text-yellow-500"
    return "text-red-500"
  }

  const getLetterGrade = (score: number) => {
    if (score >= 90) return "A"
    if (score >= 80) return "B"
    if (score >= 70) return "C"
    if (score >= 60) return "D"
    return "F"
  }

  const getComponents = (data: GradeData): ComponentDisplay[] => {
    return [
      { name: "Quiz", score: data.quiz.score, weight: data.quiz.weightage, icon: PenTool },
      { name: "Mid Term", score: data.midTerm.score, weight: data.midTerm.weightage, icon: FileText },
      { name: "Project", score: data.project.score, weight: data.project.weightage, icon: Presentation },
      { name: "Final Term", score: data.finalTerm.score, weight: data.finalTerm.weightage, icon: Beaker },
    ]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-purple-950 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-indigo-500" />
              <p className="text-lg text-gray-600 dark:text-gray-400">Loading grade details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-purple-950 p-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/student/results"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Overview
          </Link>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-red-500 text-lg mb-4">Error loading grade details</p>
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!gradeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-purple-950 p-8">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/student/results"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Overview
          </Link>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-lg">No grade data found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const components = getComponents(gradeData)
  const letterGrade = getLetterGrade(gradeData.overAll)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-purple-950 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <Link
          href="/student/results"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Overview
        </Link>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center">
              <Book className="w-8 h-8 mr-3 text-indigo-500" />
              {gradeData.courseName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xl text-gray-600 dark:text-gray-400">Overall Grade</span>
              <span className={`text-4xl font-bold ${getGradeColor(gradeData.overAll)}`}>{letterGrade}</span>
            </div>
            <div className="text-lg text-gray-600 dark:text-gray-400 mb-2">
              Total Score: <span className="font-semibold">{gradeData.overAll.toFixed(1)}%</span>
            </div>
            <motion.div
              className="h-2 bg-gray-200 rounded-full overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="h-full bg-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${gradeData.overAll}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            </motion.div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Grade Components</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Component</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Weight</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {components.map((component, index) => {
                  const Icon = component.icon
                  // const weightedScore = (component.score * component.weight) / 100
                  return (
                    <motion.tr
                      key={component.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <TableCell className="font-medium">
                        <Icon className="w-4 h-4 inline-block mr-2" />
                        {component.name}
                      </TableCell>
                      <TableCell className={getGradeColor(component.score)}>{component.score}%</TableCell>
                      <TableCell>{component.weight}%</TableCell>
                      {/* <TableCell className="font-semibold">{weightedScore.toFixed(2)}</TableCell> */}
                    </motion.tr>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
