"use client";

import { useStudent } from "../context/StudentContext";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Award,
  Calendar,
  Clock,
  User,
  Heart,
  School,
  GraduationCap,
  UserCheck
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function StudentProfile() {
  const { selectedStudent, isLoading } = useStudent();

  if (isLoading || !selectedStudent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
        <div className="text-xl font-semibold">Loading student profile...</div>
      </div>
    );
  }

  const student = selectedStudent;

  const studentInfo = {
    name: `${student.firstName} ${student.lastName}`,
    email: student.email,
    phone: student.phone,
    dob: new Date(student.dob).toLocaleDateString(),
    address: student.address,
    year: student.class,
    section: student.section,
    profilePhoto: student.profilePhoto,
    enrollmentDate: new Date(student.enrollDate).toLocaleDateString(),
    expectedGraduation: student.expectedGraduation,
    emergencyContact: student.emergencyContact,
  };

  const guardianInfo = {
    name: student.guardian?.guardianName,
    relation: student.guardian?.guardianRelation,
    email: student.guardian?.guardianEmail,
    phone: student.guardian?.guardianPhone,
    occupation: student.guardian?.guardianProfession,
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <Card className="overflow-hidden">
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
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge variant="secondary">
                    Grade {studentInfo.year}
                  </Badge>
                  <Badge variant="secondary">
                    Section {studentInfo.section}
                  </Badge>
                  {/* Homeroom, etc. */}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-3">
                    <InfoItem icon={Mail} text={studentInfo.email} />
                    <InfoItem icon={Phone} text={studentInfo.phone} />
                    <InfoItem icon={Calendar} text={studentInfo.dob} />
                    <InfoItem icon={MapPin} text={studentInfo.address} />
                  </div>
                  <div className="space-y-3">
                    <InfoItem
                      icon={School}
                      text={`School: N/A`}
                    />
                    <InfoItem
                      icon={Calendar}
                      text={`Enrolled: ${studentInfo.enrollmentDate}`}
                    />
                    <InfoItem
                      icon={GraduationCap}
                      text={`Expected Graduation: ${studentInfo.expectedGraduation}`}
                    />
                  </div>
                </div>
              </div>
              <div>
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center text-2xl">
                      <Award className="mr-2" />
                      Academic Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-5xl font-bold mb-2 text-blue-600 dark:text-blue-400">
                      {/* GPA can be fetched here if backend provides */}
                      {"--"}
                    </div>
                    <Progress value={0} className="h-2 mb-4" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Current GPA (out of 4.0)
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span className="font-semibold">Attendance Rate:</span> {"--"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-semibold">Completed Assignments:</span> {"--"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
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
                          icon={Mail}
                          text={guardianInfo.email}
                        />
                      </div>
                      <div className="space-y-3">
                        <InfoItem icon={Phone} text={guardianInfo.phone} />
                        <InfoItem icon={GraduationCap} text={guardianInfo.occupation} />
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