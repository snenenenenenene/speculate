import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, organizationId } = body;

    if (!email || !organizationId) {
      return NextResponse.json({ 
        error: "Missing required fields" 
      }, { status: 400 });
    }

    // For now, we'll just verify if it's a .edu email
    const isEducationalEmail = email.toLowerCase().endsWith('.edu');

    return NextResponse.json({ 
      verified: isEducationalEmail,
      message: isEducationalEmail ? 'Email verified' : 'Not an educational email'
    });
  } catch (error) {
    console.error("Error verifying school email:", error);
    return NextResponse.json(
      { error: "Failed to verify school email" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain");

    if (!domain) {
      return NextResponse.json({ 
        error: "Domain is required" 
      }, { status: 400 });
    }

    const isValid = domain.toLowerCase().endsWith('.edu');
    return NextResponse.json({ 
      isValid,
      domain,
      message: isValid 
        ? "Domain is a valid education domain" 
        : "Domain is not a valid education domain",
    });
  } catch (error) {
    console.error("Error checking school domain:", error);
    return NextResponse.json(
      { error: "Failed to check domain" },
      { status: 500 }
    );
  }
} 