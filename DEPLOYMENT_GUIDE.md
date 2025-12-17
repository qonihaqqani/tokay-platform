# 🚀 Tokay Platform Deployment Guide

## 📋 **Deployment Overview**

This guide covers the complete deployment process for the Tokay Platform v2.0.0 - a production-ready, AI-powered business intelligence platform for Malaysian MSMEs.

**🎯 Status: PRODUCTION READY** ✅

---

## 🏗️ **Deployment Architecture**

### **Production Environment**
- **Application Server**: Node.js with Express.js
- **Database**: PostgreSQL 13+ (primary)
- **Cache**: Redis 6+ (sessions, caching)
- **Web Server**: Nginx (reverse proxy, SSL termination)
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Docker Swarm / Kubernetes (optional)

### **Infrastructure Requirements**

#### **Minimum Requirements (Small Business)**
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 50GB SSD
- **Network**: 100 Mbps

#### **Recommended Requirements (Enterprise)**
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 100GB+ SSD
- **Network**: 1 Gbps
- **Load Balancer**: AWS ALB / Nginx

---

## 🐳 **Docker Deployment (Recommended)**

### **1. Environment Setup**

Create production environment file:
```bash
cp server/.env.example server/.env.production
```

Edit `server/.env.production`:
```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-domain.com

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USER=tokay_user
DB_PASSWORD=your_secure_password
DB_NAME=tokay_platform

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Payment Gateways (Production)
STRIPE_SECRET_KEY=sk_live_...
FPX_MERCHANT_ID=your_production_fpx_merchant_id
TOUCHNGO_API_KEY=your_production_touchngo_api_key
GRABPAY_CLIENT_ID=your_production_grabpay_client_id

# External APIs
OPENWEATHER_API_KEY=your_openweather_api_key
MET_MALAYSIA_API_KEY=your_met_malaysia_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Email Configuration
SMTP_HOST=smtp.your-domain.com
SMTP_PORT=587
SMTP_USER=noreply@your-domain.com
SMTP_PASS=your_smtp_password

# Security
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### **2. Docker Compose Production**

Create `docker-compose.prod.yml`:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: tokay_platform
      POSTGRES_USER: tokay_user
      POSTGRES_PASSWORD: your_secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./server/migrations:/docker-entrypoint-initdb.d
    networks:
      - tokay-network
    restart: unless-stopped

  redis:
    image: redis:6-alpine
    command: redis-server --requirepass your_redis_password
    volumes:
      - redis_data:/data
    networks:
      - tokay-network
    restart: unless-stopped

  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
    env_file:
      - server/.env.production
    depends_on:
      - postgres
      - redis
    networks:
      - tokay-network
    restart: unless-stopped
    volumes:
      - ./server/uploads:/app/uploads

  client:
    build:
      context: ./client
      dockerfile: Dockerfile
      args:
        - REACT_APP_API_URL=https://api.your-domain.com
    networks:
      - tokay-network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./client/build:/usr/share/nginx/html
    depends_on:
      - server
      - client
    networks:
      - tokay-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

networks:
  tokay-network:
    driver: bridge
```

### **3. Nginx Configuration**

Create `nginx/nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server server:5000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com www.your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

        # Frontend
        location / {
            root /usr/share/nginx/html;
            index index.html index.htm;
            try_files $uri $uri/ /index.html;
            
            # Cache static assets
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }

        # Backend API
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
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
}
```

### **4. Deployment Commands**

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d --build

# Run database migrations
docker-compose -f docker-compose.prod.yml exec server npm run db:migrate

# Seed database (optional)
docker-compose -f docker-compose.prod.yml exec server npm run db:seed

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Scale services if needed
docker-compose -f docker-compose.prod.yml up -d --scale server=3
```

---

## ☁️ **Cloud Deployment Options**

### **AWS Deployment**

#### **Using AWS ECS**
1. **Create ECR Repository**
   ```bash
   aws ecr create-repository --repository-name tokay-server
   aws ecr create-repository --repository-name tokay-client
   ```

2. **Build and Push Images**
   ```bash
   # Login to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
   
   # Build and push server
   docker build -t tokay-server ./server
   docker tag tokay-server:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/tokay-server:latest
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/tokay-server:latest
   
   # Build and push client
   docker build -t tokay-client ./client
   docker tag tokay-client:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/tokay-client:latest
   docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/tokay-client:latest
   ```

3. **Create ECS Task Definition**
   ```json
   {
     "family": "tokay-task",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "1024",
     "memory": "2048",
     "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
     "taskRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskRole",
     "containerDefinitions": [
       {
         "name": "tokay-server",
         "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/tokay-server:latest",
         "portMappings": [
           {
             "containerPort": 5000,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "NODE_ENV",
             "value": "production"
           }
         ],
         "secrets": [
           {
             "name": "DB_PASSWORD",
             "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:tokay-db-password"
           }
         ],
         "logConfiguration": {
           "logDriver": "awslogs",
           "options": {
             "awslogs-group": "/ecs/tokay",
             "awslogs-region": "us-east-1",
             "awslogs-stream-prefix": "ecs"
           }
         }
       }
     ]
   }
   ```

#### **Using AWS Elastic Beanstalk**
```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
eb init tokay-platform --platform "Docker running on 64bit Amazon Linux 2"

# Create environment
eb create production --instance-type t3.medium --min-instances 2 --max-instances 10

# Deploy
eb deploy
```

### **Google Cloud Platform**

#### **Using Google Cloud Run**
```bash
# Build and deploy server
gcloud builds submit --tag gcr.io/PROJECT-ID/tokay-server ./server
gcloud run deploy tokay-server --image gcr.io/PROJECT-ID/tokay-server --platform managed

# Build and deploy client
gcloud builds submit --tag gcr.io/PROJECT-ID/tokay-client ./client
gcloud run deploy tokay-client --image gcr.io/PROJECT-ID/tokay-client --platform managed
```

### **Azure Container Instances**

```bash
# Create resource group
az group create --name tokay-rg --location southeast-asia

# Deploy container group
az container create \
  --resource-group tokay-rg \
  --name tokay-app \
  --image tokay-server:latest \
  --dns-name-label tokay-unique \
  --ports 5000 \
  --environment-variables NODE_ENV=production
```

---

## 🔧 **Manual Deployment**

### **1. Server Setup**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Redis
sudo apt install redis-server -y

# Install Nginx
sudo apt install nginx -y

# Install PM2
sudo npm install -g pm2
```

### **2. Database Setup**

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE tokay_platform;
CREATE USER tokay_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE tokay_platform TO tokay_user;
\q
```

### **3. Application Deployment**

```bash
# Clone repository
git clone https://github.com/qonihaqqani/tokay-platform.git
cd tokay-platform

# Install dependencies
npm run install:all

# Setup environment
cp server/.env.example server/.env.production
# Edit .env.production with your settings

# Run migrations
cd server
npm run db:migrate
npm run db:seed

# Build client
cd ../client
npm run build

# Start server with PM2
cd ../server
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### **4. Nginx Configuration**

```bash
# Copy Nginx config
sudo cp nginx/nginx.conf /etc/nginx/sites-available/tokay
sudo ln -s /etc/nginx/sites-available/tokay /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 **Security Configuration**

### **SSL Certificate (Let's Encrypt)**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **Firewall Configuration**

```bash
# Configure UFW
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### **Database Security**

```bash
# PostgreSQL security
sudo nano /etc/postgresql/13/main/postgresql.conf
# Set: listen_addresses = 'localhost'

sudo nano /etc/postgresql/13/main/pg_hba.conf
# Configure authentication methods

sudo systemctl restart postgresql
```

---

## 📊 **Monitoring & Logging**

### **Application Monitoring**

```bash
# PM2 Monitoring
pm2 monit

# Log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### **System Monitoring**

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs -y

# Log monitoring
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### **Health Check Endpoint**

The application includes a health check endpoint at `/api/health` that returns:
```json
{
  "status": "healthy",
  "timestamp": "2024-12-17T10:00:00.000Z",
  "uptime": 3600,
  "database": "connected",
  "redis": "connected"
}
```

---

## 🚀 **Performance Optimization**

### **Database Optimization**

```sql
-- Create indexes for better performance
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);
CREATE INDEX idx_sales_analytics_daily_date ON sales_analytics_daily(date);
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
```

### **Redis Caching**

```bash
# Redis configuration for performance
sudo nano /etc/redis/redis.conf
# Set: maxmemory 256mb
# Set: maxmemory-policy allkeys-lru
sudo systemctl restart redis
```

### **Nginx Optimization**

```nginx
# Add to nginx.conf
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

# Client caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## 🔄 **Backup & Recovery**

### **Database Backup**

```bash
# Create backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="tokay_platform"
DB_USER="tokay_user"

mkdir -p $BACKUP_DIR
pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_DIR/tokay_backup_$DATE.sql

# Keep last 7 days
find $BACKUP_DIR -name "tokay_backup_*.sql" -mtime +7 -delete
```

### **Automated Backup**

```bash
# Add to crontab
crontab -e
# Add: 0 2 * * * /path/to/backup_script.sh
```

### **Recovery**

```bash
# Restore database
psql -U tokay_user -h localhost tokay_platform < /backups/tokay_backup_YYYYMMDD_HHMMSS.sql
```

---

## 🧪 **Testing Deployment**

### **Post-Deployment Checklist**

- [ ] Application loads correctly at https://your-domain.com
- [ ] All API endpoints respond correctly
- [ ] Database connections are working
- [ ] Redis caching is functional
- [ ] SSL certificate is valid
- [ ] User registration and login work
- [ ] Quick Sale Mode functions properly
- [ ] Analytics dashboards load with data
- [ ] AI Insights generate recommendations
- [ ] Demo verification passes all tests
- [ ] Mobile responsiveness is maintained
- [ ] Performance is acceptable (<3 seconds load time)

### **Load Testing**

```bash
# Install Apache Bench
sudo apt install apache2-utils -y

# Test API endpoints
ab -n 1000 -c 10 https://your-domain.com/api/health

# Test frontend
ab -n 1000 -c 10 https://your-domain.com/
```

---

## 📞 **Troubleshooting**

### **Common Issues**

#### **Application Won't Start**
```bash
# Check logs
pm2 logs
# Check environment variables
pm2 env 0
# Restart application
pm2 restart all
```

#### **Database Connection Issues**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql
# Test connection
psql -U tokay_user -h localhost -d tokay_platform
# Check logs
sudo tail -f /var/log/postgresql/postgresql-13-main.log
```

#### **Nginx Issues**
```bash
# Test configuration
sudo nginx -t
# Check logs
sudo tail -f /var/log/nginx/error.log
# Restart Nginx
sudo systemctl restart nginx
```

### **Performance Issues**

```bash
# Check system resources
htop
iotop
# Check database queries
sudo -u postgres psql -d tokay_platform -c "SELECT * FROM pg_stat_activity;"
# Check Redis
redis-cli info memory
```

---

## 🎯 **Production Best Practices**

1. **Regular Updates**: Keep system and dependencies updated
2. **Monitoring**: Set up alerts for downtime and performance issues
3. **Backups**: Automated daily backups with regular recovery testing
4. **Security**: Regular security audits and updates
5. **Scaling**: Monitor usage and scale resources as needed
6. **Documentation**: Keep deployment and configuration documentation updated
7. **Testing**: Regular testing of all features and disaster recovery procedures

---

## 🚀 **Go Live!**

Once you've completed all the above steps:

1. **Final Verification**: Run the demo verification system
2. **Performance Testing**: Conduct load testing
3. **Security Audit**: Perform security checks
4. **User Acceptance Testing**: Have beta users test the system
5. **Launch**: Go live with your Tokay Platform!

**🎉 Congratulations! Your Tokay Platform is now production-ready!**

**🦎 Tokay: Your Intelligent Business Partner - Transforming Malaysian MSMEs with AI-Powered Insights** 🇲🇾

---

## 📞 **Support**

For deployment support:
- **Email**: support@tokay.com.my
- **Documentation**: https://docs.tokay.com.my
- **GitHub Issues**: https://github.com/qonihaqqani/tokay-platform/issues