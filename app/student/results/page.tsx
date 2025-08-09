"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Loader2, BookOpen } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Subject {
  courseId: string;
  courseName: string;
  attendancePercentage: number;
}

export default function AttendanceOverview() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        setError(null);

        const studentId = localStorage.getItem("id");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SRS_SERVER}/student/attendance?studentId=${studentId}`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch attendance data: ${response.status}`
          );
        }

        const data = await response.json();
        setSubjects(data);
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
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-lg font-medium text-muted-foreground">
            Loading courses...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 bg-background">
        <Alert className="max-w-md mx-auto">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-2 text-center">
          My Courses
        </h1>
        <p className="text-center text-muted-foreground mb-8 max-w-xl mx-auto">
          Select a course to view Grades
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject, index) => (
            <motion.div
              key={subject.courseId}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: index * 0.1,
                duration: 0.4,
                ease: "easeOut"
              }}
              whileHover={{ 
                y: -5,
                transition: { duration: 0.2 }
              }}
            >
              <Card className="overflow-hidden border-2 hover:border-primary/20 transition-all duration-300 group">
                <CardContent className="p-6 pt-8">
                  <div className="mb-4">
                    <BookOpen className="w-8 h-8 text-primary/80 mb-3" />
                    <h3 className="text-xl font-medium line-clamp-2 group-hover:text-primary transition-colors">
                      {subject.courseName}
                    </h3>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/50 p-4 flex items-center justify-between">
                  <Link href={`/student/results/${subject.courseId}`} className="w-full">
                    <Button 
                      variant="ghost" 
                      className="w-full bg-black text-white group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
        
        {subjects.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mt-12"
          >
            <p className="text-muted-foreground text-lg">
              No courses found. Please check back later.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}