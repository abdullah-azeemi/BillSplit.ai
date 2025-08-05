import { Users, DollarSign } from "lucide-react"

interface SplitSummaryProps {
  totals: Record<string, number>
}

export default function SplitSummary({ totals }: SplitSummaryProps) {
  const totalAmount = Object.values(totals).reduce((sum, amount) => sum + amount, 0)
  const assignedAmount = Object.values(totals)
    .filter((amount) => amount > 0)
    .reduce((sum, amount) => sum + amount, 0)

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-6 h-6 text-emerald-600" />
        <h2 className="text-xl font-semibold text-gray-900">Split Summary</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(totals).map(([person, amount]) => (
          <div
            key={person}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              amount > 0 ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{person}</span>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className={`font-bold ${amount > 0 ? "text-emerald-600" : "text-gray-500"}`}>
                  {amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center text-lg font-semibold">
          <span className="text-gray-900">Total Assigned:</span>
          <span className="text-emerald-600">${assignedAmount.toFixed(2)}</span>
        </div>
        {assignedAmount !== totalAmount && (
          <div className="mt-2 text-sm text-amber-600">
            Note: ${(totalAmount - assignedAmount).toFixed(2)} unassigned
          </div>
        )}
      </div>
    </div>
  )
}
