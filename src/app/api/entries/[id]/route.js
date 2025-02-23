import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'

export async function DELETE(request, { params }) {
  try {
    const docRef = doc(db, 'entries', params.id)
    await deleteDoc(docRef)
    return NextResponse.json({ message: 'Entry deleted successfully' })
  } catch (error) {
    console.error('Error deleting entry:', error)
    return NextResponse.json(
      { error: 'Error deleting entry' },
      { status: 500 }
    )
  }
}

export async function GET(request, { params }) {
  try {
    const docRef = doc(db, 'entries', params.id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    return NextResponse.json({ id: docSnap.id, ...docSnap.data() })
  } catch (error) {
    console.error('Error fetching entry:', error)
    return NextResponse.json(
      { error: 'Error fetching entry' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json()
    const docRef = doc(db, 'entries', params.id)

    const updateData = {
      ...data,
      date: new Date(data.date).toISOString(),
      accountingFees: parseFloat(data.accountingFees),
      taxConsultancy: parseFloat(data.taxConsultancy),
      consultancyFees: parseFloat(data.consultancyFees),
      taxationFees: parseFloat(data.taxationFees),
      otherCharges: parseFloat(data.otherCharges),
      updatedAt: new Date().toISOString()
    }

    await updateDoc(docRef, updateData)
    return NextResponse.json({ id: params.id, ...updateData })
  } catch (error) {
    console.error('Error updating entry:', error)
    return NextResponse.json(
      { error: 'Error updating entry' },
      { status: 500 }
    )
  }
}
