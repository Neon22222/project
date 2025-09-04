# API Documentation
Triangular Referral System API Reference

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "referralCode": "optional_referral_code",
  "planId": "plan_object_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username",
    "status": "PENDING"
  }
}
```

### GET /auth/referrer
Look up referrer information by referral code.

**Query Parameters:**
- `code`: Referral code (ObjectId, username, or short code)

**Response:**
```json
{
  "success": true,
  "referrer": {
    "id": "referrer_id",
    "username": "referrer_username",
    "plan": {
      "id": "plan_id",
      "name": "Basic Plan",
      "price": 100
    }
  }
}
```

---

## User Endpoints

### GET /user/position
Get current user's triangle position and status.

**Response:**
```json
{
  "success": true,
  "position": {
    "triangleId": "triangle_id",
    "position": "AB1",
    "level": 2,
    "canWithdraw": false,
    "triangleComplete": false
  }
}
```

### GET /user/wallet
Get wallet information for deposits.

**Response:**
```json
{
  "success": true,
  "wallet": {
    "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    "qrCode": "data:image/png;base64,..."
  }
}
```

---

## Transaction Endpoints

### POST /transactions/deposit-confirm
Confirm that user has made a deposit.

**Request Body:**
```json
{
  "amount": 100,
  "transactionHash": "optional_tx_hash"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Deposit confirmation submitted",
  "transaction": {
    "id": "transaction_id",
    "status": "CONFIRMING",
    "amount": 100
  }
}
```

---

## Payout Endpoints

### POST /payout
Request withdrawal (Position A users only).

**Response:**
```json
{
  "success": true,
  "message": "Withdrawal request created",
  "transaction": {
    "id": "transaction_id",
    "type": "WITHDRAWAL",
    "status": "PENDING",
    "amount": 1500
  }
}
```

---

## Triangle Endpoints

### GET /triangle
Get triangle information and structure.

**Query Parameters:**
- `triangleId`: Optional triangle ID (defaults to user's triangle)

**Response:**
```json
{
  "success": true,
  "triangle": {
    "id": "triangle_id",
    "plan": "Basic Plan",
    "positions": {
      "A": { "username": "user1", "level": 1 },
      "AB1": { "username": "user2", "level": 2 },
      "AB2": null,
      // ... other positions
    },
    "isComplete": false,
    "filledPositions": 8,
    "totalPositions": 15
  }
}
```

---

## Admin Endpoints

### GET /admin/users
Get all users with their triangle positions (Admin only).

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": "user_id",
      "username": "username",
      "email": "user@example.com",
      "status": "ACTIVE",
      "trianglePosition": "AB1",
      "plan": "Basic Plan",
      "referralCount": 3,
      "totalEarnings": 150
    }
  ]
}
```

### PUT /admin/transactions/[id]
Confirm or reject a transaction (Admin only).

**Request Body:**
```json
{
  "action": "CONFIRM" // or "REJECT"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction confirmed successfully",
  "transaction": {
    "id": "transaction_id",
    "status": "CONFIRMED",
    "user": {
      "id": "user_id",
      "trianglePosition": "B1C1"
    }
  }
}
```

### GET /admin/triangles
Get all triangles with their structures (Admin only).

**Response:**
```json
{
  "success": true,
  "triangles": [
    {
      "id": "triangle_id",
      "plan": "Basic Plan",
      "isComplete": false,
      "filledPositions": 12,
      "totalPositions": 15,
      "createdAt": "2025-01-01T00:00:00Z",
      "positions": {
        "A": { "username": "user1", "joinedAt": "2025-01-01T00:00:00Z" },
        "AB1": { "username": "user2", "joinedAt": "2025-01-01T01:00:00Z" },
        // ... other positions
      }
    }
  ]
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message description",
  "code": "ERROR_CODE"
}
```

### Common Error Codes
- `INVALID_INPUT`: Request validation failed
- `UNAUTHORIZED`: Authentication required or failed
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Requested resource not found
- `CONFLICT`: Operation conflicts with current state
- `INTERNAL_ERROR`: Server-side error occurred

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error

---

## Rate Limiting

### Limits
- Authentication endpoints: 5 requests per minute per IP
- User endpoints: 60 requests per minute per user
- Admin endpoints: 100 requests per minute per admin

### Headers
Rate limit information is included in response headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1640995200
```

---

## Webhooks

### Transaction Status Updates
Webhook notifications for transaction status changes.

**Endpoint:** `POST /webhooks/transaction-status`

**Payload:**
```json
{
  "event": "transaction.confirmed",
  "data": {
    "transactionId": "transaction_id",
    "userId": "user_id",
    "status": "CONFIRMED",
    "timestamp": "2025-01-01T00:00:00Z"
  }
}
```

### Triangle Completion
Webhook notifications for triangle completions.

**Endpoint:** `POST /webhooks/triangle-complete`

**Payload:**
```json
{
  "event": "triangle.completed",
  "data": {
    "triangleId": "triangle_id",
    "plan": "Basic Plan",
    "completedAt": "2025-01-01T00:00:00Z",
    "withdrawalUser": {
      "id": "user_id",
      "username": "username"
    }
  }
}
```

---

## SDK Examples

### JavaScript/TypeScript
```typescript
// Initialize API client
const api = new TriangularAPI('http://localhost:3000/api', token);

// Register new user
const user = await api.auth.register({
  email: 'user@example.com',
  username: 'newuser',
  password: 'password123',
  referralCode: 'ABC123',
  planId: 'plan_id'
});

// Get user position
const position = await api.user.getPosition();

// Confirm deposit
const transaction = await api.transactions.confirmDeposit({
  amount: 100,
  transactionHash: 'tx_hash'
});
```

### cURL Examples
```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "newuser",
    "password": "password123",
    "planId": "plan_id"
  }'

# Get user position
curl -X GET http://localhost:3000/api/user/position \
  -H "Authorization: Bearer <jwt_token>"

# Admin confirm transaction
curl -X PUT http://localhost:3000/api/admin/transactions/transaction_id \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"action": "CONFIRM"}'
```

---

## Testing

### Test Environment
Base URL: `http://localhost:3000/api`

### Test Accounts
- **Admin**: admin@example.com / admin123
- **Test User 1**: user1@example.com / password123
- **Test User 2**: user2@example.com / password123

### Test Data
The system includes seeded test data:
- 3 plan tiers (Basic: $100, Premium: $500, VIP: $1000)
- Sample triangles with various completion states
- Test transactions in different statuses

---

*API Documentation Version 1.0 - Last Updated: January 2025*