import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");
  const studentId = searchParams.get("studentId");
  const backendUrl = `${process.env.SRS_SERVER}/grade/student-course?courseId=${courseId}&studentId=${studentId}`;
  const res = await fetch(backendUrl, { method: "GET" });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}