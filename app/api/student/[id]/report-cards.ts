import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const backendUrl = `${process.env.SRS_SERVER}/student/${params.id}/report-cards`;
  const res = await fetch(backendUrl, { method: "GET" });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}