# 🏥 MediChat: MongoDB → PostgreSQL Migration Guide

This guide will help you migrate from MongoDB to PostgreSQL with Prisma ORM.

---

## 📋 **Prerequisites**

### 1. Install PostgreSQL

#### **Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### **macOS (Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

#### **Windows:**
Download and install from: https://www.postgresql.org/download/windows/

#### **Docker (Recommended for Development):**
```bash
docker run --name medichat-postgres \
  -e POSTGRES_USER=medichat_user \
  -e POSTGRES_PASSWORD=JaVolimSvojuMamu1!\
  -e POSTGRES_DB=medichat \
  -p 5432:5432 \
  -d postgres:16-alpine
```

---

## 🚀 **Step-by-Step Migration**

### **Step 1: Create PostgreSQL Database**

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE medichat;
CREATE USER medichat_user WITH ENCRYPTED PASSWORD 'JaVolimSvojuMamu1!';
GRANT ALL PRIVILEGES ON DATABASE medichat TO medichat_user;

# Grant schema permissions
\c medichat
GRANT ALL ON SCHEMA public TO medichat_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO medichat_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO medichat_user;

# Exit psql
\q
```

### **Step 2: Configure Environment Variables**

```bash
cd backend
cp .env.example .env
```

Edit `.env` and update these values:

```env
# PostgreSQL Configuration
DATABASE_URL="postgresql://medichat_user:your_secure_password@localhost:5432/medichat?schema=public"

# Keep MongoDB URL temporarily for migration
MONGODB_URI="your_existing_mongodb_connection_string"

# Update JWT secrets (use strong random values)
JWT_SECRET="generate_a_strong_random_secret_minimum_32_chars"
REFRESH_TOKEN_SECRET="another_strong_random_secret_minimum_32_chars"
```

**Generate strong secrets:**
```bash
# On Linux/macOS:
openssl rand -base64 32

# Or using Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### **Step 3: Install Dependencies**

```bash
cd backend
npm install
```

This will install:
- `@prisma/client` - Prisma ORM client
- `prisma` (dev) - Prisma CLI
- `pg` - PostgreSQL driver
- Keeps MongoDB packages temporarily for migration

### **Step 4: Generate Prisma Client**

```bash
npm run prisma:generate
```

This reads `prisma/schema.prisma` and generates type-safe database client.

### **Step 5: Create Database Schema**

```bash
npm run prisma:migrate
```

When prompted, name the migration: `initial_schema`

This will:
- Create all tables in PostgreSQL
- Apply all constraints and indexes
- Enable UUID and pgcrypto extensions
- Set up triggers for `updated_at` columns

### **Step 6: Verify Database Schema**

```bash
# Open Prisma Studio (visual database browser)
npm run prisma:studio
```

Navigate to `http://localhost:5555` to see your empty database.

### **Step 7: Run Data Migration**

⚠️ **IMPORTANT: Backup your MongoDB database first!**

```bash
# Backup MongoDB (optional but recommended)
mongodump --uri="your_mongodb_uri" --out=./mongodb-backup

# Run migration script
npm run migrate:mongo-to-postgres
```

The script will:
- Connect to both databases
- Migrate users first (other records depend on users)
- Migrate patient medical information
- Migrate allergies, medications, medical history
- Migrate conversations with all related data
- Migrate activity logs
- Print detailed statistics

**Expected Output:**
```
🚀 Starting MongoDB to PostgreSQL Migration...

✅ Connected to MongoDB
✅ Connected to PostgreSQL

📦 Migrating Users...
✅ Users: 150/150 migrated

📦 Migrating Conversations...
✅ Conversations: 320/320 migrated
✅ Messages: 4,580/4,580 migrated
✅ Symptoms: 890/890 migrated
✅ Attachments: 125/125 migrated
✅ Prescriptions: 78/78 migrated

📦 Migrating Activity Logs...
✅ Activity Logs: 10,000/10,000 migrated

📊 MIGRATION SUMMARY
============================================================
...
🎯 OVERALL RESULTS:
  Total Records: 16,143
  Successfully Migrated: 16,143 (100.0%)
  Errors: 0
============================================================

✅ Migration completed successfully!
```

### **Step 8: Verify Migrated Data**

```bash
# Open Prisma Studio again
npm run prisma:studio
```

Check:
- ✅ All users migrated
- ✅ Patient medical info present
- ✅ Allergies and medications migrated
- ✅ Conversations with messages
- ✅ Prescriptions linked correctly
- ✅ Activity logs present

### **Step 9: Update Backend Code**

The backend needs to be updated to use Prisma instead of Mongoose.

**Key files to update:**
1. `server.js` - Replace MongoDB connection with Prisma
2. `models/*` - Delete Mongoose models (schema is now in Prisma)
3. `routes/*` - Update all queries to use Prisma syntax
4. `middleware/auth.js` - Update user queries
5. `services/activityLogger.js` - Update logging

**Example of changes needed:**

**Before (Mongoose):**
```javascript
const user = await User.findById(userId);
const users = await User.find({ role: 'doctor' });
```

**After (Prisma):**
```javascript
const { prisma } = require('./config/database');

const user = await prisma.user.findUnique({ where: { id: userId } });
const users = await prisma.user.findMany({ where: { role: 'doctor' } });
```

### **Step 10: Test the Application**

```bash
# Start the backend
npm run dev
```

Test these critical flows:
1. ✅ User login/registration
2. ✅ Patient dashboard loads
3. ✅ Doctor can view conversations
4. ✅ Admin panel functions
5. ✅ File uploads work
6. ✅ Prescriptions generate PDFs
7. ✅ Activity logging works

---

## 🔧 **Useful Prisma Commands**

```bash
# Generate Prisma Client (run after schema changes)
npm run prisma:generate

# Create a new migration
npm run prisma:migrate

# Open database GUI
npm run prisma:studio

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# View current database schema
npx prisma db pull

# Format Prisma schema file
npx prisma format

# Validate Prisma schema
npx prisma validate
```

---

## 📊 **PostgreSQL vs MongoDB Queries**

### **Finding Records**

| Operation | MongoDB (Mongoose) | PostgreSQL (Prisma) |
|-----------|-------------------|---------------------|
| Find by ID | `User.findById(id)` | `prisma.user.findUnique({ where: { id } })` |
| Find many | `User.find({ role: 'doctor' })` | `prisma.user.findMany({ where: { role: 'doctor' } })` |
| Find first | `User.findOne({ email })` | `prisma.user.findFirst({ where: { email } })` |
| Find with relations | `User.findById(id).populate('conversations')` | `prisma.user.findUnique({ where: { id }, include: { conversationsAsPatient: true } })` |

### **Creating Records**

| Operation | MongoDB (Mongoose) | PostgreSQL (Prisma) |
|-----------|-------------------|---------------------|
| Create one | `User.create({ ... })` | `prisma.user.create({ data: { ... } })` |
| Create many | `User.insertMany([...])` | `prisma.user.createMany({ data: [...] })` |

### **Updating Records**

| Operation | MongoDB (Mongoose) | PostgreSQL (Prisma) |
|-----------|-------------------|---------------------|
| Update one | `User.findByIdAndUpdate(id, { ... })` | `prisma.user.update({ where: { id }, data: { ... } })` |
| Update many | `User.updateMany({ role: 'doctor' }, { ... })` | `prisma.user.updateMany({ where: { role: 'doctor' }, data: { ... } })` |
| Upsert | `User.findOneAndUpdate(..., { upsert: true })` | `prisma.user.upsert({ where: { ... }, update: { ... }, create: { ... } })` |

### **Deleting Records**

| Operation | MongoDB (Mongoose) | PostgreSQL (Prisma) |
|-----------|-------------------|---------------------|
| Delete one | `User.findByIdAndDelete(id)` | `prisma.user.delete({ where: { id } })` |
| Delete many | `User.deleteMany({ ... })` | `prisma.user.deleteMany({ where: { ... } })` |

---

## 🛡️ **Security Enhancements with PostgreSQL**

### **1. Enable Row-Level Security (RLS)**

```sql
-- Connect to database
psql medichat

-- Enable RLS on sensitive tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Create policy: Patients can only see their own conversations
CREATE POLICY patient_conversations_policy ON conversations
  FOR ALL
  TO medichat_user
  USING (patient_id = current_setting('app.current_user_id')::uuid);

-- Create policy: Doctors can see assigned conversations
CREATE POLICY doctor_conversations_policy ON conversations
  FOR ALL
  TO medichat_user
  USING (
    doctor_id = current_setting('app.current_user_id')::uuid
    OR status = 'awaiting_doctor'
  );
```

### **2. Enable pgAudit for HIPAA Compliance**

```bash
# Install pgAudit
sudo apt-get install postgresql-16-pgaudit

# Add to postgresql.conf
shared_preload_libraries = 'pgaudit'
pgaudit.log = 'all'
pgaudit.log_relation = on
```

### **3. Enable Encryption at Rest**

Follow PostgreSQL encryption guide for your hosting provider:
- AWS RDS: Enable encryption during creation
- Azure: Enable Transparent Data Encryption (TDE)
- On-premise: Use LUKS or similar disk encryption

---

## 🎯 **Performance Tuning**

### **Create Additional Indexes**

```sql
-- Index for searching patients by name
CREATE INDEX idx_users_full_name ON users(first_name, last_name);

-- Index for conversation search
CREATE INDEX idx_conversations_created_date ON conversations(created_at DESC);

-- Index for message search (if needed)
CREATE INDEX idx_messages_content_search ON messages USING gin(to_tsvector('english', content));
```

### **Configure PostgreSQL Settings**

Edit `/etc/postgresql/16/main/postgresql.conf`:

```conf
# Memory Settings (adjust based on your server)
shared_buffers = 256MB              # 25% of RAM
effective_cache_size = 1GB          # 50% of RAM
maintenance_work_mem = 64MB
work_mem = 16MB

# WAL Settings
wal_buffers = 16MB
checkpoint_completion_target = 0.9

# Query Planning
random_page_cost = 1.1
effective_io_concurrency = 200
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

---

## 🔄 **Rollback Plan**

If you need to rollback to MongoDB:

1. **Keep MongoDB connection active** until migration is fully tested
2. **Don't delete MongoDB data** for at least 30 days
3. **Test thoroughly** in staging before production
4. **Have database backups** before migration

To switch back temporarily:
```env
# In .env, comment out DATABASE_URL
# DATABASE_URL="postgresql://..."

# Uncomment MongoDB
MONGODB_URI="your_mongodb_uri"
```

---

## ❓ **Troubleshooting**

### **Issue: "Cannot connect to PostgreSQL"**

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-16-main.log

# Test connection
psql -U medichat_user -d medichat -h localhost -p 5432
```

### **Issue: "Prisma Client not generated"**

```bash
# Regenerate Prisma Client
npx prisma generate --force
```

### **Issue: "Migration fails with constraint errors"**

```bash
# Reset database and try again
npx prisma migrate reset
npm run migrate:mongo-to-postgres
```

### **Issue: "Some records not migrated"**

Check the migration script output for error messages. Common causes:
- Invalid data (null values where required)
- Foreign key violations (referenced user doesn't exist)
- Duplicate records

---

## 📞 **Need Help?**

- **Prisma Docs**: https://www.prisma.io/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **HIPAA Compliance**: https://www.hhs.gov/hipaa

---

## ✅ **Post-Migration Checklist**

- [ ] All users migrated successfully
- [ ] Patient medical data intact
- [ ] Conversations with messages migrated
- [ ] Prescriptions linked correctly
- [ ] Activity logs present
- [ ] Backend code updated to use Prisma
- [ ] All API endpoints tested
- [ ] Authentication works
- [ ] File uploads work
- [ ] Performance is acceptable
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Documentation updated
- [ ] Team trained on Prisma

---

**🎉 Congratulations! You're now running on a hospital-grade PostgreSQL database!**
