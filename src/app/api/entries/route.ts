import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, query, where, orderBy, limit, getDocs, addDoc } from 'firebase/firestore'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    // const page = parseInt(searchParams.get('page') || '1')
    const limitNum = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const sortField = searchParams.get('sortField') || 'date'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    const entriesRef = collection(db, 'entries')
    let q = query(entriesRef, orderBy(sortField, sortOrder), limit(limitNum))

    if (search) {
      q = query(q, 
        where('name', '>=', search),
        where('name', '<=', search + '\uf8ff')
      )
    }

    const snapshot = await getDocs(q)
    const entries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Get total count
    const totalSnapshot = await getDocs(collection(db, 'entries'))
    const totalCount = totalSnapshot.size

    return NextResponse.json({
      entries,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum)
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
    if (!data) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 })
    }

    const formattedData = {
      ...data,
      date: new Date(data.date).toISOString(),
      accountingFees: parseFloat(data.accountingFees),
      taxConsultancy: parseFloat(data.taxConsultancy),
      consultancyFees: parseFloat(data.consultancyFees),
      taxationFees: parseFloat(data.taxationFees),
      otherCharges: parseFloat(data.otherCharges),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const docRef = await addDoc(collection(db, 'entries'), formattedData)
    return NextResponse.json({ id: docRef.id, ...formattedData })
  } catch (error) {
    console.error('Error creating entry:', error)
    return NextResponse.json(
      { error: 'Error creating entry' },
      { status: 500 }
    )
  }
}