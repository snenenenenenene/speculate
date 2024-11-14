import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient


export async function GET() {
    const data = await prisma.chartInstance.findMany()
    return Response.json(data)
}

export async function POST(req: Request) {
    const data: any = await req.json()
    console.log(`${JSON.stringify(data)}`)
    const res = prisma.chartInstance.create({
        data: {
            content: JSON.stringify(data)
        }
    }).then(() => {
        console.log(`successfully added `)
    })
    .catch(e => {
        console.log(e)
    })
    return Response.json(res)
}
