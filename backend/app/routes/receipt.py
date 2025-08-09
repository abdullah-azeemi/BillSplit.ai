from fastapi import APIRouter, UploadFile, File
from app.services.ocr import extractText_fromImage, extractText_with_boxes
from app.services.parser import parseReceipt, parseReceipt_from_boxes
from app.models.receipt import ParsedReceipt

router = APIRouter()

@router.post("/parse", response_model=ParsedReceipt)
async def parseReceiptImage(file: UploadFile = File(...)):
  contents = await file.read()
  # Prefer position-aware parsing
  boxed = extractText_with_boxes(contents)
  if boxed:
    parsed_data = parseReceipt_from_boxes(boxed)
  else:
    text_lines = extractText_fromImage(contents)
    parsed_data = parseReceipt(text_lines)
  return parsed_data
  