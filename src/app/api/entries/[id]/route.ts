import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type RouteParams = {
  params: {
    id: string
  }
}

export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  try {
    await prisma.formEntry.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: 'Entry deleted successfully' })
  } catch (error) {
    console.error('Error deleting entry:', error)
    return NextResponse.json(
      { error: 'Error deleting entry' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: RouteParams
) {
  try {
    const entry = await prisma.formEntry.findUnique({
      where: {
        id: params.id
      }
    })

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error fetching entry:', error)
    return NextResponse.json(
      { error: 'Error fetching entry' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: RouteParams
) {
  try {
    const data = await request.json()

    const entry = await prisma.formEntry.update({
      where: {
        id: params.id
      },
      data: {
        ...data,
        date: new Date(data.date),
        accountingFees: parseFloat(data.accountingFees),
        taxConsultancy: parseFloat(data.taxConsultancy),
        consultancyFees: parseFloat(data.consultancyFees),
        taxationFees: parseFloat(data.taxationFees),
        otherCharges: parseFloat(data.otherCharges)
      }
    })

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Error updating entry:', error)
    return NextResponse.json(
      { error: 'Error updating entry' },
      { status: 500 }
    )
  }
} 