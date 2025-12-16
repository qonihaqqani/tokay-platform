# Tokay Resilience Platform

🛡️ **AI-Powered Resilience Platform for Malaysian MSMEs**

Tokay is an intelligent platform designed to predict, prepare, and financially cushion Micro, Small, and Medium Enterprises (MSMEs) against business shocks in Southeast Asia, with initial focus on Malaysia's most vulnerable regions.

## 🎯 Mission

To transform vulnerable Malaysian MSMEs into resilient enterprises that can weather any storm through AI-powered prediction and practical financial tools.

## 🌟 Core Features

### 1. Tokay Pulse - AI Risk Monitor
- **Location-based Risk Analysis**: GPS and postal code risk assessment
- **Historical Sales Pattern Analysis**: Identify vulnerability thresholds
- **Seasonal Risk Modeling**: Monsoon season, festival periods, economic cycles
- **Real-time Risk Scoring**: LOW/MEDIUM/HIGH/CRITICAL levels
- **Cash Runway Calculator**: Shock simulation with business health dashboard
- **Visual Indicators**: Easy-to-understand business health metrics

### 2. Tokay Shield - Emergency Financial Buffer
- **Micro-contribution Savings System**: Automated daily/weekly deposits
- **Emergency Wallet**: Instant liquidity access when needed
- **"What-if" Scenario Simulator**: Different shock type modeling
- **Buffer Size Recommendations**: AI-powered based on business profile
- **Partner-funded Emergency Pool**: For catastrophic events
- **Transaction History**: Complete impact tracking

### 3. Tokay Alerts - Disaster Intelligence System
- **Real-time Weather Monitoring**: Flood warnings and weather alerts
- **Supply Chain Disruption Alerts**: Proactive supply chain monitoring
- **Health Emergency Notifications**: Pandemics and local outbreaks
- **Automated Business Continuity Recommendations**: Actionable guidance
- **Location-specific Guidance**: Evacuation and asset protection
- **Community-wide Alerts**: Clustered business notifications

### 4. Tokay Reports - Resilience Analytics
- **Automated Impact Assessment**: Post-disaster analysis
- **Loss Estimation**: Documentation for aid applications
- **Business Resilience Score**: Improvement recommendations
- **Historical Performance Tracking**: Shock correlation analysis
- **Exportable Reports**: For banks, government agencies, NGOs
- **Peer Benchmarking**: Industry comparison insights

## 🏗️ Technical Architecture

### Backend Stack
- **Framework**: Node.js with Express.js
- **Database**: PostgreSQL (primary), Redis (caching/sessions)
- **Cloud**: AWS Singapore Region
- **Microservices**: Risk Analysis, Payments, Alerts, Reports
- **Message Queue**: RabbitMQ for async processing
- **Monitoring**: CloudWatch for system health

### Frontend Stack
- **Web Application**: React.js with TypeScript, Material-UI
- **Mobile Application**: React Native (cross-platform)
- **Progressive Web App**: Offline functionality for poor connectivity
- **Responsive Design**: Optimized for low-end smartphones

### Security & Compliance
- **Authentication**: JWT with 2FA, biometric options
- **Encryption**: AES-256 (at rest), TLS 1.3 (in transit)
- **Compliance**: Bank Negara Malaysia, PDPA, AML/KYC
- **Data Sovereignty**: All Malaysian data stored within Malaysia

## 🌏 Malaysian Context

### Target Users
- **Primary**: Malaysian MSMEs in high-risk areas (Kelantan, Sabah, rural Perak, Terengganu)
- **Secondary**: Informal business owners (nasi lemak sellers, bike repair shops, retail stores)
- **Tertiary**: Micro-businesses with 1-5 employees, limited business education

### Multi-Language Support
- 🇲🇾 **Bahasa Melayu** (Primary)
- 🇬🇧 **English**
- 🇨🇳 **Mandarin**
- 🇱🇰 **Tamil**

### Local Integrations
- **Payment Gateways**: FPX, Touch 'n Go, GrabPay
- **Weather APIs**: MET Malaysia, OpenWeatherMap
- **Government APIs**: MyGov, CIDB, SME Corp Malaysia
- **Flood Data**: Department of Irrigation and Drainage (DID)

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0.0 or higher
- PostgreSQL 12.0 or higher
- Redis 6.0 or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/tokay-platform.git
   cd tokay-platform
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment template
   cp server/.env.example server/.env
   
   # Edit with your configuration
   nano server/.env
   ```

4. **Set up database**
   ```bash
   cd server
   npm run db:migrate
   npm run db:seed
   ```

5. **Start development servers**
   ```bash
   # From root directory
   npm run dev
   ```

   This will start:
   - Backend server on http://localhost:5000
   - Frontend app on http://localhost:3000

### Environment Variables

Key environment variables to configure:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=tokay_user
DB_PASSWORD=your_password
DB_NAME=tokay_platform

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_super_secret_jwt_key

# Payment Gateways
STRIPE_SECRET_KEY=sk_test_...
FPX_MERCHANT_ID=your_fpx_merchant_id
TOUCHNGO_API_KEY=your_touchngo_api_key
GRABPAY_CLIENT_ID=your_grabpay_client_id

# External APIs
OPENWEATHER_API_KEY=your_openweather_key
MET_MALAYSIA_API_KEY=your_met_malaysia_key
GOOGLE_MAPS_API_KEY=your_google_maps_key

# SMS/Email
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## 📱 Mobile Application

The Tokay mobile app provides the same functionality as the web platform with additional features:

- **Push Notifications**: Real-time alerts directly to your phone
- **Offline Mode**: Access critical information without internet
- **Biometric Authentication**: Secure login with fingerprint/face ID
- **Location Services**: Automatic risk detection based on your location
- **Quick Actions**: One-tap emergency fund access

### Building the Mobile App

```bash
cd client-mobile
npm install
# For iOS
npx react-native run-ios
# For Android
npx react-native run-android
```

## 🔧 Development

### Project Structure

```
tokay-platform/
├── server/                 # Backend API
│   ├── config/            # Database, Redis configuration
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Auth, error handling
│   ├── migrations/        # Database migrations
│   ├── models/           # Data models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── utils/            # Helper functions
├── client/               # React web app
│   ├── public/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React contexts
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── utils/        # Helper functions
└── docs/                 # Documentation
```

### API Documentation

API documentation is available at `http://localhost:5000/api-docs` when running the development server.

### Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test

# E2E tests
npm run test:e2e
```

## 📊 Business Model

### Revenue Streams
1. **Freemium Model**: Basic risk monitoring free, premium features subscription
2. **Transaction Fees**: Small percentage (0.5-1%) on emergency fund transactions
3. **B2B Partnerships**: Banks pay for qualified lead generation
4. **Data Insights**: Anonymized aggregated data sold to research institutions
5. **Government Contracts**: Service fees for disaster relief coordination

### Pricing Tiers
- **Basic (Free)**: Risk monitoring, basic alerts, manual savings tracking
- **Premium (RM29/month)**: AI predictions, automated savings, advanced analytics
- **Business (RM99/month)**: Multi-user accounts, API access, priority support

## 🤝 Contributing

We welcome contributions from the community! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Email**: support@tokay.com
- **Phone**: +60 3-XXXX XXXX
- **WhatsApp**: +60 12-XXX XXXX
- **Documentation**: https://docs.tokay.com

## 🙏 Acknowledgments

- **Malaysian Meteorological Department (MET)**: Weather data provider
- **Department of Irrigation and Drainage (DID)**: Flood data provider
- **SME Corp Malaysia**: Business advisory support
- **Bank Negara Malaysia**: Regulatory guidance
- **MDEC**: Digital economy initiative support

## 🌟 Impact

By 2025, Tokay aims to:
- Reduce business failure rate in target areas by 25%
- Serve over 50,000 Malaysian MSMEs
- Help businesses save RM100 million in emergency funds
- Reduce average recovery time after shocks by 50%

---

**Tokay: Building Resilient Malaysian Businesses, One Enterprise at a Time** 🇲🇾

*Behind every user is a family's livelihood, a community's stability, and a nation's economic resilience.*