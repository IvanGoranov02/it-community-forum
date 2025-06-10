import { getProfileByUsername } from "@/app/actions/profile";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { username: string } }) {
  const { username } = params;
  const result = await getProfileByUsername(username);
  return NextResponse.json(result);
} 