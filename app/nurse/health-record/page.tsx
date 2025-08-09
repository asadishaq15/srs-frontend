'use client'
import React from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlusCircle, Search } from 'lucide-react'

// Assuming you have a type for student health records
type StudentHealthRecord = {
  id: string
  name: string
  grade: string
  lastCheckup: string
  healthStatus: string
}

// Mock data for demonstration
const mockRecords: StudentHealthRecord[] = [
  { id: '1', name: 'John Doe', grade: '10th', lastCheckup: '2023-05-15', healthStatus: 'Healthy' },
  { id: '2', name: 'Jane Smith', grade: '11th', lastCheckup: '2023-06-02', healthStatus: 'Allergies' },
  { id: '3', name: 'Bob Johnson', grade: '9th', lastCheckup: '2023-04-20', healthStatus: 'Asthma' },
]

export default function StudentHealthRecords() {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [records, setRecords] = React.useState<StudentHealthRecord[]>(mockRecords)

  const filteredRecords = records.filter(record =>
    record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.healthStatus.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar (your provided code) */}
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">Student Health Records</h1>
            
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-64">
                <Input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Record
              </Button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Last Checkup</TableHead>
                    <TableHead>Health Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.name}</TableCell>
                      <TableCell>{record.grade}</TableCell>
                      <TableCell>{record.lastCheckup}</TableCell>
                      <TableCell>{record.healthStatus}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}