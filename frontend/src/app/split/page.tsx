"use client"

import { useState } from "react"
import ItemAssignmentTable from "../../components/ItemAssignmentTable"
import SplitSummary from "../../components/SplitSummary"
import Button from "../../components/Button"

// Mock data
const mockItems = [
  { id: "1", name: "Margherita Pizza", price: 18.99 },
  { id: "2", name: "Caesar Salad", price: 12.5 },
  { id: "3", name: "Garlic Bread", price: 6.99 },
  { id: "4", name: "Coca Cola", price: 3.5 },
  { id: "5", name: "Tiramisu", price: 8.99 },
]

const mockUsers = ["Ali", "Sara", "Ahmed"]

export default function SplitPage() {
  const [assignments, setAssignments] = useState<Record<string, string>>({})

  const handleAssignmentChange = (itemId: string, person: string) => {
    setAssignments((prev) => ({
      ...prev,
      [itemId]: person,
    }))
  }

  const calculateTotals = () => {
    const totals: Record<string, number> = {}
    mockUsers.forEach((user) => {
      totals[user] = 0
    })

    mockItems.forEach((item) => {
      const assignedTo = assignments[item.id]
      if (assignedTo && totals[assignedTo] !== undefined) {
        totals[assignedTo] += item.price
      }
    })

    return totals
  }

  const handleExportPDF = () => {
    // Stub for PDF export
    alert("PDF export feature coming soon!")
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Split Your Bill</h1>
        <p className="text-gray-600">Assign items to people and see the breakdown</p>
      </div>

      {/* Assignment Table */}
      <div className="mb-8">
        <ItemAssignmentTable
          items={mockItems}
          users={mockUsers}
          assignments={assignments}
          onAssignmentChange={handleAssignmentChange}
        />
      </div>

      {/* Split Summary */}
      <div className="mb-8">
        <SplitSummary totals={calculateTotals()} />
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => window.history.back()}>
          Back to Upload
        </Button>
        <Button onClick={handleExportPDF}>Export as PDF</Button>
      </div>
    </div>
  )
}
