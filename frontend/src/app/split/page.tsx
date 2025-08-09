"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import ItemAssignmentTable from "../../components/ItemAssignmentTable"
import SplitSummary from "../../components/SplitSummary"
import Button from "../../components/Button"

export default function SplitPage() {
  const [assignments, setAssignments] = useState<Record<string, string>>({})
  const [items, setItems] = useState<{ id: string; name: string; price: number }[]>([])
  const [totals, setTotals] = useState<{ subtotal: number; tax: number; total: number }>({ subtotal: 0, tax: 0, total: 0 })
  const [people, setPeople] = useState<string[]>([])
  const [newPerson, setNewPerson] = useState("")

  // Load parsed data from sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("parsedReceipt")
      if (!raw) return
      const data = JSON.parse(raw) as { items: { name: string; price: number }[]; subtotal: number; tax: number; total: number }
      const withIds = data.items.map((it, idx) => ({ id: String(idx + 1), name: it.name, price: it.price }))
      setItems(withIds)
      setTotals({ subtotal: data.subtotal ?? 0, tax: data.tax ?? 0, total: data.total ?? 0 })
    } catch (e) {
      console.error("Failed to parse stored receipt", e)
    }
  }, [])

  const handleAssignmentChange = (itemId: string, person: string) => {
    setAssignments((prev) => ({
      ...prev,
      [itemId]: person,
    }))
  }

  const calculateTotals = useCallback(() => {
    const t: Record<string, number> = {}
    people.forEach((user) => {
      t[user] = 0
    })
    items.forEach((item) => {
      const assignedTo = assignments[item.id]
      if (assignedTo && t[assignedTo] !== undefined) {
        t[assignedTo] += item.price
      }
    })
    return t
  }, [assignments, items, people])

  const perPersonTotals = useMemo(() => calculateTotals(), [calculateTotals])

  const handleItemChange = (itemId: string, patch: Partial<{ name: string; price: number }>) => {
    setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, ...patch } : it)))
  }

  const handleAddItem = () => {
    const nextId = String((items.length ? Math.max(...items.map((i) => Number(i.id))) : 0) + 1)
    setItems((prev) => [...prev, { id: nextId, name: "New item", price: 0 }])
  }

  const handleAddPerson = () => {
    const name = newPerson.trim()
    if (!name) return
    if (people.includes(name)) return
    setPeople((p) => [...p, name])
    setNewPerson("")
  }

  const handleRemovePerson = (name: string) => {
    setPeople((prev) => prev.filter((p) => p !== name))
    setAssignments((prev) => {
      const next: Record<string, string> = {}
      Object.entries(prev).forEach(([itemId, person]) => {
        if (person !== name) next[itemId] = person
      })
      return next
    })
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
          items={items}
          users={people}
          assignments={assignments}
          onAssignmentChange={handleAssignmentChange}
          onItemChange={handleItemChange}
          onAddItem={handleAddItem}
        />
      </div>

      {/* Split Summary */}
      <div className="mb-8">
        <SplitSummary totals={perPersonTotals} />

        <div className="mt-6 space-y-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full">
            <div className="font-semibold text-gray-900 mb-3">People</div>
            {people.length === 0 ? (
              <div className="text-sm text-gray-500 mb-3">No people yet. Add someone below.</div>
            ) : (
              <div className="flex flex-wrap gap-2 mb-3">
                {people.map((p) => (
                  <span key={p} className="flex items-center gap-2 px-3 py-1.5 rounded-full border-2 border-emerald-200 bg-emerald-50 text-emerald-800">
                    {p}
                    <button
                      type="button"
                      aria-label={`Remove ${p}`}
                      onClick={() => handleRemovePerson(p)}
                      className="text-emerald-700 hover:text-emerald-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={newPerson}
                onChange={(e) => setNewPerson(e.target.value)}
                placeholder="Add person..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddPerson}
                className="px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Add
              </button>
            </div>
          </div>

        
          <div className="bg-white rounded-xl shadow-lg p-6 w-full">
            <div className="font-semibold text-gray-900 mb-3">Totals</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Subtotal</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={totals.subtotal}
                    onChange={(e) => setTotals((t) => ({ ...t, subtotal: parseFloat(e.target.value || "0") }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tax</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={totals.tax}
                    onChange={(e) => setTotals((t) => ({ ...t, tax: parseFloat(e.target.value || "0") }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Total</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={totals.total}
                    onChange={(e) => setTotals((t) => ({ ...t, total: parseFloat(e.target.value || "0") }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
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
