# Barcode Label Generation Guide

## Quick Start Examples

### Using Label Printing Software (Recommended)

Most thermal label printers come with software. Generate barcodes with embedded data:

#### Example Barcodes to Print

```
Product: T-Shirt White (XL)
Barcode: 901234567|299.99|0|1

Product: Jeans Blue (32)
Barcode: 901234568|1299.99|10|1

Product: Clearance - Any Item
Barcode: 901234999|149.99|25|1
```

### Format Reference

```
BARCODE|PRICE|DISCOUNT_PERCENT|QUANTITY
```

- **BARCODE**: Unique product identifier (no spaces)
- **PRICE**: Selling price in rupees (e.g., 299.99)
- **DISCOUNT_PERCENT**: Optional discount (0-100%)
- **QUANTITY**: Optional quantity (defaults to 1)

### Examples with Explanations

#### Basic Barcode (no custom price)
```
ABC123456789
```
- Uses price from database
- Simple product identification

#### Barcode with Fixed Price
```
ABC123456789|499.50
```
- Product "ABC123456789" always Rs 499.50
- Ignores database price
- Good for overstock/sales

#### Barcode with Discount Campaign
```
ABC123456789|999.99|20
```
- Price: Rs 999.99
- Discount: 20% off
- Good for promotional items

#### Barcode for Bulk Purchase
```
ABC123456789|249.99|0|5
```
- Price per unit: Rs 249.99
- Add 5 items in one scan
- Great for combo packs

#### Mixed Format (with colon separator)
```
ABC123456789:299.99:15:1
```
- Same as pipe format
- Can use either `:` or `|`
- A matter of preference

### Real-World Examples

#### T-Shirt Inventory
```
TSHIRT001|249.99|0|1    # Red T-Shirt
TSHIRT002|249.99|0|1    # Blue T-Shirt
TSHIRT003|199.99|25|1   # White T-Shirt (sale)
```

#### Jeans Collection
```
JEANS001|1299.99|0|1    # Brand A Jeans
JEANS002|1199.99|0|1    # Brand B Jeans
JEANS003|999.99|10|1    # Brand C Jeans (discount)
```

#### Bundle/Combo Offer
```
BUNDLE001|1499.99|0|3   # T-Shirt Bundle (3 items)
BUNDLE002|2999.99|20|5  # Party Combo (5 items, 20% off)
```

### Seasonal Sales Examples

#### Summer Clearance
```
CLEARANCE001|399.99|50|1    # 50% off summer collections
CLEARANCE002|599.99|40|1    # 40% off premium items
CLEARANCE003|299.99|60|1    # 60% off closeout items
```

#### End of Season
```
EOFSEASON01|749.99|70|1    # 70% discount on seasonal items
```

## Label Printer Setup

### Popular Label Printer Software

#### Zebra Designer
1. Create new label
2. Add barcode field
3. Set data format
4. Include visual barcode + text
5. Print and apply

#### Epson Label Editor
1. Open label template
2. Insert barcode
3. Set embedded text format
4. Configure print settings
5. Print labels

#### Brother P-Touch
1. Select barcode type (CODE128 recommended)
2. Input barcode data with price
3. Design label layout
4. Print on label stock

### Manual Barcode Creation (if No Software)

#### Online Barcode Generators

1. Go to barcodeinc.com or similar
2. Enter your full barcode string
3. Example input: `PROD001|199.99|10`
4. Generate CODE128 or similar
5. Print sticker-sized labels

#### Excel/LibreOffice Method

1. Install barcode font (CODE128.ttf)
2. In spreadsheet column, enter: `PROD001|199.99|10`
3. Format that column with barcode font
4. Add next to product description
5. Print labels

## Scanning Tips

### QR vs Barcode

- **QR Codes**: Can hold more data, better for mobile scanning
- **CODE128 Barcodes**: Better for thermal printer labels, compact
- **EAN/UPC**: Standard format but limited customization

### Best Practices

1. **Test Before Printing**
   - Scan one test label first
   - Verify price applies correctly
   - Check quantity gets added

2. **Organize Labels**
   - Keep physical layout matching data
   - Use color bands for categories
   - Add expiry date if applicable

3. **Print Quality**
   - Use thermal printer, not ink jet
   - Ensure barcode contrast is good
   - Test on your actual scanner

4. **Label Stock**
   - Use barcode label roll stock
   - Right size for your printer (80mm common)
   - Durable material for store environment

## Batch Barcode Generation

### If Using Multiple Product Batches

```python
# Python script example to generate barcodes
products = [
    ("SHIRT001", 299.99, 0),
    ("SHIRT002", 249.99, 10),
    ("SHIRT003", 199.99, 25),
]

for code, price, discount in products:
    barcode = f"{code}|{price}|{discount}|1"
    print(barcode)
    # Output:
    # SHIRT001|299.99|0|1
    # SHIRT002|249.99|10|1
    # SHIRT003|199.99|25|1
```

### Spreadsheet Method

Create CSV with columns:
```
Product Code,Name,Price,Discount,Quantity
SHIRT001,Red T-Shirt,299.99,0,1
SHIRT002,Blue T-Shirt,249.99,10,1
SHIRT003,White T-Shirt,199.99,25,1
```

Then use concatenate formula:
```
=A2&"|"&D2&"|"&E2&"|"&F2
```

## Digital Labeling Alternative

### QR Code + Receipt Model

Instead of physical labels:
1. Generate QR code with embedded data
2. Display on printer receipt
3. Customer can scan from receipt
4. Good for online + offline inventory

### Example QR Content
```
https://pos.local?product=SHIRT001&price=299.99&discount=0
```

## Troubleshooting Labels

### Common Issues

**Barcode won't scan**
- Check barcode quality/darkness
- Verify format is readable CODE128
- Ensure barcode text visible below barcode
- Try different angle/lighting

**Price doesn't apply**
- Verify barcode in system database
- Check price format (use decimal: 299.99)
- Ensure no extra spaces in barcode

**Barcode too small**
- Increase barcode size on label
- Minimum 15mm x 15mm recommended
- Adjust quiet zone (margins)

**Label peeling off**
- Use proper adhesive label stock
- Clean surface before applying
- Press firmly for 5 seconds
- Let adhesive set for 24 hours

## Barcode Standards

### Recommended: CODE128
- Compact representation
- Readable by all barcode scanners
- Supports numbers and symbols
- Perfect for POS systems

### Alternative: EAN-13
- Standard retail barcode
- Limited to 13 digits
- Hard to embed full price
- Use for standard products only

### Not Recommended: QR for Thermal
- QR has error correction
- Better for mobile scanning
- Larger printed size needed
- Overkill for POS barcodes

---

## Production Checklist

- [ ] Barcode format standardized
- [ ] Test barcode scans correctly
- [ ] Prices embed correctly
- [ ] Labels print quality OK
- [ ] Label adhesive working
- [ ] Storage location organized
- [ ] Staff trained on format
- [ ] Backup barcode plan in place
- [ ] Label printer supplies stocked
- [ ] Rotation strategy for old labels

---

**Ready to print!** Use your label printer software with the barcode formats provided. 🏷️
