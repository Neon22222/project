# Triangular Referral System

A comprehensive multi-level marketing platform that organizes users into triangular structures with automated cycling and referral bonuses.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 7+
- npm or yarn

### Installation

1. **Clone and Install**
```bash
git clone <repository-url>
cd triangular-referral-system
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Database Setup**
```bash
npx prisma generate
npx prisma db push
node scripts/restore-plans-and-admin.js
```

4. **Start Development**
```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 📋 Documentation

- **[Product Requirements Document (PRD)](./docs/PRD.md)** - Complete system specification
- **[Changelog](./docs/CHANGELOG.md)** - Version history and updates
- **[API Documentation](./docs/API.md)** - Complete API reference
- **[Database Schema](./docs/DATABASE.md)** - Database design and structure
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment instructions

## 🏗️ System Architecture

### Core Components
- **Triangle System**: 15-position triangular structures across 4 levels
- **Referral Engine**: Multi-format referral codes with 10% bonuses
- **Admin Portal**: Transaction management and user administration
- **Deposit System**: Manual confirmation with admin verification
- **Withdrawal Process**: Automated for Position A users with cycling

### Technology Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Prisma ORM
- **Authentication**: JWT-based custom system

## 🔄 Triangle Structure

```
Level 1: A (1 user)
Level 2: AB1, AB2 (2 users) 
Level 3: B1C1, B1C2, B2C1, B2C2 (4 users)
Level 4: C1D1, C1D2, C2D1, C2D2, C3D1, C3D2, C4D1, C4D2 (8 users)
Total: 15 users
```

When a triangle completes:
1. Position A user receives payout and exits
2. AB1 and AB2 become A positions in two new triangles
3. All other users are promoted accordingly

## 👥 User Flow

### New User Journey
1. **Register** with optional referral code
2. **Login** and view deposit instructions
3. **Make deposit** and click "I have deposited"
4. **Wait for admin confirmation**
5. **Join triangle** and start earning referrals

### Referral System
- Share your unique referral code
- Earn 10% bonus when referrals make deposits
- Referred users join your triangle (if space available)
- Automatic plan matching for referred users

### Withdrawal Process
- Position A users can request withdrawal when triangle completes
- Admin marks withdrawal as "Paid"
- User acknowledges payment and account is deleted
- User can re-register to start again

## 🛠️ Development

### Project Structure
```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── admin/          # Admin pages
│   └── dashboard/      # User dashboard
├── components/         # React components
├── lib/               # Utility functions
└── types/             # TypeScript definitions

docs/                  # Documentation
scripts/              # Database and utility scripts
prisma/               # Database schema
```

### Key Files
- `prisma/schema.prisma` - Database schema
- `src/lib/triangle.ts` - Core triangle logic
- `src/app/api/` - All API endpoints
- `scripts/restore-plans-and-admin.js` - Initial data setup

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 🔐 Admin Access

### Default Admin Account
- **Email**: admin@example.com
- **Password**: admin123
- **Access**: `/admin` dashboard

### Admin Capabilities
- Confirm/reject user deposits
- Manage withdrawal payments
- View all triangles and user positions
- Monitor system statistics

## 🧪 Testing

### Test Accounts
The system includes seeded test data:
- **Plans**: Basic ($100), Premium ($500), VIP ($1000)
- **Test Users**: Various triangle positions for testing
- **Sample Transactions**: Different status examples

### Testing Scenarios
1. **User Registration**: With and without referral codes
2. **Deposit Flow**: Complete confirmation process
3. **Triangle Assignment**: Various assignment scenarios
4. **Triangle Completion**: Full cycling process
5. **Referral Bonuses**: Commission calculations
6. **Admin Operations**: All administrative functions

## 📊 Monitoring

### Key Metrics
- User registration and activation rates
- Triangle completion frequency
- Transaction confirmation times
- Referral conversion rates

### Health Checks
- Database connectivity
- API endpoint responsiveness
- Triangle data consistency
- User account integrity

## 🔒 Security

### Implemented Security Measures
- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- Admin role-based access control
- Protection against common vulnerabilities

### Security Best Practices
- Regular security audits
- Dependency vulnerability scanning
- Secure environment variable management
- Database access restrictions

## 🚀 Deployment

### Production Deployment
1. Set up production MongoDB database
2. Configure environment variables
3. Build and deploy application
4. Set up reverse proxy (Nginx)
5. Configure SSL certificates
6. Implement monitoring and backups

See [Deployment Guide](./docs/DEPLOYMENT.md) for detailed instructions.

## 📈 Roadmap

### Phase 1 (Current)
- ✅ Core triangle system
- ✅ User management
- ✅ Admin portal
- ✅ Referral system

### Phase 2 (Planned)
- 🔄 Automated payment verification
- 🔄 Enhanced notifications
- 🔄 Mobile application
- 🔄 Advanced analytics

### Phase 3 (Future)
- 📋 API for third-party integrations
- 📋 Multi-currency support
- 📋 Advanced reporting
- 📋 Gamification features

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Code review and merge

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Comprehensive testing required

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

- **Documentation**: Check the docs/ directory
- **Issues**: Create GitHub issues for bugs
- **Questions**: Contact development team
- **Security**: Report security issues privately

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Maintained By**: Development Team