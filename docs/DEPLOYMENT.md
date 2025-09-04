# Deployment Guide
Triangular Referral System Deployment Instructions

## Prerequisites

### System Requirements
- Node.js 18.x or higher
- MongoDB 7.x or higher
- SSL certificate for production
- Domain name configured

### Environment Setup
- Production server with minimum 2GB RAM
- CDN for static asset delivery (optional)
- Load balancer for high availability (optional)
- Monitoring and logging infrastructure

---

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database Configuration
DATABASE_URL="mongodb://username:password@host:port/database"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Admin Configuration
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="secure-admin-password"

# Application Configuration
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NODE_ENV="production"

# Payment Configuration (if using automated payments)
PAYMENT_GATEWAY_API_KEY="your-payment-gateway-key"
PAYMENT_GATEWAY_SECRET="your-payment-gateway-secret"

# Email Configuration (for notifications)
SMTP_HOST="smtp.yourdomain.com"
SMTP_PORT="587"
SMTP_USER="noreply@yourdomain.com"
SMTP_PASS="smtp-password"

# Monitoring (optional)
SENTRY_DSN="your-sentry-dsn"
ANALYTICS_ID="your-analytics-id"
```

---

## Database Setup

### 1. MongoDB Configuration

#### Production MongoDB Setup
```bash
# Install MongoDB (Ubuntu/Debian)
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### MongoDB Security Configuration
```javascript
// Create admin user
use admin
db.createUser({
  user: "admin",
  pwd: "secure-password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})

// Create application user
use triangular_system
db.createUser({
  user: "app_user",
  pwd: "app-password",
  roles: ["readWrite"]
})
```

### 2. Database Initialization

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed initial data
node scripts/restore-plans-and-admin.js
```

---

## Application Deployment

### 1. Build Process

```bash
# Install production dependencies
npm ci --only=production

# Build the application
npm run build

# Verify build
npm run start
```

### 2. Process Management

#### Using PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'triangular-referral-system',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Using Docker
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build and run Docker container
docker build -t triangular-referral-system .
docker run -d -p 3000:3000 --env-file .env triangular-referral-system
```

### 3. Reverse Proxy Configuration

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Security Configuration

### 1. SSL/TLS Setup

```bash
# Using Let's Encrypt (Certbot)
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### 2. Firewall Configuration

```bash
# UFW (Ubuntu Firewall)
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 27017  # MongoDB (restrict to application server only)
sudo ufw enable
```

### 3. MongoDB Security

```javascript
// Enable authentication in mongod.conf
security:
  authorization: enabled

// Create database-specific user
use triangular_system
db.createUser({
  user: "triangular_app",
  pwd: "secure-app-password",
  roles: [
    { role: "readWrite", db: "triangular_system" }
  ]
})
```

---

## Monitoring and Logging

### 1. Application Monitoring

#### Health Check Endpoint
```typescript
// pages/api/health.ts
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version
  });
}
```

#### PM2 Monitoring
```bash
# Monitor application
pm2 monit

# View logs
pm2 logs triangular-referral-system

# Restart application
pm2 restart triangular-referral-system
```

### 2. Database Monitoring

```javascript
// MongoDB monitoring queries
// Check database status
db.runCommand({ serverStatus: 1 })

// Monitor active connections
db.runCommand({ currentOp: true })

// Check collection statistics
db.users.stats()
db.triangles.stats()
db.transactions.stats()
```

### 3. Log Management

```bash
# Logrotate configuration
cat > /etc/logrotate.d/triangular-system << EOF
/var/log/triangular-system/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

---

## Backup and Recovery

### 1. Database Backup

#### Automated Backup Script
```bash
#!/bin/bash
# backup-mongodb.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
DB_NAME="triangular_system"

# Create backup directory
mkdir -p $BACKUP_DIR

# Perform backup
mongodump --host localhost --port 27017 --db $DB_NAME --out $BACKUP_DIR/$DATE

# Compress backup
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz -C $BACKUP_DIR $DATE

# Remove uncompressed backup
rm -rf $BACKUP_DIR/$DATE

# Keep only last 30 days of backups
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.tar.gz"
```

#### Cron Job Setup
```bash
# Add to crontab
0 2 * * * /path/to/backup-mongodb.sh >> /var/log/backup.log 2>&1
```

### 2. Application Backup

```bash
#!/bin/bash
# backup-application.sh

DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/var/www/triangular-referral-system"
BACKUP_DIR="/backups/application"

# Create backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C $APP_DIR .

# Keep only last 7 days of application backups
find $BACKUP_DIR -name "app_backup_*.tar.gz" -mtime +7 -delete
```

### 3. Recovery Procedures

#### Database Recovery
```bash
# Restore from backup
tar -xzf backup_20250101_020000.tar.gz
mongorestore --host localhost --port 27017 --db triangular_system 20250101_020000/triangular_system
```

#### Application Recovery
```bash
# Stop application
pm2 stop triangular-referral-system

# Restore application files
tar -xzf app_backup_20250101_020000.tar.gz -C /var/www/triangular-referral-system

# Restart application
pm2 start triangular-referral-system
```

---

## Performance Optimization

### 1. Database Optimization

```javascript
// Create performance indexes
db.users.createIndex({ "status": 1, "createdAt": 1 })
db.users.createIndex({ "triangleId": 1, "trianglePosition": 1 })
db.users.createIndex({ "referralCode": 1 }, { unique: true })
db.transactions.createIndex({ "status": 1, "createdAt": 1 })
db.transactions.createIndex({ "userId": 1, "type": 1 })
db.triangles.createIndex({ "planId": 1, "isComplete": 1, "createdAt": 1 })
```

### 2. Application Optimization

```javascript
// Next.js configuration
// next.config.js
module.exports = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  images: {
    domains: ['yourdomain.com'],
  },
  compress: true,
  poweredByHeader: false,
}
```

### 3. Caching Strategy

```bash
# Redis for session caching (optional)
sudo apt-get install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

---

## Scaling Considerations

### 1. Horizontal Scaling

#### Load Balancer Configuration
```nginx
upstream triangular_app {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    location / {
        proxy_pass http://triangular_app;
        # ... other proxy settings
    }
}
```

### 2. Database Scaling

#### MongoDB Replica Set
```javascript
// Initialize replica set
rs.initiate({
  _id: "triangular_rs",
  members: [
    { _id: 0, host: "mongo1:27017" },
    { _id: 1, host: "mongo2:27017" },
    { _id: 2, host: "mongo3:27017" }
  ]
})
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Test connection
mongo --host localhost --port 27017
```

#### 2. Application Startup Issues
```bash
# Check PM2 status
pm2 status

# View application logs
pm2 logs triangular-referral-system --lines 100

# Restart application
pm2 restart triangular-referral-system
```

#### 3. Triangle Assignment Issues
```javascript
// Check triangle consistency
db.triangles.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "_id",
      foreignField: "triangleId",
      as: "users"
    }
  },
  {
    $project: {
      _id: 1,
      planId: 1,
      isComplete: 1,
      userCount: { $size: "$users" },
      positions: "$users.trianglePosition"
    }
  }
])
```

### Performance Issues

#### Database Performance
```javascript
// Check slow queries
db.setProfilingLevel(2, { slowms: 100 })
db.system.profile.find().sort({ ts: -1 }).limit(5)

// Analyze query performance
db.users.find({ status: "ACTIVE" }).explain("executionStats")
```

#### Application Performance
```bash
# Monitor resource usage
htop
iostat -x 1
free -h

# Check application metrics
pm2 monit
```

---

## Maintenance Procedures

### 1. Regular Maintenance

#### Daily Tasks
- Monitor system health and performance
- Review error logs and alerts
- Check backup completion status
- Verify transaction processing

#### Weekly Tasks
- Database performance analysis
- Security log review
- User activity analysis
- System resource planning

#### Monthly Tasks
- Security updates and patches
- Database optimization and cleanup
- Performance tuning review
- Backup restoration testing

### 2. Update Procedures

#### Application Updates
```bash
# Backup current version
pm2 stop triangular-referral-system
cp -r /var/www/triangular-referral-system /backups/app_$(date +%Y%m%d)

# Deploy new version
git pull origin main
npm ci --only=production
npm run build

# Database migrations (if any)
npx prisma db push

# Restart application
pm2 start triangular-referral-system
```

#### Database Updates
```bash
# Backup before updates
mongodump --db triangular_system --out /backups/pre_update_$(date +%Y%m%d)

# Apply schema changes
npx prisma db push

# Verify data integrity
node scripts/verify-data-integrity.js
```

---

## Security Hardening

### 1. Server Security

```bash
# Update system packages
sudo apt-get update && sudo apt-get upgrade

# Configure fail2ban
sudo apt-get install fail2ban
sudo systemctl enable fail2ban

# Disable unnecessary services
sudo systemctl disable apache2  # if not needed
sudo systemctl disable mysql    # if not needed
```

### 2. Application Security

```javascript
// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

### 3. Database Security

```javascript
// MongoDB security configuration
// /etc/mongod.conf
security:
  authorization: enabled
net:
  bindIp: 127.0.0.1  # Restrict to localhost only
  port: 27017
```

---

## Disaster Recovery

### 1. Recovery Plan

#### RTO (Recovery Time Objective): 4 hours
#### RPO (Recovery Point Objective): 1 hour

### 2. Recovery Procedures

#### Complete System Failure
1. **Assess Damage**: Determine scope of failure
2. **Restore Infrastructure**: Set up new servers if needed
3. **Restore Database**: From latest backup
4. **Deploy Application**: From version control
5. **Verify Functionality**: Run health checks
6. **Resume Operations**: Notify users of restoration

#### Partial System Failure
1. **Isolate Issue**: Identify affected components
2. **Implement Workaround**: Temporary fixes if possible
3. **Restore Component**: From backups or redeploy
4. **Verify Integration**: Ensure system coherence
5. **Monitor Stability**: Watch for recurring issues

---

## Compliance and Legal

### 1. Data Protection

#### GDPR Compliance
- User consent management
- Data portability features
- Right to deletion implementation
- Privacy policy updates

#### Data Retention
```javascript
// Automated data cleanup
// Schedule: Daily at 2 AM
const cleanupOldData = async () => {
  // Remove soft-deleted users after 30 days
  await prisma.user.deleteMany({
    where: {
      status: 'DELETED',
      deletedAt: {
        lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    }
  });

  // Archive old transactions after 1 year
  await prisma.transaction.updateMany({
    where: {
      createdAt: {
        lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      }
    },
    data: { archived: true }
  });
};
```

### 2. Financial Compliance

#### Transaction Reporting
- Maintain detailed transaction logs
- Generate compliance reports
- Implement audit trails
- Monitor for suspicious activity

---

## Support and Maintenance

### 1. Support Channels

#### Technical Support
- **Email**: tech-support@yourdomain.com
- **Documentation**: https://docs.yourdomain.com
- **Status Page**: https://status.yourdomain.com

#### Business Support
- **Email**: support@yourdomain.com
- **Phone**: +1-XXX-XXX-XXXX
- **Hours**: 9 AM - 6 PM EST, Monday-Friday

### 2. Maintenance Windows

#### Scheduled Maintenance
- **Weekly**: Sundays 2:00 AM - 4:00 AM EST
- **Monthly**: First Sunday 1:00 AM - 5:00 AM EST
- **Emergency**: As needed with 2-hour notice

#### Maintenance Procedures
1. Notify users 24 hours in advance
2. Enable maintenance mode
3. Perform updates and maintenance
4. Run verification tests
5. Disable maintenance mode
6. Monitor system stability

---

## Rollback Procedures

### 1. Application Rollback

```bash
# Quick rollback using PM2
pm2 stop triangular-referral-system
cp -r /backups/app_previous /var/www/triangular-referral-system
pm2 start triangular-referral-system
```

### 2. Database Rollback

```bash
# Restore from backup
mongorestore --drop --host localhost --port 27017 --db triangular_system /backups/mongodb/backup_previous
```

---

*Deployment Guide Version 1.0 - Last Updated: January 2025*