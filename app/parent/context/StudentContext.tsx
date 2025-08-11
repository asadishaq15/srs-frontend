// app/parent/context/StudentContext.tsx
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

export interface Student {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dob: string;
    address: string;
    class: string;
    section: string;
    enrollDate: string;
    expectedGraduation: string;
    emergencyContact: string;
    profilePhoto: string;
    parents: Array<{
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: string;
    }>;
   
  }

interface StudentContextType {
  students: Student[];
  isLoading: boolean;
  selectedStudent: Student | null;
  setSelectedStudent: (student: Student) => void;
  refreshStudents: () => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider = ({ children }: { children: React.ReactNode }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Parent ID should be stored in localStorage after login
  const parentId =
    typeof window !== "undefined" ? localStorage.getItem("parentId") : null;

  const fetchStudents = async () => {
    if (!parentId) {
      setStudents([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_SRS_SERVER}/parent/${parentId}/children-full`,
        {
          withCredentials: true, // If using cookie authentication
        }
      );
      const studentsFromApi = res.data;
      setStudents(studentsFromApi);
      if (!selectedStudent && studentsFromApi.length > 0) {
        setSelectedStudent(studentsFromApi[0]);
      }
    } catch (err) {
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentId]);

  const refreshStudents = () => fetchStudents();

  return (
    <StudentContext.Provider
      value={{
        students,
        isLoading,
        selectedStudent,
        setSelectedStudent,
        refreshStudents,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (!context)
    throw new Error("useStudent must be used within StudentProvider");
  return context;
};