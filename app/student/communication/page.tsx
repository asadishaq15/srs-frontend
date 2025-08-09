"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Book, ChevronRight, X, Send, User, Bot } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Class {
  id: number
  name: string
  teacher: string
  lastMessage: string
  unreadCount: number
}

interface Message {
  id: number
  text: string
  sender: "user" | "bot"
}

const classes: Class[] = [
  { id: 1, name: "Mathematics", teacher: "Dr. Smith", lastMessage: "Don't forget about the quiz tomorrow!", unreadCount: 2 },
  { id: 2, name: "Physics", teacher: "Prof. Johnson", lastMessage: "Lab report due next week", unreadCount: 0 },
  { id: 3, name: "Computer Science", teacher: "Ms. Lee", lastMessage: "Project presentations on Friday", unreadCount: 1 },
  { id: 4, name: "English Literature", teacher: "Mr. Brown", lastMessage: "Essay topics posted on the portal", unreadCount: 3 },
  { id: 5, name: "Chemistry", teacher: "Dr. Garcia", lastMessage: "Remember to bring your lab coats", unreadCount: 0 },
]

export default function StudentCommunication() {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (input.trim()) {
      const newMessage: Message = { id: Date.now(), text: input, sender: "user" }
      setMessages([...messages, newMessage])
      setInput("")

      // Simulate bot response
      setTimeout(() => {
        const botResponse: Message = {
          id: Date.now(),
          text: "Thank you for your message. Your teacher will respond soon.",
          sender: "bot",
        }
        setMessages((prevMessages) => [...prevMessages, botResponse])
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-gray-900 dark:to-indigo-950 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 dark:text-white">Class Communication</h1>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {classes.map((cls, index) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                onClick={() => setSelectedClass(cls)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Book className="w-5 h-5 mr-2 text-indigo-500" />
                      {cls.name}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{cls.teacher}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{cls.lastMessage}</p>
                  {cls.unreadCount > 0 && (
                    <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100">
                      {cls.unreadCount} new
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedClass && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 100 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl h-[600px] flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{selectedClass.name} - {selectedClass.teacher}</h2>
                <Button variant="ghost" size="icon" onClick={() => setSelectedClass(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <ScrollArea className="flex-grow p-6">
                {messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <p className="text-3xl text-gray-400 dark:text-gray-600">Your chat will be displayed here</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ type: "spring", damping: 15, stiffness: 100 }}
                        className={`flex mb-4  ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`flex  justify-center items-center  gap-1 ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.sender === "user" ? "bg-indigo-500" : "bg-gray-500"} mr-2`}>
                            {message.sender === "user" ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                          </div>
                          <div
                            className={`max-w-xs p-4 rounded-2xl ${
                              message.sender === "user"
                                ? "bg-indigo-500 text-white rounded-br-none"
                                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-bl-none"
                            }`}
                          >
                            {message.text}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </ScrollArea>
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    className="flex-grow rounded-full bg-gray-100 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500"
                  />
                  <Button onClick={handleSend} className="rounded-full bg-indigo-500 hover:bg-indigo-600 text-white">
                    <Send className="h-5 w-5 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
