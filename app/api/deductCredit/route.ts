import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ statusCode: 401, message: "Unauthorized" }, { status: 401 });
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email as string },
      data: {
        credits: {
          decrement: 1, // Deduct one credit
        },
      },
    });

    return NextResponse.json({ success: true, credits: updatedUser.credits });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ statusCode: 500, message: err.message }, { status: 500 });
  }
}
