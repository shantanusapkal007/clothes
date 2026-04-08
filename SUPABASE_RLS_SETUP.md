# Supabase Row Level Security (RLS) Setup

## Issue
Your Supabase tables (`products`, `bills`, `bill_items`) were publicly accessible, allowing anyone to read and modify data without authentication.

## Solution
Enable Row Level Security (RLS) with restrictive policies that:
- **Block public access** by default
- **Allow authenticated users** to read data
- **Allow backend service** (via service_role token) to perform all operations

## How to Apply the Policies

### Option 1: Apply Migration (Recommended)
Run the Prisma migration that includes all RLS policies:

```bash
npx prisma migrate deploy
```

This will execute the SQL in `migrations/1_enable_rls_policies/migration.sql` which:
1. Enables RLS on all tables
2. Creates policies for each table

### Option 2: Manual Setup via Supabase Console

1. **Go to Supabase Dashboard** → Your Project → SQL Editor
2. **Copy and run this SQL:**

```sql
-- Enable Row Level Security on all tables
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bills" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bill_items" ENABLE ROW LEVEL SECURITY;

-- Create policies for products table
CREATE POLICY "Products are readable by authenticated users"
  ON "products"
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Products full access for service role"
  ON "products"
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create policies for bills table
CREATE POLICY "Bills are readable by authenticated users"
  ON "bills"
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Bills can be created by authenticated users"
  ON "bills"
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Bills full access for service role"
  ON "bills"
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create policies for bill_items table
CREATE POLICY "Bill items are readable by authenticated users"
  ON "bill_items"
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Bill items can be created by authenticated users"
  ON "bill_items"
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Bill items full access for service role"
  ON "bill_items"
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
```

3. Click **Execute**

## Verification

### Check RLS Status
Go to **Supabase Dashboard** → **Authentication** → **Policies** section to see all active policies.

### Test Access
- **Public** (unauthenticated) user: ❌ Cannot access tables
- **Authenticated** user: ✅ Can read products, bills, and bill_items
- **Service role** (backend API): ✅ Full access to all operations

## Understanding the Policies

| Action | Public | Authenticated | Service Role |
|--------|--------|---------------|--------------|
| **SELECT** | ❌ | ✅ | ✅ |
| **INSERT** | ❌ | ✅ (bills, bill_items) | ✅ |
| **UPDATE** | ❌ | ❌ | ✅ |
| **DELETE** | ❌ | ❌ | ✅ |

## Why Service Role is Special
- Your **backend API** connects using `DATABASE_URL` which includes the **service role token**
- Service role bypasses RLS policies (use with caution)
- This allows your Next.js API routes to maintain full access while clients cannot

## Security Best Practices

1. ✅ **Never expose DATABASE_URL** to the frontend
2. ✅ **Keep DATABASE_URL in `.env.local`** (not committed to git)
3. ✅ **Use RLS policies** to restrict direct database access
4. ✅ **Always validate input** in API routes
5. ✅ **Use NEXT_PUBLIC_* env vars** only for safe data

## If You Need More Granular Control

In the future, you might want policies like:
- Users can only see/edit their own bills
- Store managers can edit products
- Cashiers can create bills but not delete

Add a `user_id` or `store_id` column to track ownership:

```sql
-- Example: Bills belong to a user
CREATE POLICY "Users can view their own bills"
  ON "bills"
  FOR SELECT
  USING (auth.uid() = user_id);
```

## Next Steps

1. **Apply the migration** or run the SQL in Supabase console
2. **Test your API** - it should work normally
3. **Verify RLS is working** by checking Supabase policies dashboard
4. **Monitor logs** for any access denied errors (at `VSCODE_TARGET_SESSION_LOG`)
