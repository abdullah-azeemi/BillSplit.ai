import re
from typing import Optional, List, Tuple
from statistics import median
from difflib import SequenceMatcher
from app.models.receipt import ParsedReceipt, Item


# Broad amount matcher: supports currencies, thousands separators, optional decimals
AMOUNT_RE = re.compile(
    r"(?<!\w)(?:[$€£₹]\s*)?\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{2})|(?:[$€£₹]\s*)?\d+(?:[.,]\d{2})",
    re.IGNORECASE,
)


def _parse_amount_str(amount_str: str) -> Optional[float]:
    # Remove currency symbols and spaces
    cleaned = re.sub(r"[^0-9.,]", "", amount_str)
    if not cleaned:
        return None
    # If only comma present, assume comma-decimal for formats like 12,34
    if "," in cleaned and "." not in cleaned:
        parts = cleaned.split(",")
        if len(parts) == 2 and len(parts[1]) in (1, 2):
            cleaned = cleaned.replace(",", ".")
        else:
            cleaned = cleaned.replace(",", "")
    else:
        # Dots as decimal, commas as thousands
        cleaned = cleaned.replace(",", "")
    try:
        return float(cleaned)
    except Exception:
        return None


def extractAmount(text: str) -> float:
    last = None
    for m in AMOUNT_RE.finditer(text):
        last = m.group(0)
    if not last:
        return 0.0
    value = _parse_amount_str(last)
    return float(value) if value is not None else 0.0


def parseReceipt(lines: list[str]) -> ParsedReceipt:
    items: list[Item] = []
    subtotal = 0.0
    total = 0.0
    tax = 0.0

    for raw_line in lines:
        line = raw_line.strip()
        lower = line.lower()

        # Prioritize key totals so they don't get parsed as items
        if any(k in lower for k in ["subtotal", "sub total"]):
            subtotal = extractAmount(line)
            continue
        if any(k in lower for k in ["tax", "gst", "vat"]):
            tax = extractAmount(line)
            continue
        if any(k in lower for k in ["grand total", "total amount", "total"]):
            total = extractAmount(line)
            continue

        # Try to parse item: rightmost amount in the line
        matches = list(AMOUNT_RE.finditer(line))
        if matches:
            m = matches[-1]
            price_val = _parse_amount_str(m.group(0))
            if price_val is not None:
                name = line[: m.start()].rstrip(" -:\t").strip()
                if name:
                    items.append(Item(name=name, price=float(price_val)))

    return ParsedReceipt(items=items, subtotal=subtotal, tax=tax, total=total)


def _normalize_letters(text: str) -> str:
    return re.sub(r"[^a-z]", "", text.lower())


def _fuzzy_contains(text: str, keywords: List[str], threshold: float = 0.65) -> bool:
    t = _normalize_letters(text)
    for kw in keywords:
        k = _normalize_letters(kw)
        if not k:
            continue
        if k in t:
            return True
        if SequenceMatcher(None, t, k).ratio() >= threshold:
            return True
    return False


def parseReceipt_from_boxes(results: List[Tuple[list, str, float]]) -> ParsedReceipt:
    """
    Position-aware parsing using OCR boxes. Results are list of (box, text, conf).
    Groups tokens into lines by y proximity, then extracts rightmost amount per line.
    Performs fuzzy keyword detection for subtotal/tax/total even with OCR noise.
    """
    if not results:
        return ParsedReceipt(items=[], subtotal=0.0, tax=0.0, total=0.0)

    # Build token list with centers and heights
    tokens: List[Tuple[float, float, float, str]] = []  # (y, x, h, text)
    heights: List[float] = []
    for box, text, conf in results:
        xs = [p[0] for p in box]
        ys = [p[1] for p in box]
        y = sum(ys) / 4.0
        x = sum(xs) / 4.0
        h = (max(ys) - min(ys)) if ys else 0.0
        tokens.append((y, x, h, text))
        heights.append(h)

    tokens.sort(key=lambda t: (t[0], t[1]))
    threshold = (median(heights) if heights else 12.0) * 1.6

    # Group into lines
    lines: List[List[Tuple[float, float, float, str]]] = []
    for tok in tokens:
        if not lines:
            lines.append([tok])
            continue
        if abs(tok[0] - lines[-1][0][0]) <= threshold:
            lines[-1].append(tok)
        else:
            lines.append([tok])

    # Build line structures
    line_structs = []
    y_values: List[float] = []
    for ln in lines:
        ln.sort(key=lambda t: t[1])
        text_join = " ".join(t[3] for t in ln).strip()
        amounts = list(AMOUNT_RE.finditer(text_join))
        price_val = None
        if amounts:
            m = amounts[-1]
            price_val = _parse_amount_str(m.group(0))
            left_text = text_join[: m.start()].strip()
        else:
            left_text = text_join
        y_center = sum(t[0] for t in ln) / len(ln)
        y_values.append(y_center)
        line_structs.append({
            "y": y_center,
            "text": text_join,
            "left": left_text,
            "price": price_val,
        })

    # Identify totals using fuzzy keywords
    items: List[Item] = []
    subtotal = 0.0
    total = 0.0
    tax = 0.0

    for ls in line_structs:
        left = ls["left"]
        if _fuzzy_contains(left, ["subtotal", "sub total"]):
            v = ls["price"] if ls["price"] is not None else extractAmount(ls["text"]) 
            if v:
                subtotal = float(v)
            continue
        if _fuzzy_contains(left, ["salestax", "sales tax", "tax", "gst", "vat"]):
            v = ls["price"] if ls["price"] is not None else extractAmount(ls["text"]) 
            if v:
                tax = float(v)
            continue
        if _fuzzy_contains(left, ["grand total", "total amount", "total"]):
            v = ls["price"] if ls["price"] is not None else extractAmount(ls["text"]) 
            if v:
                total = float(v)
            continue

    # If no explicit total, pick the largest amount near bottom
    if not total:
        candidates = [(ls["price"], ls["y"]) for ls in line_structs if ls["price"] is not None]
        if candidates:
            total = float(max(candidates, key=lambda t: (t[0], t[1]))[0])

    # Build items, skipping obvious non-item lines
    skip_kw = [
        "qty", "item", "price", "order", "visa", "sale", "host", "cash",
        "card", "payment", "authorization", "approved", "reader"
    ]
    for ls in line_structs:
        left = ls["left"]
        price_val = ls["price"]
        if price_val is None:
            continue
        if _fuzzy_contains(left, ["subtotal", "sub total", "total", "grand", "tax", "salestax", "sales tax", "gst", "vat"]):
            continue
        if _fuzzy_contains(left, skip_kw):
            continue
        if not re.search(r"[A-Za-z]", left):
            continue
        items.append(Item(name=left, price=float(price_val)))

    if not subtotal and items:
        subtotal = round(sum(i.price for i in items), 2)
    if not tax and total and subtotal and total > subtotal:
        tax = round(total - subtotal, 2)

    return ParsedReceipt(items=items, subtotal=subtotal, tax=tax, total=total)
