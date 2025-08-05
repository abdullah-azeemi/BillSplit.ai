import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData()
    const image = formData.get("image") as File

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock response - in real implementation, this would call Moondream 2 API
    const mockResponse = {
      success: true,
      items: [
        { id: "1", name: "Margherita Pizza", price: 18.99 },
        { id: "2", name: "Caesar Salad", price: 12.5 },
        { id: "3", name: "Garlic Bread", price: 6.99 },
        { id: "4", name: "Coca Cola", price: 3.5 },
        { id: "5", name: "Tiramisu", price: 8.99 },
      ],
      total: 50.97,
      tax: 4.58,
      tip: 0,
    }

    return NextResponse.json(mockResponse)
  } catch (error) {
    console.error("Error analyzing receipt:", error)
    return NextResponse.json({ error: "Failed to analyze receipt" }, { status: 500 })
  }
}

// Add a GET method for testing
export async function GET() {
  return NextResponse.json({
    message: "BillSplit.AI API is running",
    endpoint: "POST /api/analyze",
    description: "Upload a receipt image to analyze items and prices",
  })
}
