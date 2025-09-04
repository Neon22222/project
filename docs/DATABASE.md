# Database Schema Documentation
Triangular Referral System Database Design

## Overview
The system uses MongoDB with Prisma ORM for data management. The schema is designed to support the triangular referral system with proper relationships and data integrity.

---

## Collections

### Users
Stores user account information and triangle positions.

```prisma
model User {
  id                String    @id @default(auto()) @map("_id") @db.ObjectId
  email             String    @unique
  username          String    @unique
  password          String
  status            UserStatus @default(PENDING)
  triangleId        String?   @db.ObjectId
  trianglePosition  String?
  referralCode      String    @unique
  referredBy        String?   @db.ObjectId
  planId            String    @db.ObjectId
  totalEarnings     Float     @default(0)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  deletedAt         DateTime?
  
  // Relations
  triangle          Triangle? @relation(fields: [triangleId], references: [id])
  referrer          User?     @relation("UserReferrals", fields: [referredBy], references: [id])
  referrals         User[]    @relation("UserReferrals")
  plan              Plan      @relation(fields: [planId], references: [id])
  transactions      Transaction[]
  referralBonuses   ReferralBonus[]
}

enum UserStatus {
  PENDING
  ACTIVE
  DELETED
}
```

**Indexes:**
- `email` (unique)
- `username` (unique)
- `referralCode` (unique)
- `triangleId, trianglePosition` (compound)
- `status, createdAt` (compound)

### Triangles
Represents the triangular structures with 15 positions.

```prisma
model Triangle {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  planId      String    @db.ObjectId
  isComplete  Boolean   @default(false)
  createdAt   DateTime  @default(now())
  completedAt DateTime?
  
  // Relations
  plan        Plan      @relation(fields: [planId], references: [id])
  users       User[]
}
```

**Triangle Positions:**
- **Level 1**: A (1 position)
- **Level 2**: AB1, AB2 (2 positions)
- **Level 3**: B1C1, B1C2, B2C1, B2C2 (4 positions)
- **Level 4**: C1D1, C1D2, C2D1, C2D2, C3D1, C3D2, C4D1, C4D2 (8 positions)

**Indexes:**
- `planId, isComplete, createdAt` (compound)
- `isComplete, createdAt` (compound)

### Transactions
Handles deposits and withdrawals with admin confirmation.

```prisma
model Transaction {
  id              String            @id @default(auto()) @map("_id") @db.ObjectId
  userId          String            @db.ObjectId
  type            TransactionType
  amount          Float
  status          TransactionStatus @default(PENDING)
  transactionHash String?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  confirmedAt     DateTime?
  
  // Relations
  user            User              @relation(fields: [userId], references: [id])
}

enum TransactionType {
  DEPOSIT
  WITHDRAWAL
}

enum TransactionStatus {
  PENDING
  CONFIRMING
  CONFIRMED
  REJECTED
  COMPLETED
}
```

**Indexes:**
- `userId, type` (compound)
- `status, createdAt` (compound)
- `type, status, createdAt` (compound)

### Plans
Defines the different plan tiers and pricing.

```prisma
model Plan {
  id          String     @id @default(auto()) @map("_id") @db.ObjectId
  name        String     @unique
  price       Float
  description String?
  isActive    Boolean    @default(true)
  createdAt   DateTime   @default(now())
  
  // Relations
  users       User[]
  triangles   Triangle[]
}
```

**Indexes:**
- `name` (unique)
- `isActive, price` (compound)

### ReferralBonus
Tracks referral bonuses earned by users.

```prisma
model ReferralBonus {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  referrerId  String   @db.ObjectId
  referredId  String   @db.ObjectId
  amount      Float
  planId      String   @db.ObjectId
  createdAt   DateTime @default(now())
  
  // Relations
  referrer    User     @relation(fields: [referrerId], references: [id])
  plan        Plan     @relation(fields: [planId], references: [id])
}
```

**Indexes:**
- `referrerId, createdAt` (compound)
- `referredId` (single)

---

## Data Relationships

### User → Triangle Relationship
- Each user belongs to one triangle (or none if pending)
- Each triangle can have up to 15 users
- Triangle position determines user's level and earning potential

### Referral Relationships
- Users can refer multiple other users
- Each user can have at most one referrer
- Referral bonuses are tracked separately for audit purposes

### Transaction Flow
- Users create deposit transactions when joining
- Admins confirm/reject deposit transactions
- Withdrawal transactions are auto-generated for Position A users
- All transactions maintain complete audit trail

---

## Business Logic Constraints

### Triangle Assignment Rules
1. **Default Assignment**: Oldest available triangle in user's plan
2. **Referral Assignment**: Referrer's triangle if space available
3. **Fallback Assignment**: Oldest available if referrer's triangle full
4. **Auto-Creation**: New triangle if none available

### Position Assignment Order
Positions are filled in this specific order:
1. A
2. AB1, AB2
3. B1C1, B1C2, B2C1, B2C2
4. C1D1, C1D2, C2D1, C2D2, C3D1, C3D2, C4D1, C4D2

### Triangle Completion Logic
When 15th position is filled:
1. Position A user gets automatic withdrawal transaction
2. Triangle is marked as complete
3. Two new triangles are created
4. AB1 and AB2 become A positions in new triangles
5. Remaining users are redistributed appropriately

---

## Data Validation Rules

### User Validation
- Email must be valid format and unique
- Username must be 3-20 characters, alphanumeric + underscore
- Password must be minimum 8 characters
- Referral code must exist and belong to active user

### Transaction Validation
- Amount must be positive number
- Deposit amount must match user's plan price
- Withdrawal amount calculated based on plan payout structure

### Triangle Validation
- Maximum 15 users per triangle
- Position names must follow defined structure
- Users cannot occupy multiple positions in same triangle

---

## Performance Considerations

### Indexing Strategy
- Compound indexes on frequently queried field combinations
- Unique indexes on business-critical fields
- Sparse indexes on optional fields

### Query Optimization
- Use aggregation pipelines for complex triangle calculations
- Implement proper pagination for large result sets
- Cache frequently accessed data (plans, triangle structures)

### Concurrency Handling
- Atomic operations for triangle assignment
- Proper locking for triangle completion operations
- Transaction isolation for critical business logic

---

## Data Migration Scripts

### Initial Setup
```javascript
// Create default plans
db.plans.insertMany([
  { name: "Basic", price: 100, description: "Entry level plan" },
  { name: "Premium", price: 500, description: "Mid-tier plan" },
  { name: "VIP", price: 1000, description: "Premium plan" }
]);

// Create admin user
db.users.insertOne({
  email: "admin@example.com",
  username: "admin",
  password: "$2b$10$hashedpassword",
  status: "ACTIVE",
  isAdmin: true,
  referralCode: "ADMIN001",
  planId: ObjectId("basic_plan_id")
});
```

### Data Cleanup
```javascript
// Remove soft-deleted users older than 30 days
db.users.deleteMany({
  status: "DELETED",
  deletedAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
});

// Archive completed triangles older than 90 days
db.triangles.updateMany(
  {
    isComplete: true,
    completedAt: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
  },
  { $set: { archived: true } }
);
```

---

## Backup and Recovery

### Backup Strategy
- Daily full database backups
- Hourly incremental backups during peak hours
- Transaction log backups every 15 minutes
- Offsite backup storage with 30-day retention

### Recovery Procedures
1. **Point-in-time Recovery**: Restore to specific timestamp
2. **Selective Recovery**: Restore specific collections
3. **Disaster Recovery**: Full system restoration from backups

---

## Monitoring and Alerts

### Key Metrics
- Triangle completion rate
- User registration and activation rates
- Transaction confirmation times
- System performance metrics

### Alert Conditions
- Failed triangle cycling operations
- Unusual transaction patterns
- Database performance degradation
- High error rates in API endpoints

---

## Security Considerations

### Data Protection
- Password hashing with bcrypt (minimum 10 rounds)
- Sensitive data encryption at rest
- Secure transmission with HTTPS
- Regular security audits and penetration testing

### Access Control
- Role-based permissions (User, Admin)
- API endpoint authorization
- Database connection security
- Input validation and sanitization

---

*Database Documentation Version 1.0 - Last Updated: January 2025*