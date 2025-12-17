# Tokay Platform Demo Setup Guide

## 🚀 Quick Start for Demo

This guide will help you set up the Tokay Resilience Platform for a complete demo experience.

## 📋 Prerequisites

- Node.js 18+ installed
- PostgreSQL database (or use Docker)
- Git

## 🛠️ Setup Steps

### 1. Clone and Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Database Setup

```bash
# From server directory
npm run db:migrate
```

### 3. Environment Configuration

Create `.env` file in `server/` directory:

```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=tokay_user
DB_PASSWORD=password
DB_NAME=tokay_platform
JWT_SECRET=your-super-secret-jwt-key
CLIENT_URL=http://localhost:3000
```

### 4. Start the Application

```bash
# Start server (from server directory)
npm run dev

# Start client (from client directory)
npm start
```

## 🎯 Demo Features Available

### ✅ Fully Functional Features
1. **User Authentication** - Login/Register with phone verification
2. **Dashboard** - Complete overview with metrics and quick actions
3. **E-Invoicing** - Full LHDN-compliant invoicing system
4. **Risk Assessment** - AI-powered risk analysis with recommendations
5. **Emergency Fund** - Fund management with contribution tracking
6. **Alerts System** - Real-time alerts with severity levels
7. **Multi-language Support** - BM, English, Mandarin, Tamil
8. **Responsive Design** - Mobile-first PWA-ready interface

### 📊 Demo Data
The application includes mock data for:
- Sample emergency fund with RM3,500 balance
- Medium risk assessment with actionable recommendations
- Recent invoices and receipts
- Active alerts (flood warning, payment reminders)
- Multi-state Malaysian business context

## 🎨 Demo Flow

1. **Landing Page** - Introduction to Tokay platform
2. **Registration** - Phone-based signup with verification
3. **Dashboard** - Business resilience overview
4. **E-Invoicing** - Create and manage LHDN-compliant invoices
5. **Risk Assessment** - Run AI analysis and view recommendations
6. **Emergency Fund** - Manage contributions and track progress
7. **Alerts** - View and manage business alerts

## 🔧 Key Features to Highlight

### 🇲🇾 Malaysian Compliance
- LHDN e-invoicing integration
- SST tax calculation (6% with exemptions)
- Multi-state risk factors (Kelantan floods, Selangor economic risks)
- Local payment methods (FPX, Touch 'n Go, GrabPay)

### 🤖 AI-Powered Features
- Location-based risk assessment
- Emergency fund recommendations
- Receipt OCR analysis
- Business resilience scoring

### 📱 Mobile-First Design
- Progressive Web App capabilities
- Offline functionality for rural areas
- Responsive design for all screen sizes
- Touch-friendly interface

## 🎯 Demo Script

### Opening (Landing Page)
"Welcome to Tokay, Malaysia's first AI-powered business resilience platform. Built specifically for Malaysian MSMEs to protect against floods, economic shocks, and unexpected disruptions."

### Authentication
"Notice our phone-based authentication system - designed for Malaysian businesses where mobile numbers are the primary identifier."

### Dashboard
"The dashboard provides a complete overview of your business resilience. You can see your emergency fund status, current risk level, recent invoices, and active alerts all in one place."

### E-Invoicing (Key Feature)
"This is our game-changing feature - full LHDN-compliant e-invoicing. Unlike competitors, Tokay integrates invoicing with emergency fund management. You can mark invoices as emergency-related and link them directly to your resilience planning."

### Risk Assessment
"Our AI analyzes your business based on location, industry, and financial data. For this demo business in Kelantan, you can see we've identified flood risks and provided specific mitigation recommendations."

### Emergency Fund
"Smart emergency fund management with AI-powered contribution suggestions. The system analyzes your expenses and recommends optimal contribution amounts."

### Multi-language Support
"Tokay supports all four major Malaysian languages - Bahasa Melayu, English, Mandarin, and Tamil, making it accessible to all business owners."

## 🏆 Competitive Advantages

1. **Regulatory Compliance** - Full LHDN integration (competitors lack this)
2. **Emergency Integration** - Unique linking of invoicing to resilience planning
3. **Malaysian Context** - Built for local risks and regulations
4. **AI-Powered** - Intelligent recommendations vs. basic bookkeeping
5. **Offline Capability** - Works in rural areas with poor connectivity

## 🔍 Technical Highlights

- **Microservices Architecture** - Scalable and maintainable
- **Docker Containerization** - Easy deployment
- **PostgreSQL + Redis** - Robust data management
- **React + Material-UI** - Modern, accessible frontend
- **Node.js + Express** - Efficient backend API

## 📞 Support During Demo

If any issues arise during the demo:
1. Check that both server and client are running
2. Verify database connection
3. Refresh the browser page
4. All features have fallback data for demo purposes

## 🎉 Closing

"Tokay isn't just another business management tool - it's your business insurance policy. While competitors help you bill customers, Tokay ensures your business survives to bill another day. Ready to build resilience into your Malaysian business?"