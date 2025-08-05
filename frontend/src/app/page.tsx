"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ImageUploader from "../components/ImageUploader"
import Button from "../components/Button"
import ReceiptPreview from "../components/ReceiptPreview"

export default function HomePage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const router = useRouter()

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl)
  }

  const handleAnalyze = async () => {
    if (!uploadedImage) return

    setIsAnalyzing(true)

    // Simulate API call
    setTimeout(() => {
      setIsAnalyzing(false)
      router.push("/split")
    }, 2000)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Bill<span className="text-emerald-600">Split</span>.AI
        </h1>
        <p className="text-lg text-gray-600">Split the bill with just a snap.</p>
      </div>

      {/* Upload Section */}
      <div className="space-y-6">
        {!uploadedImage ? (
          <ImageUploader onImageUpload={handleImageUpload} />
        ) : (
          <div className="space-y-6">
            <ReceiptPreview imageUrl={uploadedImage} />
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setUploadedImage(null)} className="flex-1">
                Upload Different Image
              </Button>
              <Button onClick={handleAnalyze} loading={isAnalyzing} className="flex-1">
                {isAnalyzing ? "Analyzing Receipt..." : "Analyze Receipt"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
