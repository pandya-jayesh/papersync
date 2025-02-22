import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

type OrderByType = {
  [key: string]: 'asc' | 'desc' | {
    _sum?: {
      accountingFees?: boolean
      taxConsultancy?: boolean
      consultancyFees?: boolean
      taxationFees?: boolean
      otherCharges?: boolean
    }
  }
}

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

    // Base where condition
    const whereCondition = {
      OR: [
        { name: { contains: search } },
        { invoiceNo: { contains: search } }
      ]
    }

    // Create orderBy object based on sortField
    let orderBy: OrderByType = {}
    orderBy = { [sortField]: sortOrder }

    // Get total count for pagination
    const totalCount = await prisma.formEntry.count({
      where: whereCondition
    })

    // Get entries with pagination and sorting
    const entries = await prisma.formEntry.findMany({
      where: whereCondition,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        address: true,
        invoiceNo: true,
        date: true,
        accountingFees: true,
        taxConsultancy: true,
        consultancyFees: true,
        taxationFees: true,
        otherCharges: true
      }
    })

    // Calculate total amount for each entry and sort if needed
    const entriesWithTotal = entries.map(entry => ({
      ...entry,
      totalAmount: 
        entry.accountingFees +
        entry.taxConsultancy +
        entry.consultancyFees +
        entry.taxationFees +
        entry.otherCharges
    }))

    // Sort by total amount if that's the selected sort field
    if (sortField === 'totalAmount') {
      entriesWithTotal.sort((a, b) => {
        return sortOrder === 'asc' 
          ? a.totalAmount - b.totalAmount
          : b.totalAmount - a.totalAmount
      })
    }

    return NextResponse.json({
      entries: entriesWithTotal,
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