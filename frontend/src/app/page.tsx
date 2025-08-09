"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ImageUploader from "../components/ImageUploader"
import Button from "../components/Button"
import ReceiptPreview from "../components/ReceiptPreview"

export default function HomePage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const router = useRouter()

  const handleImageUpload = (imageUrl: string, file: File) => {
    setUploadedImage(imageUrl)
    setUploadedFile(file)
  }

  const handleAnalyze = async () => {
    if (!uploadedFile) return

    setIsAnalyzing(true)
    try {
      const form = new FormData()
      form.append("file", uploadedFile)
      const res = await fetch("http://127.0.0.1:8000/receipt/parse", {
        method: "POST",
        body: form,
      })
      if (!res.ok) throw new Error("Backend error")
      const data = await res.json()
      sessionStorage.setItem("parsedReceipt", JSON.stringify(data))
      setIsAnalyzing(false)
      router.push("/split")
    } catch (e) {
      console.error(e)
      setIsAnalyzing(false)
      alert("Failed to analyze receipt. Is the backend running on :8000?")
    }
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
