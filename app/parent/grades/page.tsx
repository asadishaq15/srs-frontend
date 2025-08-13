"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, FileText, Loader2, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useStudent } from "../context/StudentContext";
import axios from "axios";

interface Subject {
  courseId: string;
  courseName: string;
  teacherName: string;
  teacherEmail: string;
  currentGrade: number;
  lastUpdated: string;
  letterGrade: string;
}

interface ReportCard {
  id: string;
  title: string;
  term: string;
  date: string;
  url: string;
}

interface GPAData {
  current: number;
  previous: number;
  trend: "up" | "down";
  classRank: number;
  classSize: number;
  classPercentile: string;
}

export default function GradesPage() {
  const { selectedStudent, isLoading } = useStudent();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [gpaData, setGpaData] = useState<GPAData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedStudent) {
      setLoading(true);
      return;
    }

    setLoading(true);
    setError(null);
    Promise.all([
      axios.get(`/api/grade/by-student/${selectedStudent._id}`),
      axios.get(`/api/student/${selectedStudent._id}/report-cards`),
      axios.get(`/api/grade/gpa/${selectedStudent._id}`)
    ])
      .then(([gradesRes, reportsRes, gpaRes]) => {
        setSubjects(gradesRes.data || []);
        setReportCards(reportsRes.data || []);
        setGpaData(gpaRes.data || null);
      })
      .catch((err) => {
        setError("Failed to load grades data.");
      })
      .finally(() => setLoading(false));
  }, [selectedStudent]);
  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "text-green-600 dark:text-green-400";
    if (grade >= 80) return "text-blue-600 dark:text-blue-400";
    if (grade >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getGradeBadgeColor = (grade: number) => {
    if (grade >= 95) return "bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100";
    if (grade >= 90) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
    if (grade >= 80) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
    if (grade >= 70) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-lg text-gray-600 dark:text-gray-400">Loading grades...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <Card className="max-w-md mx-auto mt-12">
          <CardContent className="p-6">
            <p className="text-red-500 mb-2">Error loading grades</p>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 dark:text-white">
          Grades & Reports
        </h1>
        
        {/* Grade Summary Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-6 w-6 text-blue-500" />
              Academic Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current GPA</p>
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
  {gpaData && typeof gpaData.current === "number" ? gpaData.current.toFixed(2) : "--"}
</p>
                <div className="mt-2 flex justify-center">
                  {gpaData && (
                <Badge
                className={
                  gpaData && gpaData.trend === 'up'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                }
              >
                {gpaData && gpaData.trend === 'up' ? '↑' : '↓'} From{' '}
                {gpaData && typeof gpaData.previous === "number"
                  ? gpaData.previous.toFixed(2)
                  : "--"}
              </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col justify-center">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>A Range (90-100%)</span>
                      <span>{subjects.filter(s => s.currentGrade >= 90).length} courses</span>
                    </div>
                    <Progress value={subjects.length ? (subjects.filter(s => s.currentGrade >= 90).length / subjects.length) * 100 : 0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>B Range (80-89%)</span>
                      <span>{subjects.filter(s => s.currentGrade >= 80 && s.currentGrade < 90).length} courses</span>
                    </div>
                    <Progress value={subjects.length ? (subjects.filter(s => s.currentGrade >= 80 && s.currentGrade < 90).length / subjects.length) * 100 : 0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1 text-sm">
                      <span>C Range (70-79%)</span>
                      <span>{subjects.filter(s => s.currentGrade >= 70 && s.currentGrade < 80).length} courses</span>
                    </div>
                    <Progress value={subjects.length ? (subjects.filter(s => s.currentGrade >= 70 && s.currentGrade < 80).length / subjects.length) * 100 : 0} className="h-2" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-6 flex flex-col justify-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">Class Rank</p>
                <div className="text-center">
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {gpaData ? gpaData.classRank : "--"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {gpaData ? `out of ${gpaData.classSize} students` : ""}
                  </p>
                </div>
                <div className="mt-4 text-center">
                  {gpaData && (
                    <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100">
                      {gpaData.classPercentile}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="courses" className="mt-8">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="courses">Current Courses</TabsTrigger>
            <TabsTrigger value="reports">Report Cards</TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subjects.map((subject, index) => (
                <motion.div
                  key={subject.courseId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-medium mb-1">{subject.courseName}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Teacher: {subject.teacherName}
                          </p>
                        </div>
                        <Badge className={getGradeBadgeColor(subject.currentGrade)}>
                          {subject.letterGrade}
                        </Badge>
                      </div>
                      
                      <div className="mb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Current Grade</span>
                          <span className={`font-medium ${getGradeColor(subject.currentGrade)}`}>
                            {subject.currentGrade}%
                          </span>
                        </div>
                        <Progress value={subject.currentGrade} className="h-2" />
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Last updated: {subject.lastUpdated}
                        </p>
                        <Link href={`/parent/grades/${subject.courseId}`}>
                          <Button variant="outline" size="sm" className="flex items-center">
                            <span>Details</span>
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-blue-500" />
                  Report Cards & Progress Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportCards.length === 0 && (
                    <div className="text-gray-500">No report cards available.</div>
                  )}
                  {reportCards.map((report, index) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-md transition-shadow duration-300">
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{report.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{report.term}</Badge>
                              <span className="text-xs text-gray-500">{report.date}</span>
                            </div>
                          </div>
                          <a href={report.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">
                              <FileText className="mr-1 h-4 w-4" />
                              Download
                            </Button>
                          </a>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}