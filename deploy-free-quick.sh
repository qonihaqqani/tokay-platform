#!/bin/bash

# 🚀 Tokay Platform - FREE & INSTANT Deployment Script
# Gets your platform live in 10 minutes using free services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Tokay ASCII Art
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║                    🛡️  TOKAY PLATFORM 🛡️                   ║"
echo "║                                                              ║"
echo "║            Resilience for Malaysian MSMEs                   ║"
echo "║                                                              ║"
echo "║         FREE & INSTANT DEPLOYMENT SCRIPT                    ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_step "Checking prerequisites..."
    
    # Check if git is installed
    if ! command -v git &> /dev/null; then
        log_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] && [ ! -f "server/package.json" ]; then
        log_error "Please run this script from the tokay-platform root directory."
        exit 1
    fi
    
    log_info "Prerequisites check passed ✓"
}

# Initialize git repository if not already done
init_git() {
    log_step "Initializing Git repository..."
    
    if [ ! -d ".git" ]; then
        git init
        log_info "Git repository initialized"
    else
        log_info "Git repository already exists"
    fi
    
    # Create .gitignore if not exists
    if [ ! -f ".gitignore" ]; then
        cat > .gitignore << EOF
# Dependencies
node_modules/
*/node_modules/

# Environment variables
.env
.env.local
.env.production

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Build outputs
build/
dist/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Temporary files
tmp/
temp/
EOF
        log_info "Created .gitignore file"
    fi
}

# Create free service configuration
create_free_config() {
    log_step "Creating free service configuration..."
    
    # Create free environment file
    cat > .env.free << EOF
# Free Services Configuration
NODE_ENV=production
USE_FREE_SERVICES=true
PORT=5000

# Database (Supabase - will be added later)
DATABASE_URL=your_supabase_database_url_here

# Redis (Upstash - will be added later)
REDIS_URL=your_upstash_redis_url_here

# JWT (generate a secure secret)
JWT_SECRET=tokay_free_secret_$(date +%s)_$(openssl rand -hex 16)

# Email (Gmail - use app password)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password

# Frontend URL (will be updated after Vercel deployment)
CLIENT_URL=https://your-app.vercel.app

# Free service optimizations
RATE_LIMIT_MAX_REQUESTS=50
LOG_LEVEL=warn
EOF
    
    log_info "Created .env.free configuration file"
    log_warn "Please update the values in .env.free after getting your service URLs"
}

# Commit and prepare for deployment
prepare_deployment() {
    log_step "Preparing for deployment..."
    
    # Add all files
    git add .
    
    # Commit changes
    git commit -m "Configure for free services deployment" || log_info "No changes to commit"
    
    log_info "Code is ready for deployment"
}

# Print deployment instructions
print_instructions() {
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                  🚀 DEPLOYMENT INSTRUCTIONS                 ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "${YELLOW}📋 STEP 1: Push to GitHub${NC}"
    echo "   1. Create a new repository on GitHub"
    echo "   2. Run these commands:"
    echo "      git remote add origin https://github.com/yourusername/tokay-platform.git"
    echo "      git push -u origin main"
    echo ""
    
    echo -e "${YELLOW}🌐 STEP 2: Deploy Frontend to Vercel${NC}"
    echo "   1. Go to https://vercel.com"
    echo "   2. Click 'New Project'"
    echo "   3. Import your GitHub repository"
    echo "   4. Set root directory to: client"
    echo "   5. Click 'Deploy'"
    echo "   6. Copy your Vercel URL (e.g., https://tokay-app.vercel.app)"
    echo ""
    
    echo -e "${YELLOW}⚙️  STEP 3: Deploy Backend to Railway${NC}"
    echo "   1. Go to https://railway.app"
    echo "   2. Click 'New Project' → 'Deploy from GitHub repo'"
    echo "   3. Select your repository"
    echo "   4. Set root directory to: server"
    echo "   5. Add environment variables (from .env.free):"
    echo "      - NODE_ENV=production"
    echo "      - USE_FREE_SERVICES=true"
    echo "      - DATABASE_URL=your_supabase_url"
    echo "      - REDIS_URL=your_upstash_url"
    echo "      - JWT_SECRET=your_jwt_secret"
    echo "      - EMAIL_USER=your_gmail"
    echo "      - EMAIL_PASS=your_app_password"
    echo "      - CLIENT_URL=https://your-vercel-app.vercel.app"
    echo "   6. Click 'Deploy'"
    echo "   7. Copy your Railway URL (e.g., https://tokay-api.railway.app)"
    echo ""
    
    echo -e "${YELLOW}🗄️  STEP 4: Setup Free Database (Supabase){NC}"
    echo "   1. Go to https://supabase.com"
    echo "   2. Sign up and create new project"
    echo "   3. Go to Settings → Database"
    echo "   4. Copy the 'Connection string'"
    echo "   5. Add it to Railway environment variables as DATABASE_URL"
    echo "   6. Go to SQL Editor in Supabase"
    echo "   7. Copy and run the SQL from server/migrations/ folder"
    echo ""
    
    echo -e "${YELLOW}🔴 STEP 5: Setup Free Redis (Upstash){NC}"
    echo "   1. Go to https://upstash.com"
    echo "   2. Sign up and create new Redis database"
    echo "   3. Go to Details → REST URL"
    echo "   4. Copy the REST URL"
    echo "   5. Add it to Railway environment variables as REDIS_URL"
    echo ""
    
    echo -e "${YELLOW}🔄 STEP 6: Final Configuration${NC}"
    echo "   1. Go back to Vercel dashboard"
    echo "   2. Add environment variable: REACT_APP_API_URL=https://your-railway-app.railway.app"
    echo "   3. Redeploy Vercel app"
    echo ""
    
    echo -e "${GREEN}🎉 YOUR TOKAY PLATFORM IS NOW LIVE!${NC}"
    echo "   Frontend: https://your-app.vercel.app"
    echo "   Backend:  https://your-api.railway.app"
    echo ""
    echo -e "${BLUE}💡 Features available on free tier:${NC}"
    echo "   ✅ User registration & login"
    echo "   ✅ Business profile creation"
    echo "   ✅ Risk assessment (mock weather data)"
    email "   ✅ Emergency fund tracking"
    echo "   ✅ Multi-language support (MS, EN, ZH, TA)"
    echo "   ✅ Email notifications"
    echo "   ✅ Responsive web design"
    echo ""
    echo -e "${YELLOW}⚠️  Limitations on free tier:${NC}"
    echo "   - SMS notifications replaced with email"
    echo "   - Weather data is simulated (mock data)"
    echo "   - Limited API calls (50 per 15 minutes)"
    echo "   - File uploads limited to 2MB"
    echo "   - Database storage: 500MB"
    echo ""
    echo -e "${GREEN}🚀 Ready to help Malaysian MSMEs build resilience!${NC} 🇲🇾"
}

# Main function
main() {
    log_info "Starting Tokay Platform FREE deployment setup..."
    
    check_prerequisites
    init_git
    create_free_config
    prepare_deployment
    print_instructions
    
    log_info "Setup complete! Follow the instructions above to go live."
}

# Run main function
main "$@"