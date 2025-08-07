import cv2
import numpy as np
import easyocr

# Try to use PaddleOCR, fallback to EasyOCR if it fails
try:
    from paddleocr import PaddleOCR
    ocrModel = PaddleOCR(use_angle_cls=True, lang='en')
    USE_PADDLE = True
except Exception as e:
    print(f"PaddleOCR failed to load: {e}")
    print("Falling back to EasyOCR...")
    ocrModel = easyocr.Reader(['en'])
    USE_PADDLE = False

def extractText_fromImage(imageBytes: bytes) -> list[str]:
    try:
        imageNp = np.frombuffer(imageBytes, np.uint8)
        image = cv2.imdecode(imageNp, cv2.IMREAD_COLOR)
        
        if USE_PADDLE:
            # Use PaddleOCR - fixed API call
            result = ocrModel.ocr(image)
            lines = []
            if result and result[0]:
                for line in result[0]:
                    lines.append(line[1][0])
        else:
            # Use EasyOCR
            result = ocrModel.readtext(image)
            lines = []
            for detection in result:
                text = detection[1]
                lines.append(text)
        
        return lines
    except Exception as e:
        print(f"OCR processing failed: {e}")
        return []