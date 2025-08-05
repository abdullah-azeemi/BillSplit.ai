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
}

export default function ItemAssignmentTable({
  items,
  users,
  assignments,
  onAssignmentChange,
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
                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${item.price.toFixed(2)}</div>
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
          </tbody>
        </table>
      </div>
    </div>
  )
}
