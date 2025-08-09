'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type IncidentData = {
  month: string;
  incidents: number;
};

const data: IncidentData[] = [
  { month: "Jan", incidents: 12 },
  { month: "Feb", incidents: 8 },
  { month: "Mar", incidents: 15 },
  { month: "Apr", incidents: 10 },
  { month: "May", incidents: 18 },
  { month: "Jun", incidents: 7 },
  { month: "Jul", incidents: 12 },
  { month: "Aug", incidents: 14 },
  { month: "Sep", incidents: 16 },
  { month: "Oct", incidents: 9 },
  { month: "Nov", incidents: 11 },
  { month: "Dec", incidents: 13 },
];

export default function NurseDashboard() {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900">School Nurse Dashboard</h1>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="p-3 border rounded-lg bg-white">Student A - Minor injury on playground</li>
            <li className="p-3 border rounded-lg bg-white">Student B - Allergic reaction in cafeteria</li>
            <li className="p-3 border rounded-lg bg-white">Student C - Headache reported in class</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Incident Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke="#333" />
              <YAxis stroke="#333" />
              <Tooltip />
              <Line type="monotone" dataKey="incidents" stroke="#1a202c" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Button className="bg-black text-white hover:bg-gray-800">Report New Incident</Button>
    </div>
  );
}
