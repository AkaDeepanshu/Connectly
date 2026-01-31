# Features of Connectly(Tech Wise):
1. Highly Scalable as it uses redis PUB/SUB model
2. Uses Kafka message broker


## Prisma Migration & Supabase Database Sync

This section explains how to apply Prisma schema changes and sync them with a Supabase PostgreSQL database.

---

### Prerequisites

- Node.js installed
- Prisma set up in the project
- Supabase PostgreSQL database
- `DATABASE_URL` configured in `.env`

Example:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

### Step 1: Update Prisma Schema

- make required changes in: ``prisma/schema.primsa``

### Step 2: Validate Prisma Schema

```npx prisma validate```

### Step 3: Format Prisma Schema (Recommended)

```npx prisma format```

### Step 4: Create and Apply Migration

```
npx prisma migrate dev --name <migration_name>

Example:
npx prisma migrate dev --name add_delivery_status_to_message
```

### Step 5: Check Migration Status

```npx prisma migrate status```

### Step 6: Generate Prisma Client

```npx prisma generate```