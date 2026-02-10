/**
 * Routing Slip – opens in a new tab. Displays formal DOH/DTRAK layout.
 * Data is passed via localStorage from Outbox when user clicks "Routing Slip".
 */
import React, { useEffect, useState } from 'react'
import dohLogo from '../assets/doh-logo2.png'

interface RoutingSlipDocument {
  id: number
  documentControlNo: string
  routeNo: string
  subject: string
  documentType: string
  sourceType: string
  internalOriginatingOffice: string
  internalOriginatingEmployee: string
  externalOriginatingOffice: string
  externalOriginatingEmployee: string
  noOfPages?: string
  remarks?: string
}

interface RoutingSlipDestination {
  id: number
  routeNo: string
  sequenceNo: number
  destinationOffice: string
  employeeActionOfficer: string
  actionRequired: string
  dateReleased: string
  timeReleased: string
  dateRequired: string
  timeRequired: string
  dateReceived: string
  timeReceived: string
  remarks: string
  actionTaken: string
  remarksOnActionTaken: string
  dateActedUpon: string
  timeActedUpon: string
}

const STORAGE_KEY_DOCUMENT = 'routingSlipDocument'
const STORAGE_KEY_DESTINATIONS = 'routingSlipDestinations'

function formatDateForDisplay (dateStr: string): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-PH', { month: '2-digit', day: '2-digit', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function formatDateYMD (dateStr: string): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toISOString().slice(0, 10)
  } catch {
    return dateStr
  }
}

const RoutingSlipPage: React.FC = () => {
  const [document, setDocument] = useState<RoutingSlipDocument | null>(null)
  const [destinations, setDestinations] = useState<RoutingSlipDestination[]>([])

  useEffect(() => {
    try {
      const docStr = localStorage.getItem(STORAGE_KEY_DOCUMENT)
      const destStr = localStorage.getItem(STORAGE_KEY_DESTINATIONS)
      if (docStr) {
        const doc = JSON.parse(docStr) as RoutingSlipDocument
        setDocument(doc)
      }
      if (destStr) {
        const list = JSON.parse(destStr) as RoutingSlipDestination[]
        setDestinations(Array.isArray(list) ? list : [])
      }
    } catch {
      setDocument(null)
      setDestinations([])
    }
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const handleClose = () => {
    window.close()
  }

  const originatingOffice =
    document?.sourceType === 'External'
      ? document.externalOriginatingOffice
      : document?.internalOriginatingOffice ?? ''

  const documentDate =
    destinations.length > 0 && destinations[0].dateReleased
      ? formatDateForDisplay(destinations[0].dateReleased)
      : formatDateForDisplay(new Date().toISOString())

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No document data for Routing Slip.</p>
          <p className="text-sm text-gray-500">Open a document from Outbox and click &quot;Routing Slip&quot; to view.</p>
          <button
            type="button"
            onClick={handleClose}
            className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black print:bg-white print:text-black">
      {/* Non-print: toolbar (font/icon size matches Navbar: text-[13px], icons w-4 h-4) */}
      <div className="print:hidden sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-3 bg-gray-100 border-b border-gray-300">
        <h1 className="text-[13px] font-semibold text-gray-800">Routing Slip</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-[13px] bg-green-600 text-white rounded hover:bg-green-700"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="flex items-center gap-1.5 px-4 py-2 text-[13px] bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Close
          </button>
        </div>
      </div>

      <div className="p-8 max-w-[210mm] mx-auto">
        {/* Header: DOH emblem + title */}
        <div className="flex items-start justify-between gap-6 mb-6">
          <div className="flex-shrink-0 w-24 h-24 flex items-center justify-center">
            <img src={dohLogo} alt="Republic of the Philippines - Department of Health" className="w-full h-full object-contain" />
          </div>
          <div className="flex-1 text-center">
            <h2 className="text-[13px] font-bold uppercase tracking-wide">
              Document Tracking Information System (DTRAK)
            </h2>
            <div className="flex justify-center gap-8 mt-2 text-[13px] text-gray-600">
              <span>Revision No.</span>
              <span>Effectivity: {new Date().toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
          <div className="w-24 flex-shrink-0" />
        </div>

        {/* DTRAK 4.0 | ROUTING SLIP (text size matches Navbar: 13px) */}
        <div className="flex justify-between items-center border-b border-black pb-2 mb-4">
          <span className="text-[13px] font-medium">DTRAK 4.0</span>
          <span className="text-[13px] font-bold uppercase">Routing Slip</span>
          <span className="text-[13px]" />
        </div>

        {/* Barcode placeholder + Document Control No. */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-full max-w-xs h-12 border border-gray-400 bg-gray-50 flex items-center justify-center text-gray-500 text-[13px] mb-1">
            Barcode
          </div>
          <p className="text-[13px] font-semibold">{document.documentControlNo}</p>
        </div>

        {/* Document details: two columns */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="space-y-2">
            <p className="text-[13px]"><span className="font-semibold">ORIGINATING OFFICE:</span> {originatingOffice || '—'}</p>
            <p className="text-[13px]"><span className="font-semibold">TYPE OF DOCUMENT:</span> {document.documentType || '—'}</p>
            <p className="text-[13px]"><span className="font-semibold">SUBJECT:</span> {document.subject || '—'}</p>
          </div>
          <div className="space-y-2 text-right">
            <p className="text-[13px]"><span className="font-semibold">DATE:</span> {documentDate}</p>
          </div>
        </div>

        {/* Tracking table: smaller font and tighter padding */}
        <table className="w-full border-collapse border border-gray-800 text-[11px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-800 px-1.5 py-1 text-left font-semibold">DATE</th>
              <th className="border border-gray-800 px-1.5 py-1 text-left font-semibold">FROM</th>
              <th className="border border-gray-800 px-1.5 py-1 text-left font-semibold">TO</th>
              <th className="border border-gray-800 px-1.5 py-1 text-left font-semibold">ACTION REQUIRED/ACTION TAKEN/REMARKS</th>
              <th className="border border-gray-800 px-1.5 py-1 text-left font-semibold">DUE DATE</th>
              <th className="border border-gray-800 px-1.5 py-1 text-left font-semibold">RECEIVED BY</th>
            </tr>
          </thead>
          <tbody>
            {destinations.map((row, idx) => (
              <tr key={row.id}>
                <td className="border border-gray-800 px-1.5 py-1">{formatDateYMD(row.dateReleased) || '—'}</td>
                <td className="border border-gray-800 px-1.5 py-1">{idx === 0 ? originatingOffice || '—' : destinations[idx - 1].destinationOffice || '—'}</td>
                <td className="border border-gray-800 px-1.5 py-1">{row.destinationOffice || '—'}</td>
                <td className="border border-gray-800 px-1.5 py-1">{row.actionRequired || row.actionTaken || row.remarks || '—'}</td>
                <td className="border border-gray-800 px-1.5 py-1">{formatDateYMD(row.dateRequired) || '—'}</td>
                <td className="border border-gray-800 px-1.5 py-1">{row.employeeActionOfficer || '—'}</td>
              </tr>
            ))}
            {Array.from({ length: Math.max(0, 16 - destinations.length) }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="border border-gray-800 px-1.5 py-1 h-6">&nbsp;</td>
                <td className="border border-gray-800 px-1.5 py-1">&nbsp;</td>
                <td className="border border-gray-800 px-1.5 py-1">&nbsp;</td>
                <td className="border border-gray-800 px-1.5 py-1">&nbsp;</td>
                <td className="border border-gray-800 px-1.5 py-1">&nbsp;</td>
                <td className="border border-gray-800 px-1.5 py-1">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RoutingSlipPage
