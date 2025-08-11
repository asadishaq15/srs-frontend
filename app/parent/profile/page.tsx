"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  User,
  Heart,
  School,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

type StudentObj = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  class: string;
  section: string;
  profilePhoto?: string;
  enrollDate?: string;
  expectedGraduation?: string;
};

type ParentObj = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  children?: string[]; // Array of student IDs
};

function InfoItem({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center text-gray-700 dark:text-gray-300">
      <Icon className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
      <span>{text}</span>
    </div>
  );
}

export default function ParentProfile() {
  // Get parentId from session/localStorage; adapt to your auth method
  const parentId = typeof window !== "undefined" ? localStorage.getItem("id") : null;
  const [parent, setParent] = useState<ParentObj | null>(null);
  const [children, setChildren] = useState<StudentObj[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchParentAndChildren() {
      if (!parentId) return;
      setIsLoading(true);
      try {
        // Get parent info
        const parentRes = await axios.get(`${process.env.NEXT_PUBLIC_SRS_SERVER}/parent/${parentId}`);
        const parentData = parentRes.data;
        setParent(parentData);

        // Get all children, using children-full endpoint (returns full student objects)
        const childrenRes = await axios.get(`${process.env.NEXT_PUBLIC_SRS_SERVER}/parent/${parentId}/children-full`);
        setChildren(childrenRes.data || []);
      } catch (err) {
        setParent(null);
        setChildren([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchParentAndChildren();
  }, [parentId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
        <div className="text-xl font-semibold">Loading profile...</div>
      </div>
    );
  }

  if (!parent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
        <div className="text-xl font-semibold">Parent not found</div>
      </div>
    );
  }

  const parentInfo = {
    name: `${parent.firstName ?? ""} ${parent.lastName ?? ""}`.trim(),
    email: parent.email ?? "",
    phone: parent.phone ?? "",
    address: parent.address ?? "",
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
                  {/* You can use a parent avatar or placeholder */}
                  <AvatarImage
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(parentInfo.name)}`}
                    alt={parentInfo.name}
                  />
                  <AvatarFallback>
                    {parentInfo.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            </div>
          </CardHeader>
          <CardContent className="pt-24 pb-8 px-8">
            <h1 className="text-4xl font-bold mb-2 text-gray-800 dark:text-white">
              {parentInfo.name}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="space-y-3">
                <InfoItem icon={Mail} text={parentInfo.email} />
                <InfoItem icon={Phone} text={parentInfo.phone} />
                <InfoItem icon={MapPin} text={parentInfo.address} />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <School className="mr-2" />
                Children
              </h2>
              {children.length === 0 ? (
                <div className="text-muted-foreground">No children found.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {children.map((child, idx: number) => (
                    <Card key={child._id + idx}>
                      <CardContent className="p-4">
                        <div className="flex items-center mb-2">
                          <Avatar className="w-16 h-16 border-2 border-white dark:border-gray-800 shadow-lg mr-4">
                            <AvatarImage
                              src={child.profilePhoto || ""}
                              alt={child.firstName + " " + child.lastName}
                            />
                            <AvatarFallback>
                              {(child.firstName ?? "")
                                .slice(0, 1)
                                .toUpperCase()}
                              {(child.lastName ?? "")
                                .slice(0, 1)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-lg font-bold">
                              {child.firstName} {child.lastName}
                            </div>
                            <Badge className="mr-2">
                              Grade {child.class}
                            </Badge>
                            <Badge>
                              Section {child.section}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          <InfoItem icon={Mail} text={child.email} />
                          <InfoItem icon={Calendar} text={`Enrolled: ${child.enrollDate ? new Date(child.enrollDate).toLocaleDateString() : ""}`} />
                          <InfoItem icon={GraduationCap} text={`Expected Graduation: ${child.expectedGraduation ?? ""}`} />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}