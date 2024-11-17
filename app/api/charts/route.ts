/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";

export async function GET() {
  const data = await prisma.chartInstance.findMany();
  return Response.json(data);
}

export async function POST(req: Request) {
  const data: any = await req.json();
  console.log(`${JSON.stringify(data)}`);
  const res = prisma.chartInstance
    .create({
      data: {
        content: JSON.stringify(data),
        user: {
          connect: {
            id: data.userId, // Assuming the userId is part of the incoming data
          },
        },
      },
    })
    .then(() => {
      console.log(`successfully added `);
    })
    .catch((e) => {
      console.log(e);
    });
  return Response.json(res);
}
