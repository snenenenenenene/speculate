import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ 
        error: "Search query is required" 
      }, { status: 400 });
    }

    // For now, we'll just return a mock response
    return NextResponse.json({ 
      users: [
        { id: '1', name: 'Test User 1', email: 'test1@example.com' },
        { id: '2', name: 'Test User 2', email: 'test2@example.com' }
      ]
    });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
} 