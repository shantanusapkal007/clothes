# POS System - Complete Feature Guide

## 🔍 Barcode Scanning with Price Embedding

### Standard Barcode Scan
Simply scan a product barcode to add it to the cart:
```
123456789
```

### Barcode with Embedded Price
Scan barcodes that include price information (separated by pipe `|` or colon `:`):
```
123456789|25.99
```
- Product with barcode `123456789` will be added at price Rs 25.99
- Overrides the database price

### Barcode with Price and Discount
```
123456789|25.99|10
```
- Barcode: `123456789`
- Price: Rs 25.99
- Discount: 10%

### Barcode with Price, Discount, and Quantity
```
123456789|25.99|10|2
```
- Barcode: `123456789`
- Price: Rs 25.99
- Discount: 10%
- Quantity: 2 items

### Colon Separator Format
Alternative format using colons:
```
123456789:25.99:10:2
```
Same as above, just use `:` instead of `|`

## 🖨️ Thermal Printer Setup

### Prerequisites
- USB Thermal Printer (ESC/POS compatible)
  - Compatible brands: Zebra, Epson, Honeywell, Sunmi, etc.
- Modern web browser with WebUSB support (Chrome, Edge, Brave)
- USB cable connection to the device

### Connecting Printer

1. Click **⚙️ Printer Settings** button in the sidebar
2. Go to **Printer Setup** tab
3. Click **Connect New Printer**
4. Select your printer from the browser dialog
5. Confirm connected status
6. Click **Save Printer Config**

### Testing Printer
1. In Printer Settings → Printer Setup
2. Click **Test Print** button
3. Printer will output a sample bill
4. If not using USB printer, it will open print preview in browser

### Paper Width
- **80mm** (Standard) - Most common thermal printers
- **58mm** (Compact) - Smaller receipt paper
- **110mm** (Wide) - Larger format

## 📋 Bill Customization

### Configure Bill Layout

1. Click **⚙️ Printer Settings**
2. Go to **Bill Layout** tab
3. Configure:

#### Basic Information
- **Company Name** - Shown at top of bill
- **Phone Number** - Optional contact info
- **Address** - Optional location info
- **Footer Message** - Custom message at bottom

#### Printing Options
- **Font Size** - Small, Medium, or Large
- **Characters Per Line** - 30-80 characters (adjust for your printer)

#### Display Toggles
- ✓ **Show Item Details** - Display item name, quantity, price
- ✓ **Show Tax Breakdown** - Show tax amount per item
- ✓ **Show Discount Breakdown** - Show discount per item

4. Click **Save Bill Layout**

## 🛒 Bill Preview & Printing

### Before Checkout
1. Add items to cart via barcode scanning or product search
2. Adjust quantities, prices, discounts, taxes as needed
3. Click **Checkout** button
4. **Bill Preview** appears with formatted receipt
5. Review the layout and contents

### Printing Options
- **Print Bill** button uses one of these methods:
  - USB Thermal Printer (if configured & connected)
  - Browser print dialog (fallback for testing)

### Preview Features
- Fixed-width monospace font (matches thermal printer)
- Respects bill layout configuration
- Shows all line items with calculations
- Displays totals and payment summary

## 📱 Mobile Optimization Features

### Responsive Design
- **Desktop**: Two-column layout (Scanner + Search | Cart)
- **Tablet (1080px down)**: Single column, cart below products
- **Mobile (720px down)**: Optimized for touch
  - Larger buttons (16px font prevents zoom on iOS)
  - Sticky cart panel at top
  - Compact product grid (150px cards)
  - Fixed-width input for better UX

### Mobile Scanner Tips
1. Use device camera for barcode scanning
2. Keep scanner at `environment` facing mode
3. Adequate lighting improves scan speed
4. Can also type barcode manually

### Mobile Printing
- Browser print dialog supports mobile printers
- Test print feature works on all devices
- Bill preview responsive at all screen sizes

## 🔄 Workflow Example

### Scenario: Selling with Custom Price & Discount

1. **Scan item 1** (regular price from database):
   ```
   789456123
   ```
   → Product added at database price

2. **Scan item 2** (special price):
   ```
   456123789|199.99|15|1
   ```
   → Product added at Rs 199.99 with 15% discount

3. **Adjust item in cart**:
   - Edit quantity manually
   - Modify discount/tax if needed
   - Change price if required

4. **Review before checkout**:
   - Check cart totals
   - Verify discounts applied
   - Confirm tax calculations

5. **Proceed to billing**:
   - Click Checkout
   - Select payment method (Cash/Card/UPI/Mixed)
   - Review bill preview
   - Click Print Bill
   - Saves transaction automatically

## 🐛 Troubleshooting

### Barcode Not Found
- **Issue**: "Barcode not found" error
- **Solution**: Create product on-the-fly
  - System prompts to create product
  - Enter name, price, stock details
  - Product is created and added to cart

### Price Not Applied from Barcode
- **Issue**: Scanned price not overriding database price
- **Check**: 
  - Barcode format is correct (e.g., `123456789|25.99`)
  - Price is valid number
  - Check browser console for errors

### Printer Not Responding
- **Issue**: No output from printer
- **Check**:
  - USB cable securely connected
  - Printer powered on
  - Browser has permission (check security prompt)
  - Paper loaded in printer
  - Try Test Print first

### Mobile Layout Issues
- **Issue**: Components overlap or look wrong
- **Check**:
  - Using modern browser (Chrome, Safari, Edge)
  - Device zoom at 100%
  - Try portrait orientation for tablets
  - Clear browser cache if needed

## 🎯 Best Practices

1. **Barcode Generation**: Create barcodes with consistent format
   - Use printer/labeling software
   - Include prices in barcodes for faster checkout
   - Test scanning before deployment

2. **Printer Setup**: Configure once, test frequently
   - Do test print daily
   - Keep paper loaded
   - Check alignment quarterly

3. **Bill Format**: Align with store branding
   - Update company name/address
   - Add custom footer message
   - Test on actual printer paper

4. **Mobile Usage**: Keep device orientation consistent
   - Portrait for scanning
   - Landscape for large displays
   - Avoid multi-tasking while scanning

## 📊 Data Stored Locally

Configuration stored in browser localStorage:
- `printer-config` - Printer connection details
- `bill-layout-config` - Bill template settings

Clear localStorage if:
- Switching to different printer
- Resetting to default settings
- Old config causing issues

## 🔐 Security Notes

- Barcodes with prices transmitted over local network only
- Bill data saved in database with transaction ID
- USB printer communication is direct (no cloud)
- Settings stored locally on device

---

**Version**: 1.0  
**Last Updated**: April 2026
