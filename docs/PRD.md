# Product Requirements Document (PRD)
## Triangular Referral System

### Document Information
- **Version**: 1.0
- **Date**: January 2025
- **Status**: In Development
- **Product Owner**: Development Team

---

## 1. Executive Summary

The Triangular Referral System is a multi-level marketing platform that organizes users into triangular structures with 15 positions across 4 levels. Users make deposits to join triangles, earn referral bonuses, and receive payouts when they reach the top position.

### Key Value Propositions
- Structured earning opportunity through triangle completion
- Referral bonus system encouraging user acquisition
- Automated triangle cycling for continuous participation
- Admin-controlled transaction verification for security

---

## 2. Product Overview

### 2.1 Core Concept
Users join triangular structures by making deposits. When a triangle fills with 15 users, the top user (Position A) receives a payout and the triangle splits into two new triangles, promoting existing users to higher positions.

### 2.2 Target Users
- **Primary Users**: Individuals seeking earning opportunities through referrals
- **Secondary Users**: Admins managing transaction verification and payouts

---

## 3. Functional Requirements

### 3.1 User Management System

#### 3.1.1 Registration & Authentication
- **REQ-001**: Users must register with email, username, and password
- **REQ-002**: Optional referral code input during registration
- **REQ-003**: Secure login/logout functionality
- **REQ-004**: Password validation and security requirements

#### 3.1.2 Account States
- **REQ-005**: PENDING state after registration until deposit confirmation
- **REQ-006**: ACTIVE state after admin confirms deposit
- **REQ-007**: DELETED state after withdrawal completion or rejection

### 3.2 Deposit System

#### 3.2.1 Deposit Process
- **REQ-008**: Display wallet address/payment details after login
- **REQ-009**: "I have deposited" button to submit deposit claim
- **REQ-010**: Real-time status updates (Pending → Confirming → Confirmed/Rejected)
- **REQ-011**: Admin interface for deposit confirmation/rejection

#### 3.2.2 Plan Selection
- **REQ-012**: Multiple plan tiers with different pricing
- **REQ-013**: Automatic plan matching for referred users
- **REQ-014**: Plan upgrade/downgrade restrictions

### 3.3 Triangle System

#### 3.3.1 Triangle Structure
- **REQ-015**: 15-position triangle with 4 levels (1-2-4-8 distribution)
- **REQ-016**: Named positions (A, AB1, AB2, B1C1, B1C2, etc.)
- **REQ-017**: Level-based hierarchy and promotion rules

#### 3.3.2 Assignment Logic
- **REQ-018**: Default assignment to oldest available triangle
- **REQ-019**: Referral-based assignment to referrer's triangle
- **REQ-020**: Fallback to oldest triangle if referrer's triangle is full
- **REQ-021**: Automatic triangle creation when none available

#### 3.3.3 Triangle Completion
- **REQ-022**: Automatic detection when 15th position is filled
- **REQ-023**: Position A user receives automatic withdrawal transaction
- **REQ-024**: Triangle cycling creates two new triangles
- **REQ-025**: User promotion and redistribution logic

### 3.4 Referral System

#### 3.4.1 Referral Mechanics
- **REQ-026**: Unique referral codes for each user (multiple formats)
- **REQ-027**: 10% referral bonus on successful deposits
- **REQ-028**: Immediate bonus crediting upon admin confirmation
- **REQ-029**: Referral tracking and history

#### 3.4.2 Referral Validation
- **REQ-030**: Support for ObjectId, username, and short code formats
- **REQ-031**: Referral code validation during registration
- **REQ-032**: Prevention of self-referral

### 3.5 Withdrawal System

#### 3.5.1 Withdrawal Eligibility
- **REQ-033**: Only Position A users can request withdrawals
- **REQ-034**: Withdrawal only available when triangle is complete
- **REQ-035**: Automatic withdrawal transaction generation

#### 3.5.2 Withdrawal Process
- **REQ-036**: Admin marks withdrawals as "COMPLETED"
- **REQ-037**: User notification modal for completed withdrawals
- **REQ-038**: Account deletion after withdrawal acknowledgment

### 3.6 Admin Portal

#### 3.6.1 Transaction Management
- **REQ-039**: View all pending deposits
- **REQ-040**: Confirm/reject deposit transactions
- **REQ-041**: Manage withdrawal payments
- **REQ-042**: Transaction history and audit trail

#### 3.6.2 User Management
- **REQ-043**: View all users with triangle positions
- **REQ-044**: User account status management
- **REQ-045**: Referral relationship visualization

#### 3.6.3 Triangle Visualization
- **REQ-046**: Real-time triangle structure display
- **REQ-047**: Position occupancy status
- **REQ-048**: Triangle completion progress tracking

---

## 4. Non-Functional Requirements

### 4.1 Performance
- **REQ-049**: Page load times under 3 seconds
- **REQ-050**: Database queries optimized with proper indexing
- **REQ-051**: Concurrent user support up to 1000 active users

### 4.2 Security
- **REQ-052**: Secure password hashing and storage
- **REQ-053**: Admin authentication and authorization
- **REQ-054**: Input validation and sanitization
- **REQ-055**: Protection against common web vulnerabilities

### 4.3 Reliability
- **REQ-056**: 99.9% uptime availability
- **REQ-057**: Atomic database operations for critical processes
- **REQ-058**: Error handling and graceful degradation
- **REQ-059**: Data backup and recovery procedures

### 4.4 Usability
- **REQ-060**: Responsive design for mobile and desktop
- **REQ-061**: Intuitive user interface with clear navigation
- **REQ-062**: Real-time status updates and notifications
- **REQ-063**: Accessibility compliance (WCAG 2.1 AA)

---

## 5. Technical Architecture

### 5.1 Technology Stack
- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Prisma ORM
- **Authentication**: Custom JWT-based system
- **Styling**: Tailwind CSS
- **State Management**: React Context/Hooks

### 5.2 Database Design
- **Users Collection**: User profiles, referral data, triangle positions
- **Triangles Collection**: Triangle structures and completion status
- **Transactions Collection**: Deposits and withdrawals with status tracking
- **Plans Collection**: Plan definitions and pricing
- **ReferralBonuses Collection**: Bonus tracking and distribution

### 5.3 API Endpoints
- Authentication: `/api/auth/*`
- User Operations: `/api/user/*`
- Admin Operations: `/api/admin/*`
- Triangle Management: `/api/triangle/*`
- Transaction Processing: `/api/transactions/*`

---

## 6. User Stories

### 6.1 New User Journey
1. **As a new user**, I want to register with a referral code so that I join my referrer's triangle
2. **As a new user**, I want to see deposit instructions so that I can make payment
3. **As a new user**, I want to confirm my deposit so that admin can verify it
4. **As a new user**, I want to see my triangle position so that I understand my place in the system

### 6.2 Existing User Journey
1. **As an existing user**, I want to share my referral code so that I can earn bonuses
2. **As an existing user**, I want to track my referrals so that I can see my earnings
3. **As a Position A user**, I want to request withdrawal so that I can receive my payout
4. **As a user**, I want to see triangle progress so that I know when completion is near

### 6.3 Admin Journey
1. **As an admin**, I want to review pending deposits so that I can verify payments
2. **As an admin**, I want to confirm/reject transactions so that I can control system access
3. **As an admin**, I want to manage withdrawals so that I can process payouts
4. **As an admin**, I want to view triangle structures so that I can monitor system health

---

## 7. Success Metrics

### 7.1 User Engagement
- User registration rate
- Deposit confirmation rate
- Referral conversion rate
- User retention after first triangle completion

### 7.2 System Performance
- Triangle completion frequency
- Average time from registration to triangle assignment
- Admin response time for transaction verification
- System uptime and error rates

### 7.3 Business Metrics
- Total deposits processed
- Referral bonus distribution
- Withdrawal completion rate
- User lifecycle value

---

## 8. Risk Assessment

### 8.1 Technical Risks
- **Database Performance**: Large triangle structures may impact query performance
- **Concurrency Issues**: Simultaneous registrations could cause triangle assignment conflicts
- **Data Integrity**: Triangle cycling operations must maintain consistency

### 8.2 Business Risks
- **Regulatory Compliance**: MLM regulations vary by jurisdiction
- **User Experience**: Complex triangle logic may confuse users
- **Scalability**: System growth may require infrastructure upgrades

### 8.3 Mitigation Strategies
- Implement database indexing and query optimization
- Use atomic transactions for critical operations
- Provide clear user education and support documentation
- Regular security audits and compliance reviews

---

## 9. Future Enhancements

### 9.1 Phase 2 Features
- Mobile application development
- Advanced analytics dashboard
- Automated marketing tools
- Multi-currency support

### 9.2 Phase 3 Features
- API for third-party integrations
- Advanced referral tracking
- Gamification elements
- Social sharing features

---

## 10. Acceptance Criteria

### 10.1 Core Functionality
- [ ] User registration and login working
- [ ] Deposit system with admin confirmation
- [ ] Triangle assignment and position tracking
- [ ] Referral system with bonus distribution
- [ ] Triangle completion and cycling
- [ ] Withdrawal process and account deletion

### 10.2 Admin Features
- [ ] Transaction management interface
- [ ] User account administration
- [ ] Triangle visualization and monitoring
- [ ] Withdrawal payment processing

### 10.3 Quality Assurance
- [ ] All API endpoints tested and functional
- [ ] Database operations atomic and consistent
- [ ] User interface responsive and accessible
- [ ] Security measures implemented and verified

---

## 11. Glossary

- **Triangle**: A 15-user structure organized in 4 levels
- **Position**: Specific location within a triangle (A, AB1, AB2, etc.)
- **Cycling**: Process of triangle completion and reformation
- **Referrer**: User who invited another user to join
- **Referral Bonus**: 10% commission earned from successful referrals
- **Soft Delete**: Account deactivation without data removal
- **Hard Delete**: Complete account and data removal