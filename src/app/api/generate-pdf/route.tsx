import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToStream,
  Image
} from '@react-pdf/renderer'

const prisma = new PrismaClient()

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  headerTitle: {
    fontSize: 18,
    textAlign: 'center',
    textDecoration: 'underline',
    fontWeight: 'heavy',
    marginBottom: 20,
    marginTop: 10,
  },
  companyInfo: {
    textAlign: 'center',
    marginBottom: 5,
  },
  taxInvoice: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginVertical: 10,
    fontSize: 14,
  },
  section: {
    marginBottom: 10,
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    minHeight: 25,
    alignItems: 'center',
  },
  tableCol: {
    borderRightWidth: 1,
    borderRightColor: '#000',
    padding: 10,
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
  },
  descriptionCol: {
    width: '80%',
  },
  amountCol: {
    width: '20%',
    textAlign: 'right',
    paddingRight: 5,
  },
  total: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 5,
  },
  amountInWords: {
    marginTop: 10,
    fontStyle: 'italic',
  },
  bankDetails: {
    marginTop: 100,
    fontSize: 10,
  }
})

interface InvoiceData {
  name: string
  address: string
  invoiceNo: string
  date: Date
  accountingFees: number
  taxConsultancy: number
  consultancyFees: number
  taxationFees: number
  otherCharges: number
}

const InvoicePDF = ({ data }: { data: InvoiceData }) => {
  const currentYear = Number(new Date().getFullYear().toString().slice(-2)); // Gets last 2 digits (e.g. 25)
  const previousYear = currentYear - 1; // e.g. 24
  const financialYear = `${previousYear - 1}-${previousYear}`; // e.g. 23-24
  const assessmentYear = `${previousYear}-${currentYear}`; // e.g. 24-25

  const totalAmount = (
    data.accountingFees +
    data.taxConsultancy +
    data.consultancyFees +
    data.taxationFees +
    data.otherCharges
  )

  const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    const convertLessThanThousand = (n: number): string => {
      if (n === 0) return '';
      
      let result = '';
      
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
        if (n > 0) result += 'and ';
      }
      
      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      } else if (n >= 10) {
        result += teens[n - 10] + ' ';
        n = 0;
      }
      
      if (n > 0) {
        result += ones[n] + ' ';
      }
      
      return result;
    };

    if (num === 0) return 'Zero Rupees Only';

    let rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);

    let result = '';
    
    if (rupees > 0) {
      if (rupees >= 100000) {
        result += convertLessThanThousand(Math.floor(rupees / 100000)) + 'Lakh ';
        rupees %= 100000;
      }
      
      if (rupees >= 1000) {
        result += convertLessThanThousand(Math.floor(rupees / 1000)) + 'Thousand ';
        rupees %= 1000;
      }
      
      result += convertLessThanThousand(rupees);
      result += 'Rupees ';
    }

    if (paise > 0) {
      result += 'and ' + convertLessThanThousand(paise) + 'Paise ';
    }

    return result.toUpperCase() + 'ONLY';
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Company Name Centered */}
        <Text style={[styles.headerTitle, { textAlign: 'center', marginBottom: 20 }]}>
          MAHADEV ACCOUNTING & CONSULTANCY
        </Text>

        {/* Logo positioned absolutely on the left */}
        <View style={{ position: 'absolute', top: 53, left: 27 }}>
          <Image
            src="public/mahadev-logo-v.0.1.png"
            style={{ height: 100 }}
          />
        </View>

        {/* Company Info centered */}
        <View style={[styles.companyInfo, { textAlign: 'center', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#000' }]}>
          <Text>Shivparvai Tenament, Top3 Circle, Ring road,</Text>
          <Text>Bhavnagar -364002</Text>
          <Text>Phone: 8000103233</Text>
          <Text>Mail: mahadev.ac.consultancy@gmail.com</Text>
        </View>

        <Text style={styles.taxInvoice}>TAX INVOICE</Text>

        {/* Updated two-column header structure */}
        <View style={[{ marginBottom: 40 }]}> 
          <View style={[{ flexDirection: 'row' }]}>
          {/* Left Column - Bill To */}
            <View style={[{ width: '50%', borderWidth: 1, borderRightColor: '#000' }]}>
              <Text style={[styles.tableHeader, { padding: 4, borderBottomWidth: 1, borderBottomColor: '#000' }]}>
                BILL TO
              </Text>
              <Text style={{ padding: 4 }}>{data.name}</Text>
              <Text style={{ padding: 4 }}>{data.address}</Text>
            </View>

            {/* Right Column - Invoice Details */}
            <View style={[{ width: '50%' }, { flexDirection: 'row'}]}>
              <View style={[{ width: '50%' }]}>

              </View>
              <View style={[{ width: '50%' }, {borderWidth: 1, borderLeftColor: '#000'}]}>
                {/* Invoice Number */}
                <View style={[{ borderBottomWidth: 1, borderBottomColor: '#000' }]}>
                  <Text style={[styles.tableHeader, { padding: 4, borderBottomWidth: 1, borderBottomColor: '#000' }]}>
                    INVOICE NO.
                  </Text>
                  <Text style={{ padding: 4 }}>{data.invoiceNo}</Text>
                </View>
                
                {/* Date */}
                <View>
                  <Text style={[styles.tableHeader, { padding: 4, borderBottomWidth: 1, borderBottomColor: '#000' }]}>
                    DATE
                  </Text>
                  <Text style={{ padding: 4 }}>{new Date(data.date).toLocaleDateString()}</Text>
                </View>
              </View>

            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCol, styles.descriptionCol]}>
              <Text>DESCRIPTION</Text>
            </View>
            <View style={[styles.tableCol, styles.amountCol, { borderRightWidth: 0 }]}>
              <Text>AMOUNT</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, styles.descriptionCol]}>
              <Text>ACCOUNTING FEES FOR THE YEAR ENDED {financialYear}</Text>
            </View>
            <View style={[styles.tableCol, styles.amountCol, { borderRightWidth: 0 }]}>
              <Text>{data.accountingFees.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, styles.descriptionCol]}>
              <Text>TAX CONSULTANCY CHARGES FOR THE YEAR ENDED {financialYear}</Text>
            </View>
            <View style={[styles.tableCol, styles.amountCol, { borderRightWidth: 0 }]}>
              <Text>{data.taxConsultancy.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, styles.descriptionCol]}>
              <Text>ACCOUNTING CONSULTANCY FEES</Text>
            </View>
            <View style={[styles.tableCol, styles.amountCol, { borderRightWidth: 0 }]}>
              <Text>{data.consultancyFees.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, styles.descriptionCol]}>
              <Text>TAXATION MATTER FEES I.T. RETURN FILLING FEES F.Y. YEAR {financialYear}</Text>
              <Text>(ASSESSMENT YEAR {assessmentYear})</Text>
            </View>
            <View style={[styles.tableCol, styles.amountCol, { borderRightWidth: 0 }]}>
              <Text>{data.taxationFees.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={[styles.tableCol, styles.descriptionCol]}>
              <Text>OTHER PROFESSIONAL CHARGES</Text>
              <Text>(MONTHLY STOCK STATEMENT PREPARATION CHARGES)</Text>
            </View>
            <View style={[styles.tableCol, styles.amountCol, { borderRightWidth: 0 }]}>
              <Text>{data.otherCharges.toFixed(2)}</Text>
            </View>
          </View>

          <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
            <View style={[styles.tableCol, styles.descriptionCol]}>
              <Text style={{ fontWeight: 'bold', textAlign: 'center' }}>TOTAL</Text>
            </View>
            <View style={[styles.tableCol, styles.amountCol, { borderRightWidth: 0 }]}>
              <Text style={{ fontWeight: 'bold' }}>{totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.amountInWords}>
          RS. IN WORD: {numberToWords(totalAmount)}
        </Text>

        <View style={[styles.bankDetails]}>
          <Text >FOR JAYESH I PANDYA</Text>
        </View>

        <View style={{ position: 'absolute', left: 30, bottom: 50 }}>
          <Text>BANK NAME: STATE BANK OF INDIA</Text>
          <Text>ACCOUNT NO: 42201415868</Text>
          <Text>IFSC CODE: SBIN0018869</Text>
        </View>

        <View style={{ width: '170px', height: '130px', borderWidth: 1, borderColor: '#000', position: 'absolute', right: 30, bottom: 50 }}>
          <Text style={{ textAlign: 'center', padding: 4, borderBottomWidth: 1, borderBottomColor: '#000' }}>RECEIVED & CREDITED</Text>

        </View>

      </Page>
    </Document>
  )
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const invoiceNo = searchParams.get('invoiceNo')

    if (!invoiceNo) {
      return NextResponse.json({ error: 'Invoice number is required' }, { status: 400 })
    }

    // Get entry from database
    const entry = await prisma.formEntry.findFirst({
      where: {
        invoiceNo: invoiceNo
      }
    })

    if (!entry) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Generate PDF
    const pdfStream = await renderToStream(<InvoicePDF data={entry} />)

    // Convert stream to buffer
    const chunks = []
    for await (const chunk of pdfStream) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    // Return PDF
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="invoice-${invoiceNo}.pdf"`
      }
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Error generating PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
