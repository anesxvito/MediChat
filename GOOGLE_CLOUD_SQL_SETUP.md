# 🌐 Google Cloud SQL Setup Guide - HIPAA-Compliant PostgreSQL

Complete guide to setting up Google Cloud SQL for MediChat with HIPAA compliance.

---

## 📋 **Prerequisites**

1. **Google Cloud Account**
   - Sign up at: https://console.cloud.google.com
   - $300 free credit for new users (valid for 90 days)

2. **Credit Card** (required even with free tier)

3. **Enable Billing** (required for Cloud SQL)

---

## 🚀 **Step-by-Step Setup**

### **Step 1: Create Google Cloud Project**

1. Go to **Google Cloud Console**: https://console.cloud.google.com
2. Click **"Select a project"** → **"New Project"**
3. **Project Name**: `medichat-production`
4. **Organization**: (leave as "No organization" if personal)
5. Click **"Create"**
6. Wait for project creation (~30 seconds)

---

### **Step 2: Enable Cloud SQL API**

1. In the top search bar, type: **"Cloud SQL"**
2. Click **"Cloud SQL Admin API"**
3. Click **"Enable"**
4. Wait for activation (~1 minute)

---

### **Step 3: Create PostgreSQL Instance**

1. Go to **Cloud SQL** → https://console.cloud.google.com/sql/instances
2. Click **"Create Instance"**
3. Choose **"PostgreSQL"**

#### **Configure Instance:**

**Instance Info:**
- **Instance ID**: `medichat-postgres`
- **Password**: Generate a strong password (save it!)
  ```bash
  # Generate strong password:
  openssl rand -base64 32
  ```
- **Database version**: **PostgreSQL 16**
- **Region**: Choose closest to your users
  - US: `us-central1` (Iowa)
  - Europe: `europe-west1` (Belgium)
  - Asia: `asia-southeast1` (Singapore)

**Configuration Options:**

Click **"Show Configuration Options"** and set:

##### **Machine Type:**
- **Preset**: Development (you can upgrade later)
- **vCPUs**: 1 shared vCPU
- **Memory**: 1.7 GB
- **💰 Cost**: ~$10-15/month

For production with more users:
- **Preset**: Production
- **vCPUs**: 2-4 vCPUs
- **Memory**: 4-8 GB
- **💰 Cost**: ~$100-200/month

##### **Storage:**
- **Storage type**: SSD
- **Storage capacity**: 10 GB (auto-increases as needed)
- ✅ **Enable automatic storage increases**
- **Encryption**: ✅ **Google-managed encryption key** (default)

For HIPAA, optionally use:
- ✅ **Customer-managed encryption key (CMEK)** (more secure but complex)

##### **Connections:**
- **Public IP**: ✅ **Enable** (we'll secure it)
- **Private IP**: Optional (for production, recommended)

##### **Authorized Networks:**
For now, allow your IP:
1. Click **"Add Network"**
2. **Name**: `My Development IP`
3. **Network**: Your public IP (get it from https://whatismyip.com)
4. **Format**: `YOUR_IP/32` (e.g., `203.0.113.45/32`)

⚠️ **For production**: Use Cloud SQL Proxy instead (more secure)

##### **Backups:**
- ✅ **Automated backups**: Enable
- **Backup window**: Choose off-peak hours
- **Point-in-time recovery**: ✅ **Enable** (HIPAA requirement)
- **Retention**: 7 days (minimum for HIPAA: 6 years for audit logs)

##### **Maintenance:**
- **Maintenance window**: Choose off-peak hours
- **Order**: Any

##### **Flags:** (Optional - for performance tuning)
Leave default for now

4. Click **"Create Instance"**
5. **Wait 5-10 minutes** for instance creation

---

### **Step 4: Create Database and User**

Once instance is created:

1. Go to **Cloud SQL Instances** → Click your instance
2. Go to **"Databases"** tab
3. Click **"Create Database"**
   - **Database name**: `medichat`
   - Click **"Create"**

4. Go to **"Users"** tab
5. Click **"Add User Account"**
   - **User name**: `medichat_app`
   - **Password**: Generate strong password
     ```bash
     openssl rand -base64 32
     ```
   - **Host name**: Leave blank (allows from anywhere)
   - Click **"Add"**

---

### **Step 5: Get Connection Details**

1. Go to **Cloud SQL Instances** → Click your instance
2. Find **"Connect to this instance"** section
3. Copy these values:

**Connection Name Format:**
```
project-id:region:instance-name
```

Example:
```
medichat-production:us-central1:medichat-postgres
```

**Public IP Address:**
```
34.123.45.67  (example - yours will be different)
```

---

### **Step 6: Update Environment Variables**

Update your `/home/anesxvito/MediChat/backend/.env`:

```bash
# Google Cloud SQL Configuration
# Format: postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require

# Replace with YOUR values:
DATABASE_URL="postgresql://medichat_app:YOUR_PASSWORD@YOUR_PUBLIC_IP:5432/medichat?sslmode=require"

# Example:
# DATABASE_URL="postgresql://medichat_app:abc123xyz456@34.123.45.67:5432/medichat?sslmode=require"

# Keep local database as backup
DATABASE_URL_LOCAL="postgresql://medichat_user:JaVolimSvojuMamu1!@localhost:5432/medichat?schema=public"
```

**Important:**
- Replace `YOUR_PASSWORD` with the password you created
- Replace `YOUR_PUBLIC_IP` with your Cloud SQL public IP
- Add `?sslmode=require` for encrypted connection (HIPAA requirement)

---

### **Step 7: Test Connection from Local Machine**

```bash
cd /home/anesxvito/MediChat/backend

# Test connection
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.\$connect()
  .then(() => {
    console.log('✅ Connected to Google Cloud SQL!');
    return prisma.\$queryRaw\`SELECT version()\`;
  })
  .then(result => {
    console.log('PostgreSQL Version:', result[0].version);
    return prisma.\$disconnect();
  })
  .catch(err => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });
"
```

**Expected output:**
```
✅ Connected to Google Cloud SQL!
PostgreSQL Version: PostgreSQL 16.x on x86_64-pc-linux-gnu...
```

---

### **Step 8: Create Schema in Cloud SQL**

```bash
# Push Prisma schema to Cloud SQL
npx prisma db push

# Or create migration
npx prisma migrate deploy
```

**Expected output:**
```
✔ Database schema synchronized
✔ Generated Prisma Client
```

---

### **Step 9: Migrate Data to Cloud SQL**

Now migrate your data from local PostgreSQL to Cloud SQL:

```bash
# Export from local PostgreSQL
pg_dump -U medichat_user -h localhost medichat > medichat_backup.sql

# Import to Cloud SQL
# First, get Cloud SQL Auth Proxy (recommended for secure connection)
# OR import directly:

PGPASSWORD='your_cloud_sql_password' psql -h YOUR_PUBLIC_IP -U medichat_app medichat < medichat_backup.sql
```

**Better: Use the migration script:**

Update the script to use Cloud SQL:
```bash
# Temporarily set DATABASE_URL to Cloud SQL
export DATABASE_URL="postgresql://medichat_app:PASSWORD@IP:5432/medichat?sslmode=require"

# Run migration
npm run migrate:mongo-to-postgres
```

---

### **Step 10: Verify Data in Cloud SQL**

```bash
# Check tables
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.user.count()
  .then(count => {
    console.log('✅ Users in Cloud SQL:', count);
    return prisma.\$disconnect();
  });
"
```

---

## 🔒 **HIPAA Compliance Setup**

### **1. Enable Audit Logging**

1. Go to **Cloud SQL Instance** → **Edit**
2. Scroll to **"Flags"**
3. Add these flags:
   - `log_connections` = `on`
   - `log_disconnections` = `on`
   - `log_duration` = `on`
   - `log_statement` = `all`
4. Click **"Save"**

### **2. Enable Cloud Audit Logs**

1. Go to **IAM & Admin** → **Audit Logs**
2. Find **"Cloud SQL Admin API"**
3. Enable:
   - ✅ Admin Read
   - ✅ Data Read
   - ✅ Data Write
4. **Retention**: Set to **400 days** (HIPAA: 6 years recommended)

### **3. Enable Encryption**

**Data at Rest:**
- ✅ Already enabled by default (Google-managed keys)
- For stricter compliance: Use CMEK (Customer-Managed Encryption Keys)

**Data in Transit:**
- ✅ Use `?sslmode=require` in connection string (already done)

### **4. Set Up Access Controls**

1. **Create separate users for different roles:**
   ```sql
   -- Read-only user for analytics
   CREATE USER medichat_readonly WITH PASSWORD 'strong_password';
   GRANT CONNECT ON DATABASE medichat TO medichat_readonly;
   GRANT SELECT ON ALL TABLES IN SCHEMA public TO medichat_readonly;

   -- Admin user for migrations
   CREATE USER medichat_admin WITH PASSWORD 'strong_password';
   GRANT ALL PRIVILEGES ON DATABASE medichat TO medichat_admin;
   ```

2. **Enable Private IP** (production recommended):
   - Edit instance → Connections → Enable Private IP
   - Requires VPC setup

### **5. Set Up Backups**

Already configured, but verify:
- ✅ Automated daily backups
- ✅ Point-in-time recovery enabled
- ✅ Backup retention: 7 days minimum
- For HIPAA: Export backups to Cloud Storage for long-term retention

### **6. Business Associate Agreement (BAA)**

**CRITICAL FOR HIPAA:**

1. Go to: https://cloud.google.com/security/compliance/hipaa
2. Fill out **"Google Cloud HIPAA BAA Request Form"**
3. Submit required documents
4. Wait for Google to countersign (2-4 weeks)

⚠️ **You CANNOT be HIPAA compliant without a signed BAA with Google!**

---

## 🔐 **Security Best Practices**

### **1. Use Cloud SQL Auth Proxy (Recommended)**

Instead of public IP + authorized networks:

```bash
# Install Cloud SQL Auth Proxy
wget https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64 -O cloud_sql_proxy
chmod +x cloud_sql_proxy

# Run proxy
./cloud_sql_proxy -instances=PROJECT:REGION:INSTANCE=tcp:5432 &

# Update .env to use proxy
DATABASE_URL="postgresql://medichat_app:PASSWORD@localhost:5432/medichat"
```

**Benefits:**
- ✅ No need to whitelist IPs
- ✅ Automatic IAM authentication
- ✅ Encrypted connection
- ✅ More secure than public IP

### **2. Rotate Passwords Regularly**

```bash
# Every 90 days, rotate database passwords
gcloud sql users set-password medichat_app \
  --instance=medichat-postgres \
  --password=NEW_STRONG_PASSWORD
```

### **3. Enable Private IP (Production)**

1. **Create VPC** (if not exists)
2. **Enable Private IP** on Cloud SQL instance
3. **Disable Public IP**
4. Access only through VPC or Cloud SQL Proxy

### **4. Monitor Database Activity**

1. Go to **Cloud SQL** → **Operations**
2. Monitor:
   - CPU usage
   - Memory usage
   - Storage usage
   - Connection count
3. Set up **Alerts**:
   - High CPU (>80%)
   - Storage almost full (>85%)
   - Failed connection attempts

---

## 💰 **Cost Estimation**

### **Development/Testing:**
- **Instance**: db-f1-micro (1 vCPU shared, 1.7 GB)
- **Storage**: 10 GB SSD
- **Backups**: 7 days
- **💰 Monthly**: ~$10-15

### **Production (Small):**
- **Instance**: db-custom-2-4096 (2 vCPUs, 4 GB)
- **Storage**: 20 GB SSD
- **Backups**: 7 days + long-term archival
- **💰 Monthly**: ~$100-150

### **Production (Medium):**
- **Instance**: db-custom-4-8192 (4 vCPUs, 8 GB)
- **Storage**: 50 GB SSD
- **High availability**: Enabled (2x cost)
- **💰 Monthly**: ~$300-400

**Free Tier:**
- ❌ Cloud SQL **does NOT have** a free tier
- But $300 free credit covers 2-3 months

---

## 📊 **Connect to Prisma Console**

Now you can connect to **console.prisma.io**:

1. Go to: https://console.prisma.io
2. Sign up / Log in
3. **Create Project**
4. **Add Data Source**:
   - **Type**: PostgreSQL
   - **Connection String**:
     ```
     postgresql://medichat_app:PASSWORD@CLOUD_SQL_IP:5432/medichat?sslmode=require
     ```
5. Click **"Test Connection"**
6. ✅ **Connected!**

Now you can:
- View your data in the cloud
- Run queries
- Monitor performance
- Use Prisma Accelerate (optional paid feature)

---

## 🆘 **Troubleshooting**

### **Problem: "Connection timeout"**

**Solution:**
1. Check your IP is in **Authorized Networks**
2. Verify Public IP is enabled
3. Check firewall rules

### **Problem: "Password authentication failed"**

**Solution:**
1. Verify username: `medichat_app`
2. Verify password is correct
3. Check user was created properly

### **Problem: "SSL required"**

**Solution:**
Add `?sslmode=require` to connection string

### **Problem: "Too many connections"**

**Solution:**
1. Check current connections:
   ```sql
   SELECT count(*) FROM pg_stat_activity;
   ```
2. Increase max_connections (requires instance restart)
3. Use connection pooling

---

## ✅ **Post-Setup Checklist**

- [ ] Cloud SQL instance created
- [ ] Database `medichat` created
- [ ] User `medichat_app` created
- [ ] Connection tested successfully
- [ ] Schema migrated (all tables created)
- [ ] Data migrated from local PostgreSQL
- [ ] Audit logging enabled
- [ ] Backups configured
- [ ] SSL/TLS enforced
- [ ] IAM access controls set
- [ ] Monitoring/alerts configured
- [ ] BAA requested from Google (for HIPAA)
- [ ] Cost alerts set up
- [ ] Connected to Prisma Console (optional)

---

## 🚀 **Next Steps**

1. **Update backend to use Cloud SQL**
2. **Test all API endpoints**
3. **Set up staging environment**
4. **Request Google Cloud HIPAA BAA**
5. **Deploy frontend to Cloud Run or App Engine**
6. **Set up CI/CD with Cloud Build**

---

## 📞 **Support Resources**

- **Google Cloud SQL Docs**: https://cloud.google.com/sql/docs
- **Prisma + Google Cloud**: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-google-cloud
- **HIPAA Compliance**: https://cloud.google.com/security/compliance/hipaa
- **Pricing Calculator**: https://cloud.google.com/products/calculator

---

**Ready to proceed? Let me know when you've completed each step!**
