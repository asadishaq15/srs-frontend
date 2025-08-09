"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, ChevronRight, X, Send, BookOpen, MessageCircle, Mail, School, ArrowRight, Phone, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from 'date-fns'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"

interface Teacher {
  id: string
  name: string
  subject: string
  email: string
  phone: string
  image?: string
  messages: Message[]
  unreadCount: number
}

interface Message {
  id: string
  text: string
  sender: "parent" | "teacher"
  timestamp: Date
  attachments?: string[]
  read: boolean
}

interface SchoolStaff {
  id: string
  name: string
  role: string
  email: string
  phone: string
  image?: string
}

export default function ParentCommunication() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [staffMembers, setStaffMembers] = useState<SchoolStaff[]>([])
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<SchoolStaff | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("teachers")
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const messageEndRef = useRef<HTMLDivElement>(null)
  const [showNewMessageForm, setShowNewMessageForm] = useState(false)
  const [newMessageSubject, setNewMessageSubject] = useState("")
  const [newMessageText, setNewMessageText] = useState("")
  const [newMessageRecipient, setNewMessageRecipient] = useState<SchoolStaff | Teacher | null>(null)

  useEffect(() => {
    // Get the selected student ID from localStorage
    const storedStudentId = localStorage.getItem("selectedStudentId")
    if (storedStudentId) {
      setSelectedStudentId(storedStudentId)
    }
  }, [])

  useEffect(() => {
    if (selectedStudentId) {
      fetchCommunicationData()
    }
  }, [selectedStudentId])

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedTeacher, selectedStaff])

  const fetchCommunicationData = async () => {
    try {
      setLoading(true)
      
      // In a real app, call your API with the selected student ID
      // For now, we'll simulate a response with mock data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data for teachers
      const mockTeachers: Teacher[] = [
        {
          id: "t1",
          name: "Mrs. Jennifer Davis",
          subject: "Mathematics",
          email: "jennifer.davis@school.edu",
          phone: "(555) 123-4567",
          image: "/teachers/teacher1.jpg",
          unreadCount: 2,
          messages: [
            {
              id: "m1",
              text: "Hello! I wanted to let you know that Emma has been doing excellent work in our recent algebra unit.",
              sender: "teacher",
              timestamp: new Date(2025, 6, 28, 14, 30),
              read: true
            },
            {
              id: "m2",
              text: "That's wonderful to hear! She's been practicing a lot at home.",
              sender: "parent",
              timestamp: new Date(2025, 6, 28, 15, 45),
              read: true
            },
            {
              id: "m3",
              text: "I also wanted to remind you about the upcoming math competition next month. I think Emma should consider participating.",
              sender: "teacher",
              timestamp: new Date(2025, 6, 29, 9, 15),
              read: false
            },
            {
              id: "m7",
              text: "That sounds like a great opportunity. What kind of preparation would she need?",
              sender: "parent",
              timestamp: new Date(2025, 6, 29, 10, 30),
              read: true
            },
            {
              id: "m8",
              text: "I recommend reviewing the advanced algebra concepts we covered last month. I can provide some practice problems that are similar to what she might encounter in the competition.",
              sender: "teacher",
              timestamp: new Date(2025, 6, 29, 11, 45),
              read: true
            },
            {
              id: "m9",
              text: "That would be very helpful. Emma is excited about the possibility of participating.",
              sender: "parent",
              timestamp: new Date(2025, 6, 29, 13, 20),
              read: true
            },
            {
              id: "m10",
              text: "Great! I'll send over those practice problems by the end of the week. The competition is on October 15th, so she'll have plenty of time to prepare.",
              sender: "teacher",
              timestamp: new Date(2025, 6, 30, 9, 10),
              read: false
            },
            {
              id: "m11",
              text: "Also, would you be able to attend our parent-teacher conference next Thursday at 4:30 PM? We can discuss Emma's progress in more detail.",
              sender: "teacher",
              timestamp: new Date(2025, 6, 30, 9, 15),
              read: false
            }
          ]
        },
        {
          id: "t2",
          name: "Mr. Robert Wilson",
          subject: "Science",
          email: "robert.wilson@school.edu",
          phone: "(555) 234-5678",
          image: "/teachers/teacher2.jpg",
          unreadCount: 0,
          messages: [
            {
              id: "m4",
              text: "I wanted to discuss Emma's science project. While her research is excellent, she needs to improve the presentation aspect.",
              sender: "teacher",
              timestamp: new Date(2025, 6, 25, 11, 20),
              read: true
            },
            {
              id: "m5",
              text: "Thank you for letting me know. I'll help her work on the presentation this weekend.",
              sender: "parent",
              timestamp: new Date(2025, 6, 25, 17, 30),
              read: true
            },
            {
              id: "m12",
              text: "That would be great. The content of her project on renewable energy sources is very thorough and well-researched.",
              sender: "teacher",
              timestamp: new Date(2025, 6, 26, 9, 15),
              read: true
            },
            {
              id: "m13",
              text: "She's particularly passionate about solar energy. We visited a solar farm last summer.",
              sender: "parent",
              timestamp: new Date(2025, 6, 26, 10, 30),
              read: true
            },
            {
              id: "m14",
              text: "That explains her in-depth knowledge! If she could incorporate some of that personal experience into her presentation, it would make it more engaging.",
              sender: "teacher",
              timestamp: new Date(2025, 6, 26, 11, 45),
              read: true
            }
          ]
        },
        {
          id: "t3",
          name: "Ms. Sarah Johnson",
          subject: "English Literature",
          email: "sarah.johnson@school.edu",
          phone: "(555) 345-6789",
          image: "/teachers/teacher3.jpg",
          unreadCount: 1,
          messages: [
            {
              id: "m6",
              text: "Emma's essay on Macbeth was one of the best in the class. I've shared some detailed feedback on her paper.",
              sender: "teacher",
              timestamp: new Date(2025, 6, 27, 10, 15),
              read: false
            },
            {
              id: "m15",
              text: "Thank you for letting me know! She spent a lot of time analyzing the themes in the play.",
              sender: "parent",
              timestamp: new Date(2025, 6, 27, 13, 45),
              read: true
            },
            {
              id: "m16",
              text: "It definitely shows. Her analysis of Lady Macbeth's character was particularly insightful. Has she mentioned any interest in pursuing literature or writing in college?",
              sender: "teacher",
              timestamp: new Date(2025, 6, 27, 14, 30),
              read: true
            },
            {
              id: "m17",
              text: "She's been considering it! She also enjoys creative writing in her free time.",
              sender: "parent",
              timestamp: new Date(2025, 6, 27, 16, 20),
              read: true
            },
            {
              id: "m18",
              text: "I'd be happy to recommend some writing competitions that might interest her. There's one coming up in November that offers scholarships for winners.",
              sender: "teacher",
              timestamp: new Date(2025, 6, 28, 9, 10),
              read: false
            }
          ]
        }
      ]
      
      // Mock data for school staff
      const mockStaff: SchoolStaff[] = [
        {
          id: "s1",
          name: "Dr. Michael Thompson",
          role: "Principal",
          email: "michael.thompson@school.edu",
          phone: "(555) 987-6543",
          image: "/staff/principal.jpg"
        },
        {
          id: "s2",
          name: "Ms. Lisa Garcia",
          role: "School Counselor",
          email: "lisa.garcia@school.edu",
          phone: "(555) 876-5432",
          image: "/staff/counselor.jpg"
        },
        {
          id: "s3",
          name: "Mr. James Wilson",
          role: "Athletic Director",
          email: "james.wilson@school.edu",
          phone: "(555) 765-4321",
          image: "/staff/athletic-director.jpg"
        },
        {
          id: "s4",
          name: "Mrs. Patricia Lee",
          role: "School Nurse",
          email: "patricia.lee@school.edu",
          phone: "(555) 654-3210",
          image: "/staff/nurse.jpg"
        }
      ]
      
      setTeachers(mockTeachers)
      setStaffMembers(mockStaff)
      
    } catch (error) {
      console.error("Error fetching communication data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return
    
    if (selectedTeacher) {
      const updatedTeacher = { ...selectedTeacher }
      
      const newMsg: Message = {
        id: `new-${Date.now()}`,
        text: newMessage,
        sender: "parent",
        timestamp: new Date(),
        read: true
      }
      
      updatedTeacher.messages = [...updatedTeacher.messages, newMsg]
      
      setTeachers(teachers.map(teacher => 
        teacher.id === selectedTeacher.id ? updatedTeacher : teacher
      ))
      
      setSelectedTeacher(updatedTeacher)
      setNewMessage("")
      
      // Simulate teacher response after a delay
      setTimeout(() => {
        const response: Message = {
          id: `response-${Date.now()}`,
          text: "Thank you for your message. I'll get back to you on this soon.",
          sender: "teacher",
          timestamp: new Date(),
          read: true
        }
        
        const teacherWithResponse = {
          ...updatedTeacher,
          messages: [...updatedTeacher.messages, response]
        }
        
        setTeachers(teachers.map(teacher => 
          teacher.id === selectedTeacher.id ? teacherWithResponse : teacher
        ))
        
        setSelectedTeacher(teacherWithResponse)
      }, 2000)
    }
  }

  const handleCloseChat = () => {
    setSelectedTeacher(null)
    setSelectedStaff(null)
  }

  const handleNewMessage = () => {
    if (newMessageSubject.trim() === "" || newMessageText.trim() === "" || !newMessageRecipient) {
      return
    }
    
    // In a real app, you would send this to your API
    alert(`Message to ${newMessageRecipient.name} sent successfully!`)
    
    setShowNewMessageForm(false)
    setNewMessageSubject("")
    setNewMessageText("")
    setNewMessageRecipient(null)
  }

  if (!selectedStudentId) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <Alert className="my-8">
            <AlertDescription>
              Please select a student to view communications.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <svg className="animate-spin h-12 w-12 text-indigo-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-lg text-gray-600 dark:text-gray-400">Loading communications...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-gray-800 dark:text-white">School Communication</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Connect with your child's teachers and school staff
            </p>
          </div>
          <Button onClick={() => setShowNewMessageForm(true)} className="bg-indigo-600 hover:bg-indigo-700">
            <MessageCircle className="mr-2 h-4 w-4" />
            New Message
          </Button>
        </div>

        <AnimatePresence>
          {showNewMessageForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle>New Message</CardTitle>
                  <CardDescription>Send a message to teachers or school staff</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Recipient</label>
                      <select 
                        className="w-full p-2 border rounded-md bg-background"
                        value={newMessageRecipient?.id || ""}
                        onChange={(e) => {
                          const id = e.target.value
                          const teacher = teachers.find(t => t.id === id)
                          const staff = staffMembers.find(s => s.id === id)
                          setNewMessageRecipient(teacher || staff || null)
                        }}
                      >
                        <option value="">Select a recipient</option>
                        <optgroup label="Teachers">
                          {teachers.map(teacher => (
                            <option key={teacher.id} value={teacher.id}>
                              {teacher.name} - {teacher.subject}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="School Staff">
                          {staffMembers.map(staff => (
                            <option key={staff.id} value={staff.id}>
                              {staff.name} - {staff.role}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Subject</label>
                      <Input 
                        type="text" 
                        placeholder="Enter subject" 
                        value={newMessageSubject}
                        onChange={(e) => setNewMessageSubject(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Message</label>
                      <Textarea 
                        placeholder="Type your message here..." 
                        rows={5}
                        value={newMessageText}
                        onChange={(e) => setNewMessageText(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setShowNewMessageForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleNewMessage}>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar - increased to 4 columns */}
          <div className="lg:col-span-4">
            <Card className="h-full">
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <CardHeader className="pb-2">
                  <TabsList className="grid w-full grid-cols-2 h-10 mb-2">
                    <TabsTrigger value="teachers" className="text-sm">Teachers</TabsTrigger>
                    <TabsTrigger value="staff" className="text-sm">Staff</TabsTrigger>
                  </TabsList>
                </CardHeader>
                <TabsContent value="teachers" className="m-0 flex-1 overflow-hidden">
                  <ScrollArea className="h-[calc(100vh-300px)]">
                    <div className="p-4 space-y-3">
                      {teachers.map((teacher) => (
                        <div
                          key={teacher.id}
                          className={`
                            p-4 rounded-lg flex items-center gap-3 cursor-pointer transition-colors
                            ${selectedTeacher?.id === teacher.id ? 'bg-indigo-50 dark:bg-indigo-950/40' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                            border ${selectedTeacher?.id === teacher.id ? 'border-indigo-200 dark:border-indigo-800' : 'border-transparent'}
                          `}
                          onClick={() => {
                            // Mark messages as read
                            const updatedTeacher = {
                              ...teacher,
                              unreadCount: 0,
                              messages: teacher.messages.map(msg => ({
                                ...msg,
                                read: true
                              }))
                            }
                            
                            setTeachers(teachers.map(t => 
                              t.id === teacher.id ? updatedTeacher : t
                            ))
                            
                            setSelectedTeacher(updatedTeacher)
                            setSelectedStaff(null)
                          }}
                        >
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={teacher.image} alt={teacher.name} />
                            <AvatarFallback className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                              {teacher.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between w-full">
                              <p className="font-medium text-base truncate pr-2">{teacher.name}</p>
                              {teacher.unreadCount > 0 && (
                                <Badge className="ml-auto flex-shrink-0 bg-indigo-500 text-xs">{teacher.unreadCount}</Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{teacher.subject}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="staff" className="m-0 flex-1 overflow-hidden">
                  <ScrollArea className="h-[calc(100vh-300px)]">
                    <div className="p-4 space-y-3">
                      {staffMembers.map((staff) => (
                        <div
                          key={staff.id}
                          className={`
                            p-4 rounded-lg flex items-center gap-3 cursor-pointer transition-colors
                            ${selectedStaff?.id === staff.id ? 'bg-indigo-50 dark:bg-indigo-950/40' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                            border ${selectedStaff?.id === staff.id ? 'border-indigo-200 dark:border-indigo-800' : 'border-transparent'}
                          `}
                          onClick={() => {
                            setSelectedStaff(staff)
                            setSelectedTeacher(null)
                          }}
                        >
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={staff.image} alt={staff.name} />
                            <AvatarFallback className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                              {staff.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-base truncate">{staff.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{staff.role}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Main content - adjusted to 8 columns */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {selectedTeacher ? (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <Card className="h-[calc(100vh-220px)] flex flex-col">
                    <CardHeader className="pb-3 border-b flex-shrink-0">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={selectedTeacher.image} alt={selectedTeacher.name} />
                            <AvatarFallback className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                              {selectedTeacher.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle>{selectedTeacher.name}</CardTitle>
                            <CardDescription>{selectedTeacher.subject}</CardDescription>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleCloseChat}>
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <div className="flex-1 overflow-hidden">
                      <ScrollArea className="h-full p-4">
                        <div className="space-y-4 pb-4">
                          {selectedTeacher.messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.sender === 'parent' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`
                                  max-w-[80%] p-4 rounded-lg shadow-sm
                                  ${message.sender === 'parent' 
                                    ? 'bg-indigo-500 text-white rounded-tr-none' 
                                    : 'bg-gray-100 dark:bg-gray-800 rounded-tl-none border border-gray-200 dark:border-gray-700'}
                                `}
                              >
                                <p className="break-words">{message.text}</p>
                                <p className={`
                                  text-xs mt-2
                                  ${message.sender === 'parent' 
                                    ? 'text-indigo-100' 
                                    : 'text-gray-500 dark:text-gray-400'}
                                `}>
                                  {format(message.timestamp, "MMM d, h:mm a")}
                                </p>
                              </div>
                            </div>
                          ))}
                          <div ref={messageEndRef} />
                        </div>
                      </ScrollArea>
                    </div>
                    <CardFooter className="pt-3 border-t mt-auto flex-shrink-0">
                      <div className="flex w-full gap-2">
                        <Input
                          type="text"
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                          className="flex-1"
                        />
                        <Button onClick={handleSendMessage} className="bg-indigo-600 hover:bg-indigo-700">
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ) : selectedStaff ? (
                <motion.div
                  key="staff-profile"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <Card className="h-[calc(100vh-220px)] overflow-hidden flex flex-col">
                    <CardHeader className="pb-3 border-b flex-shrink-0">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={selectedStaff.image} alt={selectedStaff.name} />
                            <AvatarFallback className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                              {selectedStaff.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle>{selectedStaff.name}</CardTitle>
                            <CardDescription>{selectedStaff.role}</CardDescription>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleCloseChat}>
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <div className="flex-1 overflow-hidden">
                      <ScrollArea className="h-full">
                        <CardContent className="pt-6">
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-lg font-medium mb-3">Contact Information</h3>
                              <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                  <div className="bg-indigo-50 dark:bg-indigo-900/50 p-2 rounded-full">
                                    <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                  </div>
                                  <p>{selectedStaff.email}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="bg-indigo-50 dark:bg-indigo-900/50 p-2 rounded-full">
                                    <Phone className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                  </div>
                                  <p>{selectedStaff.phone}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="bg-indigo-50 dark:bg-indigo-900/50 p-2 rounded-full">
                                    <School className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                  </div>
                                  <p>Lincoln High School</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="border-t pt-6">
                              <h3 className="text-lg font-medium mb-3">Office Hours</h3>
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <div className="bg-indigo-50 dark:bg-indigo-900/50 p-2 rounded-full">
                                    <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                  </div>
                                  <p>Monday - Friday: 8:00 AM - 4:00 PM</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="border-t pt-6">
                              <h3 className="text-lg font-medium mb-3">Send a Message</h3>
                              <div className="space-y-4">
                                <Input 
                                  type="text" 
                                  placeholder="Subject" 
                                  className="w-full"
                                />
                                <Textarea 
                                  placeholder="Type your message here..." 
                                  className="w-full" 
                                  rows={5}
                                />
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                                  <Send className="h-4 w-4 mr-2" />
                                  Send Message
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </ScrollArea>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <Card className="h-[calc(100vh-220px)] flex flex-col items-center justify-center p-8">
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-full mb-4">
                      <MessageCircle className="h-16 w-16 text-indigo-500" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">
                      Select a Conversation
                    </h3>
                    <p className="text-center text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                      Choose a teacher or staff member from the list to view your conversation or start a new one.
                    </p>
                    <Button onClick={() => setShowNewMessageForm(true)} className="bg-indigo-600 hover:bg-indigo-700">
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Start a New Conversation
                    </Button>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )
}