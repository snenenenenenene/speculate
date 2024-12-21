import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const PERSONAL_VALUE = "personal" as const;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { name, description, organizationId } = body;

  if (!name) {
    return new NextResponse("Name is required", { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      organizationId: organizationId === PERSONAL_VALUE ? null : organizationId,
      userId: session.user.id,
    },
    include: {
      organization: true,
      _count: {
        select: {
          charts: true,
          collaborators: true,
        },
      },
    },
  });

  return NextResponse.json(project);
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const organizationId = searchParams.get("organizationId");

  const where = organizationId === PERSONAL_VALUE
    ? { userId: session.user.id, organizationId: null }
    : organizationId
    ? { organizationId }
    : { OR: [{ userId: session.user.id }, { organizationId: { not: null } }] };

  const projects = await prisma.project.findMany({
    where,
    include: {
      organization: true,
      _count: {
        select: {
          charts: true,
          collaborators: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return NextResponse.json({ projects });
}