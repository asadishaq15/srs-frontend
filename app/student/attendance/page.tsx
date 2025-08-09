"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Book, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

interface Subject {
  courseId: string;
  courseName: string;
  attendancePercentage: number;
}

interface AttendanceOverviewProps {
  studentId?: string;
}

// const subjects = [
//   { id: 1, name: "Mathematics", attendance: 85 },
//   { id: 2, name: "Physics", attendance: 92 },
//   { id: 3, name: "Computer Science", attendance: 78 },
//   { id: 4, name: "English Literature", attendance: 88 },
//   { id: 5, name: "Chemistry", attendance: 95 },
//   { id: 6, name: "History", attendance: 82 },
// ]

export default function AttendanceOverview() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  let studentId;
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        setError(null);

        studentId = localStorage.getItem("id");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SRS_SERVER}/student/attendance?studentId=${studentId}`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch attendance data: ${response.status}`
          );
        }

        const data = await response.json();
        // console.log(data);
        setSubjects(data);
        // console.log(subjects);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching attendance data"
        );
        console.error("Error fetching attendance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [studentId]);
  // console.log(subjects);
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-indigo-950 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 dark:text-white">
          Attendance Overview
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subjects.map((subject, index) => (
            <motion.div
              key={subject.courseId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/student/attendance/${subject.courseId}`}>
                <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Book className="w-5 h-5 mr-2 text-indigo-500" />
                        {subject.courseName}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Attendance
                      </span>
                      <span className="font-semibold">
                        {subject.attendancePercentage}%
                      </span>
                    </div>
                    <Progress
                      value={subject.attendancePercentage}
                      className="h-2"
                      style={{
                        background: `linear-gradient(to right, 
                          ${
                            subject.attendancePercentage < 75
                              ? "#ef4444"
                              : "#22c55e"
                          } ${subject.attendancePercentage}%, 
                          #e5e7eb ${subject.attendancePercentage}%)`,
                      }}
                    />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
