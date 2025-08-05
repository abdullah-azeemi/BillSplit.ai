"use client"

import Image from "next/image"
import { X } from "lucide-react"

interface ReceiptPreviewProps {
  imageUrl: string
  onRemove?: () => void
}

export default function ReceiptPreview({ imageUrl, onRemove }: ReceiptPreviewProps) {
  return (
    <div className="relative bg-white rounded-xl shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Receipt Preview</h3>
        {onRemove && (
          <button onClick={onRemove} className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      <div className="relative w-full max-w-md mx-auto">
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt="Receipt preview"
          width={400}
          height={600}
          className="w-full h-auto rounded-lg shadow-md"
          style={{ objectFit: "contain" }}
        />
      </div>
    </div>
  )
}
