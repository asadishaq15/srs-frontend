"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Loader2, User, School } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useStudent } from "../context/StudentContext";
import axios from "axios";

interface ScheduleItem {
  _id: string;
  courseId: {
    _id: string;
    courseCode: string;
    courseName: string;
    description: string;
    courseCredit: number;
  };
  className: string;
  section: string;
  teacherId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
  };
  dayOfWeek: Array<{
    date: string; // E.g. "Monday"
    startTime: string;
    endTime: string;
  }>;
}

interface Class {
  id: string;
  name: string;
  time: string;
  location: string;
  startTime: string;
  endTime: string;
  teacher: string;
  room: string;
  day: string; // "Monday", etc
}

export default function ParentSchedule() {
  const { selectedStudent, isLoading: studentLoading } = useStudent();
  const [weekClasses, setWeekClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedule = async (studentId: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_SRS_SERVER}/schedule/by-student?studentId=${studentId}&date=all`
      );
      const apiData: ScheduleItem[] = res.data;

      setWeekClasses(transformScheduleData(apiData));
    } catch (err) {
      setError("Failed to load schedule");
      setWeekClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const transformScheduleData = (data: ScheduleItem[]): Class[] => {
    const classes: Class[] = [];
    data.forEach((item) => {
      item.dayOfWeek.forEach((schedule) => {
        classes.push({
          id: `${item._id}-${schedule.date}-${schedule.startTime}`,
          name: item.courseId.courseName,
          time: `${schedule.startTime} - ${schedule.endTime}`,
          location: `Grade ${item.className}, Section ${item.section}`,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          teacher: `${item.teacherId.firstName} ${item.teacherId.lastName}`,
          room: `TBA`, // Could add real room if available
          day: schedule.date,
        });
      });
    });
    // Sort by day order and time
    const dayOrder = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    return classes.sort((a, b) => {
      const dayA = dayOrder.indexOf(a.day);
      const dayB = dayOrder.indexOf(b.day);
      if (dayA !== dayB) return dayA - dayB;
      return a.startTime.localeCompare(b.startTime);
    });
  };

  useEffect(() => {
    if (selectedStudent) {
      fetchSchedule(selectedStudent._id);
    }
  }, [selectedStudent]);

  if (studentLoading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-lg text-gray-600 dark:text-gray-400">Loading student...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedStudent) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <Alert className="my-8">
            <AlertDescription>
              Please select a student to view their schedule.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-lg text-gray-600 dark:text-gray-400">Loading schedule...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-red-500 text-lg mb-4">Error loading schedule</p>
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Group classes by day
  const classesByDay = weekClasses.reduce((acc: Record<string, Class[]>, cls) => {
    if (!acc[cls.day]) acc[cls.day] = [];
    acc[cls.day].push(cls);
    return acc;
  }, {});

  const dayOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-2 text-center text-gray-800 dark:text-white">Class Schedule</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          Viewing schedule for <span className="font-semibold">{selectedStudent.firstName} {selectedStudent.lastName}</span>
        </p>
        <Tabs defaultValue="week" className="w-full">
          <TabsList className="grid w-full grid-cols-1 mb-8">
            <TabsTrigger value="week">Weekly Schedule</TabsTrigger>
          </TabsList>
          <TabsContent value="week">
            {Object.keys(classesByDay).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400">No classes scheduled for this week.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {dayOrder.filter(day => classesByDay[day]?.length).map(day => (
                  <ScheduleDay key={day} day={day} classes={classesByDay[day]} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

function ScheduleDay({ day, classes }: { day: string; classes: Class[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Calendar className="w-6 h-6 mr-2 text-blue-500" />
          {day}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {classes.map((cls, index) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{cls.name}</h3>
                    <Badge variant="secondary" className="text-sm">
                      {cls.time}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <User className="w-4 h-4 mr-2" />
                      <span>{cls.teacher}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{cls.time}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{cls.room}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <School className="w-4 h-4 mr-2" />
                      <span>{cls.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}