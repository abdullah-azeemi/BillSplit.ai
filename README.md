# 🧾 BillSplit.AI

BillSplit.AI is a smart, mobile-friendly app that helps groups split bills fairly using AI. Users can upload photos of receipts, and the app uses a Vision-Language Model (VLM) to extract items, prices, and totals. It can also answer natural language questions about the receipt and suggest fair splits.

## ✨ Features

- 📸 Upload receipt images (JPG, PNG, etc.)
- 🧠 Use Vision-Language Models (like Moondream 2 or LLaVA) to:
  - Parse items, prices, and totals
  - Answer questions like "Who ordered what?" or "What's the total?"
- 👥 Add group members and assign items
- 💸 Calculate and show a fair split (equal or item-based)
- 📱 Mobile-responsive frontend (built in Next.js)
- ⚡ Fast local inference using Ollama

## 🧱 Tech Stack

- **Frontend**: Next.js (App Router, Tailwind CSS)
- **Backend**: API routes (Next.js or custom Node API)
- **AI Models**: 
  - [Moondream 2](https://ollama.com/library/moondream) *(lightweight and fast)*
  - [LLaVA](https://ollama.com/library/llava) *(more accurate for receipts)*
- **Local AI Inference**: Ollama

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/abdullah-azeemi/BillSplit.ai.git
cd BILLSPLIT-AI
