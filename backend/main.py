from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import torch
from transformers import VisionEncoderDecoderModel, DonutProcessor
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model_id = "mychen76/invoice-and-receipts_donut_v1"
processor = DonutProcessor.from_pretrained(model_id)
model = VisionEncoderDecoderModel.from_pretrained(model_id)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
model.eval()

@app.post("/process-image")
async def process_image(file: UploadFile = File(...)):
    try:
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        print("Image loaded:", image.size)

        prompt = "<s_receipt-v2>"
        pixel_values = processor(images=image, return_tensors="pt").pixel_values.to(device)

        outputs = model.generate(
            pixel_values,
            max_length=512,
            pad_token_id=processor.tokenizer.pad_token_id,
        )

        decoded_output = processor.batch_decode(outputs, skip_special_tokens=True)[0]
        parsed_output = processor.token2json(decoded_output)

        print("Prompt:", prompt)
        print("Decoded Output:", decoded_output)
        print("Parsed Output:", parsed_output)

        return {"text_sequence": parsed_output}

    except Exception as e:
        print("Error:", str(e))
        return {"error": f"Processing failed: {str(e)}"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "device": str(device)}
