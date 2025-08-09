"use client"

import { ChevronDown } from "lucide-react"

interface Item {
  id: string
  name: string
  price: number
}

interface ItemAssignmentTableProps {
  items: Item[]
  users: string[]
  assignments: Record<string, string>
  onAssignmentChange: (itemId: string, person: string) => void
  onItemChange: (itemId: string, patch: Partial<Pick<Item, "name" | "price">>) => void
  onAddItem: () => void
}

export default function ItemAssignmentTable({
  items,
  users,
  assignments,
  onAssignmentChange,
  onItemChange,
  onAddItem,
}: ItemAssignmentTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h2 className="text-xl font-semibold text-gray-900">Assign Items</h2>
        <p className="text-gray-600 text-sm">Choose who ordered each item</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned To
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => onItemChange(item.id, { name: e.target.value })}
                    className="w-full max-w-xs text-sm font-medium text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Item name"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      value={Number.isFinite(item.price) ? item.price : 0}
                      onChange={(e) => onItemChange(item.id, { price: parseFloat(e.target.value || "0") })}
                      className="w-28 text-sm text-gray-900 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="relative">
                    <select
                      value={assignments[item.id] || ""}
                      onChange={(e) => onAssignmentChange(item.id, e.target.value)}
                      className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Select person...</option>
                      {users.map((user) => (
                        <option key={user} value={user}>
                          {user}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </td>
              </tr>
            ))}
            <tr>
              <td className="px-6 py-4">
                <button
                  type="button"
                  onClick={onAddItem}
                  className="text-emerald-700 text-sm font-semibold hover:underline"
                >
                  + Add item
                </button>
              </td>
              <td />
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
