"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Award,
  Calendar,
  Clock,
  User,
  Briefcase,
  Heart,
  Ambulance 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

export default function StudentProfile() {
  const [student, setStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cgpa, setCgpa] = useState(0.0);
 
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const idFromStorage = localStorage.getItem("id") ?? "";
        console.log("idFromStorage:", idFromStorage);
        setIsLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_SRS_SERVER}/student/${idFromStorage}`
        );
        console.log("response", response);
        setStudent(response.data || null);
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
        <div className="text-xl font-semibold">Loading student profile...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
        <div className="text-xl font-semibold">Student not found</div>
      </div>
    );
  }

  const studentInfo = {
    name: `${student.firstName} ${student.lastName}`,
    email: student.email,
    phone: student.phone,
    dob: new Date(student.dob).toLocaleDateString(),
    address: student.address,
    major: "Computer Science", // Not in API, keeping static
    year: student.class, 
    profilePhoto : student.profilePhoto,
    section: student.section,
    enrollmentDate: new Date(student.enrollDate).toLocaleDateString(),
    expectedGraduation: student.expectedGraduation,
    emergencyConntact: student.emergencyContact,
  };

  const guardianInfo = {
    name: student.guardian.guardianName,
    relation: student.guardian.guardianRelation,
    email: student.guardian.guardianEmail,
    phone: student.guardian.guardianPhone,
    occupation: student.guardian.guardianProfession,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <Card className="overflow-hidden shadow-xl">
          <CardHeader className="p-0">
            <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-800">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="absolute -bottom-20 left-8"
              >
                <Avatar className="w-40 h-40 border-4 border-white dark:border-gray-800 shadow-lg">
                  <AvatarImage
                    src={studentInfo.profilePhoto}
                    alt={studentInfo.name}
                  />
                  <AvatarFallback>
                    {studentInfo.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            </div>
          </CardHeader>
          <CardContent className="pt-24 pb-8 px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h1 className="text-4xl font-bold mb-2 text-gray-800 dark:text-white">
                  {studentInfo.name}
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
                  {studentInfo.major}
                </p>
                <Badge variant="secondary" className="mb-6">
                  Class {studentInfo.year}-{studentInfo.section}
                </Badge>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <InfoItem icon={Mail} text={studentInfo.email} />
                    <InfoItem icon={Phone} text={studentInfo.phone} />
                    <InfoItem icon={Calendar} text={studentInfo.dob} />
                    <InfoItem icon={MapPin} text={studentInfo.address} />
                    
                  </div>
                  <div className="space-y-3">
                    <InfoItem
                      icon={BookOpen}
                      text={`Class: ${studentInfo.year}-${studentInfo.section}`}
                    />
                    <InfoItem
                      icon={Calendar}
                      text={`Enrolled: ${studentInfo.enrollmentDate}`}
                    />
                    <InfoItem
                      icon={Clock}
                      text={`Expected Graduation: ${studentInfo.expectedGraduation}`}
                    />
                    <InfoItem icon={Ambulance} text={`${studentInfo.emergencyConntact || 'N/A'}`} />

                  </div>
                </div>
              </div>
              <div>
                {/* <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center text-2xl">
                      <Award className="mr-2" />
                      Academic Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-bold mb-2 text-blue-600 dark:text-blue-400">
                      {cgpa.toFixed(2)}
                    </div>
                    <Progress value={(cgpa / 4) * 100} className="h-2 mb-4" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Cumulative GPA (out of 4.0)
                    </p>
                  </CardContent>
                </Card> */}
              </div>
            </div>

            <Tabs defaultValue="guardian" className="mt-12">
              <TabsList className="grid w-full grid-cols-1 mb-8">
                <TabsTrigger value="guardian">Guardian Information</TabsTrigger>
              </TabsList>
              <TabsContent value="guardian">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-semibold mb-4 flex items-center">
                      <Heart className="mr-2 text-red-500" />
                      Guardian Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <InfoItem icon={User} text={guardianInfo.name} />
                        <InfoItem icon={Heart} text={guardianInfo.relation} />
                        <InfoItem
                          icon={Briefcase}
                          text={guardianInfo.occupation}
                        />
                      </div>
                      <div className="space-y-3">
                        <InfoItem icon={Mail} text={guardianInfo.email} />
                        <InfoItem icon={Phone} text={guardianInfo.phone} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function InfoItem({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center text-gray-700 dark:text-gray-300">
      <Icon className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
      <span>{text}</span>
    </div>
  );
}
