// src/app/api/notices/route.js
import { NextResponse } from "next/server";

export async function GET() {
  const notices = [
    { id: "1", title: "お知らせ1" }
  ];
  return NextResponse.json(notices);
}