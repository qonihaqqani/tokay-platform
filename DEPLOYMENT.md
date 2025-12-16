# 🚀 Tokay Platform Deployment Guide

This guide will help you deploy the Tokay Resilience Platform to the internet. We offer several deployment options from simple to advanced, all optimized for serving Malaysian users.

## 📋 Prerequisites

Before you begin, make sure you have:

- **Domain Name** (e.g., `tokay.com`)
- **SSL Certificate** (Let's Encrypt or paid)
- **Payment Gateway Accounts** (FPX, Touch 'n Go, GrabPay)
- **SMS Service** (Twilio recommended)
- **Email Service** (Gmail, SendGrid, or AWS SES)
- **External API Keys** (Weather, Maps)

## 🎯 Deployment Options

### Option 1: Quick Start with Docker Compose (Recommended for Testing)

**Perfect for:** Quick deployment, development, or small-scale testing

**Time:** 15-30 minutes
**Cost:** $20-50/month (VPS)

#### Steps:

1. **Get a VPS**
   - Recommended providers: DigitalOcean, Vultr, Linode
   - Choose a server in Singapore region for best Malaysian performance
   - Minimum: 2GB RAM, 2 CPU, 40GB SSD

2. **Install Docker & Docker Compose**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Setup Tokay Platform**
   ```bash
   git clone https://github.com/your-org/tokay-platform.git
   cd tokay-platform
   cp .env.production .env
   # Edit .env with your configuration
   ```

4. **Deploy**
   ```bash
   docker-compose up -d
   ```

5. **Setup SSL with Certbot**
   ```bash
   sudo apt install certbot
   sudo certbot certonly --standalone -d tokay.com
   ```

### Option 2: AWS Cloud Deployment (Production Ready)

**Perfect for:** Production, scalability, high availability

**Time:** 1-2 hours
**Cost:** $100-500/month (depending on traffic)

#### Services Used:
- **ECS Fargate** (Container orchestration)
- **RDS PostgreSQL** (Managed database)
- **ElastiCache Redis** (Managed cache)
- **Application Load Balancer** (Load balancing)
- **Certificate Manager** (SSL certificates)
- **Route 53** (DNS management)

#### Quick Deploy Script:

1. **Install AWS CLI** and configure credentials
2. **Run the deployment script:**
   ```bash
   chmod +x deploy/aws-deploy.sh
   ./deploy/aws-deploy.sh
   ```

#### Manual AWS Setup:

1. **Create VPC and Networking**
2. **Setup RDS PostgreSQL** (in Singapore region)
3. **Setup ElastiCache Redis**
4. **Create ECS Cluster**
5. **Push Docker Images to ECR**
6. **Create Task Definition**
7. **Setup Application Load Balancer**
8. **Configure Route 53**

### Option 3: Vercel + Railway (Modern & Simple)

**Perfect for:** Fast deployment, serverless, pay-as-you-go

**Time:** 30 minutes
**Cost:** $0-100/month (depending on usage)

#### Architecture:
- **Frontend**: Vercel (React app)
- **Backend**: Railway (Node.js API)
- **Database**: Railway PostgreSQL
- **Redis**: Upstash Redis

#### Steps:

1. **Deploy Frontend to Vercel**
   ```bash
   cd client
   npm install -g vercel
   vercel --prod
   ```

2. **Deploy Backend to Railway**
   - Connect your GitHub repository to Railway
   - Set environment variables
   - Railway will auto-deploy on push

3. **Update Environment Variables**
   - Set `REACT_APP_API_URL` in Vercel
   - Set database URLs in Railway

## 🔧 Configuration

### Environment Variables

Copy `.env.production` and configure:

```env
# Database
DB_HOST=your_database_host
DB_PASSWORD=your_secure_password

# APIs
OPENWEATHER_API_KEY=your_weather_api
GOOGLE_MAPS_API_KEY=your_maps_api

# Payments
STRIPE_SECRET_KEY=sk_live_...
FPX_MERCHANT_ID=your_fpx_id

# SMS/Email
TWILIO_ACCOUNT_SID=your_twilio_sid
SMTP_USER=your_email@tokay.com
```

### SSL Certificate Setup

#### Option A: Let's Encrypt (Free)
```bash
sudo certbot certonly --standalone -d tokay.com -d www.tokay.com
```

#### Option B: AWS Certificate Manager (AWS only)
- Create certificate in ACM
- Validate via DNS
- Attach to Load Balancer

### Domain Configuration

#### DNS Records (Example):
```
A     @        1.2.3.4
A     www      1.2.3.4
CNAME api      ecs-load-balancer.amazonaws.com
```

## 📊 Monitoring & Logging

### Recommended Setup:

1. **Application Monitoring**
   - Sentry (Error tracking)
   - LogRocket (User session recording)

2. **Infrastructure Monitoring**
   - AWS CloudWatch (AWS)
   - UptimeRobot (Uptime monitoring)

3. **Analytics**
   - Google Analytics
   - Hotjar (User behavior)

## 🔒 Security Checklist

- [ ] SSL/TLS configured
- [ ] Environment variables set
- [ ] Database credentials secure
- [ ] API keys restricted
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Regular backups enabled
- [ ] Access logs monitored

## 🚀 Performance Optimization

### Frontend:
- Enable Gzip compression
- Implement CDN (CloudFlare)
- Optimize images
- Enable browser caching

### Backend:
- Use Redis caching
- Optimize database queries
- Implement connection pooling
- Enable HTTP/2

## 📱 Mobile App Deployment

### Google Play Store:
1. Build APK/AAB
2. Create developer account ($25)
3. Upload to Play Console
4. Complete store listing

### Apple App Store:
1. Build IPA
2. Create developer account ($99/year)
3. Upload to App Store Connect
4. Submit for review

## 🔄 CI/CD Pipeline

### GitHub Actions Example:

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to AWS
        run: ./deploy/aws-deploy.sh
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## 🆘 Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Check security group settings
   - Verify credentials
   - Check network connectivity

2. **SSL Certificate Error**
   - Ensure certificate is valid
   - Check chain certificate
   - Verify domain configuration

3. **High Latency**
   - Use Singapore region for Malaysian users
   - Implement CDN
   - Optimize database queries

4. **Payment Gateway Issues**
   - Verify API keys
   - Check webhook URLs
   - Test in sandbox mode

## 📞 Support

For deployment assistance:
- **Email**: deploy@tokay.com
- **Documentation**: https://docs.tokay.com
- **Community**: https://discord.gg/tokay

---

## 🎉 You're Live!

Once deployed, your Tokay Resilience Platform will be available at your domain, ready to help Malaysian MSMEs build business resilience.

**Next Steps:**
1. Test all features thoroughly
2. Set up monitoring alerts
3. Create user documentation
4. Plan your marketing launch
5. Gather user feedback

**Congratulations!** You've successfully deployed a platform that will help protect Malaysian businesses from shocks and build a more resilient economy. 🇲🇾