from fastapi import APIRouter, UploadFile, File
from app.services.ocr import extractText_fromImage
from app.services.parser import parseReceipt
from app.models.receipt import ParsedReceipt

router = APIRouter()

@router.post("/parse", response_model=ParsedReceipt)
async def parseReceiptImage(file: UploadFile = File(...)):
  contents = await file.read()
  text_lines = extractText_fromImage(contents)
  parsed_data = parseReceipt(text_lines)
  return parsed_data
  