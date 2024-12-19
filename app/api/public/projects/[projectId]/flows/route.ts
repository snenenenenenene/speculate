import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  context: { params: { projectId: string } }
) {
  const { projectId } = context.params;

  try {
    const flows = await prisma.chartInstance.findMany({
      where: {
        projectId,
        isPublished: true,
      },
      select: {
        id: true,
        name: true,
        content: true,
        version: true,
        color: true,
        onePageMode: true,
        isPublished: true,
        publishedAt: true,
        updatedAt: true,
        variables: true,
        activeVersion: {
          select: {
            id: true,
            version: true,
            content: true,
          }
        }
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ flows });
  } catch (error) {
    console.error('Error fetching flows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flows' },
      { status: 500 }
    );
  }
} 