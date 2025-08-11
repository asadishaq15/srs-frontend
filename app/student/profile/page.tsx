"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Calendar,
  Clock,
  User,
  Heart,
  Ambulance,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

type ParentInfo = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
};

function InfoItem({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center text-gray-700 dark:text-gray-300">
      <Icon className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
      <span>{text}</span>
    </div>
  );
}

export default function StudentProfile() {
  const [student, setStudent] = useState<any>(null);
  const [parents, setParents] = useState<ParentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const idFromStorage = localStorage.getItem("id") ?? "";
        setIsLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_SRS_SERVER}/student/${idFromStorage}`
        );
        setStudent(response.data || null);
      } catch (error) {
        console.error("Error fetching student data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudentData();
  }, []);

  // Fetch parent details if not already populated
  useEffect(() => {
    async function fetchParents() {
      if (!student || !student.parents) {
        setParents([]);
        return;
      }

      // If already populated (has firstName), just use them
      if (
        Array.isArray(student.parents) &&
        student.parents.length > 0 &&
        typeof student.parents[0] === "object" &&
        "firstName" in student.parents[0]
      ) {
        setParents(student.parents as ParentInfo[]);
        return;
      }

      // Else, fetch parent(s) by ID from backend
      if (Array.isArray(student.parents) && student.parents.length > 0) {
        try {
          const parentRequests = student.parents.map((parentId: string) =>
            axios.get(`${process.env.NEXT_PUBLIC_SRS_SERVER}/parent/${parentId}`).then(res => res.data)
          );
          const parentDetails = await Promise.all(parentRequests);
          setParents(parentDetails);
        } catch (err) {
          setParents([]);
        }
      } else {
        setParents([]);
      }
    }
    fetchParents();
  }, [student]);

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
    name: `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim(),
    email: student.email ?? "",
    phone: student.phone ?? "",
    dob: student.dob ? new Date(student.dob).toLocaleDateString() : "",
    address: student.address ?? "",
    major: "N/A",
    year: student.class ?? "",
    profilePhoto: student.profilePhoto ?? "",
    section: student.section ?? "",
    enrollmentDate: student.enrollDate
      ? new Date(student.enrollDate).toLocaleDateString()
      : "",
    expectedGraduation: student.expectedGraduation ?? "",
    emergencyContact: student.emergencyContact ?? "",
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
                    <InfoItem
                      icon={Ambulance}
                      text={`${studentInfo.emergencyContact || "N/A"}`}
                    />
                  </div>
                </div>
              </div>
              <div>{/* Future right side */}</div>
            </div>
            <Tabs defaultValue="parent" className="mt-12">
              <TabsList className="grid w-full grid-cols-1 mb-8">
                <TabsTrigger value="parent">Parent Information</TabsTrigger>
              </TabsList>
              <TabsContent value="parent">
                {parents.length === 0 ? (
                  <div className="text-muted-foreground">
                    No parent information found.
                  </div>
                ) : (
                  parents.map((p, idx: number) => (
                    <Card key={p.email + idx}>
                      <CardContent className="p-6">
                        <h3 className="text-2xl font-semibold mb-4 flex items-center">
                          <Heart className="mr-2 text-red-500" />
                          {`${p.firstName ?? ""} ${p.lastName ?? ""}`.trim()}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <InfoItem icon={User} text={`${p.firstName ?? ""} ${p.lastName ?? ""}`.trim()} />
                            <InfoItem icon={Mail} text={p.email ?? ""} />
                          </div>
                          <div className="space-y-3">
                            <InfoItem icon={Phone} text={p.phone ?? ""} />
                            <InfoItem icon={MapPin} text={p.address ?? ""} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}