import cv2
import numpy as np
from typing import List, Tuple
from statistics import median

try:
    from rapidocr_onnxruntime import RapidOCR
    _rapid_ocr = RapidOCR()
    _USE_RAPID = True
except Exception as e:
    print(f"RapidOCR failed to load: {e}")
    print("Falling back to EasyOCR...")
    import easyocr
    _easyocr = easyocr.Reader(["en"])
    _USE_RAPID = False

from app.utils.image_utils import preprocess_image


def _group_ocr_results_into_lines(results: List[Tuple[list, str, float]]) -> List[str]:
    """Group OCR word/chunk results into human-readable lines.

    Results are (box(4 points), text, confidence). We sort by vertical
    position, cluster by y with a dynamic threshold, then sort by x within
    each line and join tokens with single spaces.
    """
    if not results:
        return []

    # Compute y centers and heights per token
    enriched = []
    heights: List[float] = []
    for box, text, conf in results:
        ys = [p[1] for p in box]
        xs = [p[0] for p in box]
        y_center = sum(ys) / 4.0
        x_center = sum(xs) / 4.0
        height = abs(ys[2] - ys[1]) if len(ys) >= 3 else (max(ys) - min(ys))
        heights.append(float(height))
        enriched.append((y_center, x_center, text))

    height_threshold = (median(heights) if heights else 12.0) * 1.6

    # Sort by y, then x
    enriched.sort(key=lambda t: (t[0], t[1]))

    lines: List[List[Tuple[float, float, str]]] = []
    for y_c, x_c, text in enriched:
        if not lines:
            lines.append([(y_c, x_c, text)])
            continue
        last_line = lines[-1]
        last_y = last_line[0][0]
        if abs(y_c - last_y) <= height_threshold:
            last_line.append((y_c, x_c, text))
        else:
            lines.append([(y_c, x_c, text)])

    # Sort tokens by x within each line and join
    joined_lines: List[str] = []
    for line in lines:
        line.sort(key=lambda t: t[1])
        tokens = [t[2] for t in line]
        joined_lines.append(" ".join(tokens))
    return joined_lines


def extractText_fromImage(imageBytes: bytes) -> list[str]:
    """
    Runs OCR on the image and returns a simple list of text lines.
    Keeps the existing return type to avoid breaking the API.
    """
    try:
        imageNp = np.frombuffer(imageBytes, np.uint8)
        image = cv2.imdecode(imageNp, cv2.IMREAD_COLOR)
        if image is None:
            return []

        image = preprocess_image(image)

        if _USE_RAPID:
            result, _ = _rapid_ocr(image)  # [(box, text, conf), ...]
            lines = _group_ocr_results_into_lines(result or [])
        else:
            detections = _easyocr.readtext(image, detail=1)
            # Normalize to (box, text, conf)
            std = [(box, text, float(conf)) for box, text, conf in detections]
            lines = _group_ocr_results_into_lines(std)

        return lines
    except Exception as e:
        print(f"OCR processing failed: {e}")
        return []


def extractText_with_boxes(imageBytes: bytes) -> List[Tuple[list, str, float]]:
    """
    Returns full OCR results including boxes and confidence.
    Useful for position-aware parsing.
    """
    try:
        imageNp = np.frombuffer(imageBytes, np.uint8)
        image = cv2.imdecode(imageNp, cv2.IMREAD_COLOR)
        if image is None:
            return []

        image = preprocess_image(image)

        if _USE_RAPID:
            result, _ = _rapid_ocr(image)
            return result or []
        else:
            # Approximate structure to match RapidOCR output
            detections = _easyocr.readtext(image, detail=1)
            converted: List[Tuple[list, str, float]] = []
            for box, text, conf in detections:
                converted.append((box, text, float(conf)))
            return converted
    except Exception as e:
        print(f"OCR processing (boxed) failed: {e}")
        return []