import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// List of known education domain patterns
const EDUCATION_DOMAINS = [
  ".edu",
  ".edu.",
  ".ac.",
  ".sch.",
  "university.",
  "college.",
  "school.",
];

function isEducationDomain(domain: string): boolean {
  domain = domain.toLowerCase();
  return EDUCATION_DOMAINS.some(eduDomain => domain.includes(eduDomain));
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { organizationId, domain } = body;

    if (!organizationId || !domain) {
      return new NextResponse("Organization ID and domain are required", { status: 400 });
    }

    // Check if user has permission to verify the organization
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId: session.user.id,
        role: {
          in: ["OWNER", "ADMIN"],
        },
      },
    });

    if (!membership) {
      return new NextResponse("Not authorized to verify organization", { status: 403 });
    }

    // Check if domain is an education domain
    if (!isEducationDomain(domain)) {
      return new NextResponse("Domain is not a valid education domain", { status: 400 });
    }

    // Update organization
    const organization = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        type: "SCHOOL",
        domain,
        verified: true,
      },
    });

    // Create verification record
    await prisma.organizationVerification.create({
      data: {
        organizationId,
        verifiedBy: session.user.id,
        domain,
        type: "SCHOOL",
      },
    });

    return NextResponse.json({ organization });
  } catch (error) {
    console.error("[ORGANIZATION_VERIFY_SCHOOL]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");

    if (!domain) {
      return new NextResponse("Domain is required", { status: 400 });
    }

    const isValid = isEducationDomain(domain);
    return NextResponse.json({ 
      isValid,
      domain,
      message: isValid 
        ? "Domain is a valid education domain" 
        : "Domain is not a valid education domain",
    });
  } catch (error) {
    console.error("[ORGANIZATION_CHECK_SCHOOL]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 