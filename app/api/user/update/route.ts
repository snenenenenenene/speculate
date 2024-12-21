import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { name } = body;

    if (!name?.trim()) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const user = await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        name: name.trim(),
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[USER_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 