import re
from app.models.receipt import ParsedReceipt, Item

def parseReceipt(lines: list[str]) -> ParsedReceipt:
    items = []
    subtotal = total = tax = 0.0

    item_pattern = re.compile(r"(.+?)\s+(\d+\.\d{2})$")
    
    for line in lines:
        match = item_pattern.match(line)
        if match:
            name = match.group(1).strip()
            price = float(match.group(2))
            items.append(Item(name=name, price=price))
        elif "subtotal" in line.lower():
            subtotal = extractAmount(line)
        elif "total" in line.lower():
            total = extractAmount(line)
        elif "tax" in line.lower():
            tax = extractAmount(line)

    return ParsedReceipt(items=items, subtotal=subtotal, tax=tax, total=total)

def extractAmount(text: str) -> float:
    match = re.search(r"(\d+\.\d{2})", text)
    return float(match.group(1)) if match else 0.0
