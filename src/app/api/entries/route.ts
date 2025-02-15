import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const sortField = searchParams.get('sortField') || 'date'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    // Calculate skip
    const skip = (page - 1) * limit

    // Get total count for pagination
    const totalCount = await prisma.formEntry.count({
      where: {
        OR: [
          { name: { contains: search } },
          { invoiceNo: { contains: search } }
        ]
      }
    })

    // Get entries with pagination and sorting
    const entries = await prisma.formEntry.findMany({
      where: {
        OR: [
          { name: { contains: search } },
          { invoiceNo: { contains: search } }
        ]
      },
      orderBy: {
        [sortField]: sortOrder
      },
      skip,
      take: limit
    })

    return NextResponse.json({
      entries,
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    })
  } catch (error) {
    console.error('Error fetching entries:', error)
    return NextResponse.json(
      { error: 'Error fetching entries' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log('Received data:', data)

    if (!data) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 })
    }

    // Ensure date is properly formatted
    const formattedData = {
      ...data,
      date: new Date(data.date),
      accountingFees: parseFloat(data.accountingFees),
      taxConsultancy: parseFloat(data.taxConsultancy),
      consultancyFees: parseFloat(data.consultancyFees),
      taxationFees: parseFloat(data.taxationFees),
      otherCharges: parseFloat(data.otherCharges)
    }


    const entry = await prisma.formEntry.create({
      data: formattedData
    })

    return NextResponse.json(entry)
  } catch (error) {
    console.error('Detailed error:', error)
    return NextResponse.json(
      { error: 'Error creating entry', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 