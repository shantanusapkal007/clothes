-- Enable Row Level Security on all tables
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bill_items" ENABLE ROW LEVEL SECURITY;

-- Create policies for products table
-- Authenticated users can read all products
CREATE POLICY "Products are readable by authenticated users"
  ON "products"
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Service role (backend) can do all operations
CREATE POLICY "Products full access for service role"
  ON "products"
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create policies for bills table
-- Authenticated users can read all bills
CREATE POLICY "Bills are readable by authenticated users"
  ON "bills"
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated users can insert bills
CREATE POLICY "Bills can be created by authenticated users"
  ON "bills"
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Service role (backend) can do all operations
CREATE POLICY "Bills full access for service role"
  ON "bills"
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create policies for bill_items table
-- Authenticated users can read all bill items
CREATE POLICY "Bill items are readable by authenticated users"
  ON "bill_items"
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated users can insert bill items
CREATE POLICY "Bill items can be created by authenticated users"
  ON "bill_items"
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Service role (backend) can do all operations
CREATE POLICY "Bill items full access for service role"
  ON "bill_items"
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
