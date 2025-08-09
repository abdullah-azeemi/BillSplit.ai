"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { Upload, ImageIcon } from "lucide-react"

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string, file:File) => void
}

export default function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileUpload = useCallback(
    (file: File) => {
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          onImageUpload(result, file)
        }
        reader.readAsDataURL(file)
      }
    },
    [onImageUpload],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFileUpload(files[0])
      }
    },
    [handleFileUpload],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFileUpload(files[0])
      }
    },
    [handleFileUpload],
  )

  return (
    <div
      className={`
        border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200
        ${
          isDragOver
            ? "border-emerald-500 bg-emerald-50"
            : "border-gray-300 hover:border-emerald-400 hover:bg-emerald-50"
        }
      `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="p-4 bg-emerald-100 rounded-full">
          <Upload className="w-8 h-8 text-emerald-600" />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Receipt Image</h3>
          <p className="text-gray-600 mb-4">Drag and drop your receipt here, or click to browse</p>
        </div>

        <label className="cursor-pointer">
          <input type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
          <div className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Choose Image
          </div>
        </label>

        <p className="text-sm text-gray-500">Supports JPG, PNG, and other image formats</p>
      </div>
    </div>
  )
}
