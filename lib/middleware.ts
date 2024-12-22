import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple middleware to handle requests
export async function middleware(request: NextRequest) {
  // For now, we'll allow all requests
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/api/:path*',
} 