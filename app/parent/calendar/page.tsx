// app/parent/calendar/page.tsx
"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, MapPin, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStudent } from "../context/StudentContext";
import axios from "axios";

export interface Activity {
  _id: string;
  title: string;
  subtitle?: string;
  performBy: string; // 'Admin' | 'Teacher' | 'Student'
  createdAt: string;
  updatedAt: string;
}

export default function SchoolEvents() {
  const { selectedStudent } = useStudent();
  const [events, setEvents] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_SRS_SERVER}/activity?limit=50`);
        setEvents(res.data.data || []);
      } catch (err) {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-white p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-2 text-center text-gray-800 dark:text-white">
          School Events & Activities
        </h1>
        <div className="mb-8 text-center text-gray-600 dark:text-gray-400">
          Upcoming and recent events for all students.
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-40 text-xl font-semibold">
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CalendarIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No school events found
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {events.map((event) => (
              <Card key={event._id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="w-6 h-6 text-indigo-500" />
                    {event.title}
                    <Badge variant="outline" className="ml-2">
                      {event.performBy}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {event.subtitle && (
                    <div className="mb-2 text-sm text-muted-foreground">
                      {event.subtitle}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <Info className="w-4 h-4" />
                    Event Created: {new Date(event.createdAt).toLocaleDateString()} {new Date(event.createdAt).toLocaleTimeString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}