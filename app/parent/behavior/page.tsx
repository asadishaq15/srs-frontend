// app/parent/behavior/page.tsx
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  AlertTriangle, CheckCircle, Clock, Calendar, Filter,
  ChevronDown, ChevronUp, User, MapPin, Search, X
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { useStudent } from "../context/StudentContext"
import axios from "axios"

export default function ParentBehavior() {
  const { selectedStudent, isLoading: studentLoading } = useStudent()
  
  const [incidents, setIncidents] = useState<any[]>([])
  const [filteredIncidents, setFilteredIncidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Filter states
  const [typeFilters, setTypeFilters] = useState<Record<string, boolean>>({
    positive: true,
    negative: true,
    neutral: true
  })
  const [statusFilters, setStatusFilters] = useState<Record<string, boolean>>({
    resolved: true,
    pending: true,
    ongoing: true
  })
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")

  // Fetch from API
  useEffect(() => {
    if (!selectedStudent) return
    setLoading(true)
    setError(null)
    axios
      .get(`${process.env.NEXT_PUBLIC_SRS_SERVER}/behavior?studentId=${selectedStudent._id}`)
      .then(res => setIncidents(res.data || []))
      .catch(e => setError("Failed to load behavior records"))
      .finally(() => setLoading(false))
  }, [selectedStudent])

  // Filtering, Search, Sorting
  useEffect(() => {
    let filtered = [...incidents]
    filtered = filtered.filter(incident => typeFilters[incident.type])
    filtered = filtered.filter(incident => statusFilters[incident.status])
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(incident => 
        incident.title.toLowerCase().includes(query) ||
        incident.description.toLowerCase().includes(query) ||
        (incident.teacherId && (
          `${incident.teacherId.firstName} ${incident.teacherId.lastName}`.toLowerCase().includes(query) ||
          (incident.teacherId.subject || "").toLowerCase().includes(query)
        )) ||
        (incident.location?.toLowerCase().includes(query))
      )
    }
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB
    })
    setFilteredIncidents(filtered)
  }, [incidents, typeFilters, statusFilters, sortOrder, searchQuery])

  // UI helpers
  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id)

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case "positive": return <CheckCircle className="h-6 w-6 text-green-500" />
      case "negative": return <AlertTriangle className="h-6 w-6 text-red-500" />
      case "neutral": return <Clock className="h-6 w-6 text-amber-500" />
      default: return null
    }
  }
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved": return <Badge variant="outline" className="bg-green-100 text-green-800">Resolved</Badge>
      case "pending":  return <Badge variant="outline" className="bg-amber-100 text-amber-800">Pending</Badge>
      case "ongoing":  return <Badge variant="outline" className="bg-blue-100 text-blue-800">Ongoing</Badge>
      default: return null
    }
  }

  if (studentLoading) {
    return <div className="min-h-screen p-8 flex items-center justify-center"><span>Loading student data...</span></div>
  }
  if (!selectedStudent) {
    return <div className="min-h-screen p-8 flex items-center justify-center"><span>Please select a student to view behavior reports.</span></div>
  }
  if (loading) {
    return <div className="min-h-screen p-8 flex items-center justify-center"><span>Loading behavior records...</span></div>
  }
  if (error) {
    return <div className="min-h-screen p-8 flex items-center justify-center text-red-500"><span>{error}</span></div>
  }

  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-2 text-center text-gray-800 dark:text-white">Behavior Reports</h1>
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {selectedStudent.profilePhoto &&
                <AvatarImage src={selectedStudent.profilePhoto} alt={`${selectedStudent.firstName} ${selectedStudent.lastName}`} />
              }
              <AvatarFallback>{selectedStudent.firstName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">{selectedStudent.firstName} {selectedStudent.lastName}</div>
              <div className="text-xs text-gray-500">Grade {selectedStudent.class} • Section {selectedStudent.section}</div>
            </div>
          </div>
          <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
            View behavior records and incident reports for <span className="font-medium">{selectedStudent.firstName} {selectedStudent.lastName}</span>
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search behavior reports..."
                  className="pl-9 pr-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-2.5"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                )}
              </div>
              
              <div className="flex space-x-2 w-full sm:w-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      <Filter className="h-4 w-4 mr-2" />
                      Type
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuCheckboxItem
                      checked={typeFilters.positive}
                      onCheckedChange={(checked) => setTypeFilters({...typeFilters, positive: checked})}
                    >
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Positive
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={typeFilters.negative}
                      onCheckedChange={(checked) => setTypeFilters({...typeFilters, negative: checked})}
                    >
                      <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                      Negative
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={typeFilters.neutral}
                      onCheckedChange={(checked) => setTypeFilters({...typeFilters, neutral: checked})}
                    >
                      <Clock className="h-4 w-4 text-amber-500 mr-2" />
                      Neutral
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9">
                      <Calendar className="h-4 w-4 mr-2" />
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuCheckboxItem
                      checked={sortOrder === "newest"}
                      onCheckedChange={() => setSortOrder("newest")}
                    >
                      Newest First
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={sortOrder === "oldest"}
                      onCheckedChange={() => setSortOrder("oldest")}
                    >
                      Oldest First
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {filteredIncidents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-xl font-medium text-gray-600 dark:text-gray-400">No behavior reports found</p>
              <p className="text-gray-500 dark:text-gray-500 mt-2 text-center">
                {searchQuery 
                  ? "No reports match your search criteria. Try adjusting your filters."
                  : "There are no behavior reports to display at this time."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredIncidents.map((incident) => (
              <motion.div
                key={incident._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`
                  border-l-4 hover:shadow-md transition-all duration-200
                  ${incident.type === 'positive' ? 'border-l-green-500' : 
                    incident.type === 'negative' ? 'border-l-red-500' : 
                    'border-l-amber-500'}
                `}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5">
                          {getIncidentIcon(incident.type)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{incident.title}</CardTitle>
                          <CardDescription>
                            {format(new Date(incident.date), "MMMM d, yyyy")}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        {getStatusBadge(incident.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                        {incident.teacherId && (
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            <span>
                              {incident.teacherId.firstName} {incident.teacherId.lastName}
                              {incident.teacherId.subject ? ` (${incident.teacherId.subject})` : ""}
                            </span>
                          </div>
                        )}
                        {incident.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{incident.location}</span>
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleExpand(incident._id)}
                        className="text-gray-500 self-end sm:self-auto"
                      >
                        {expandedId === incident._id ? 
                          <ChevronUp className="h-5 w-5" /> : 
                          <ChevronDown className="h-5 w-5" />
                        }
                      </Button>
                    </div>
                    {expandedId === incident._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Separator className="mb-4" />
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-4">
                          <div className="sm:col-span-1">
                            {incident.teacherId && (
                              <Avatar className="h-16 w-16">
                                <AvatarFallback>
                                  {incident.teacherId.firstName?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                          <div className="sm:col-span-4">
                            <h4 className="text-sm font-medium mb-2">Description:</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{incident.description}</p>
                            {incident.action && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">Action Taken:</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{incident.action}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}