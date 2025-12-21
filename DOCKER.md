# Docker Deployment Guide

Complete guide for deploying CeritaKita Booking application using Docker.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [SSL/TLS Setup](#ssltls-setup)
- [Building and Running](#building-and-running)
- [Data Persistence](#data-persistence)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)
- [Production Deployment Checklist](#production-deployment-checklist)

## Prerequisites

### Required Software

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher

### Verify Installation

```bash
docker --version
docker-compose --version
```

### System Requirements

- **CPU**: 1 core minimum, 2 cores recommended
- **RAM**: 512MB minimum, 1GB recommended
- **Disk**: 2GB for Docker images + data storage

## Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd ceritakita-booking
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.docker.example .env.local

# Edit with your values
nano .env.local  # or use your preferred editor
```

**Important**: Change these values:
- `ADMIN_PASSWORD` - Use a strong password
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - Set to your domain (e.g., `https://booking.yourdomain.com`)

### 3. Setup SSL Certificates

See [SSL/TLS Setup](#ssltls-setup) section below.

For quick testing without SSL, you can:
1. Comment out the HTTPS server block in `nginx/nginx.conf`
2. Update the HTTP block to proxy instead of redirect

### 4. Build and Run

```bash
# Build the Docker image
docker-compose build app

# Start all services (app + nginx)
docker-compose up -d

# Check status
docker-compose ps
```

### 5. Access Application

- **HTTP**: http://localhost (redirects to HTTPS)
- **HTTPS**: https://localhost
- **Direct to app** (bypass nginx): http://localhost:3000

### 6. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f nginx
```

## Environment Configuration

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `ADMIN_USERNAME` | Admin dashboard username | `admin` |
| `ADMIN_PASSWORD` | Admin dashboard password | `SecurePass123!` |
| `NEXTAUTH_URL` | Full application URL | `https://booking.example.com` |
| `NEXTAUTH_SECRET` | NextAuth encryption key (32+ chars) | Generate with `openssl rand -base64 32` |
| `NODE_ENV` | Node environment | `production` |

### Generate Secure Secret

```bash
# Method 1: OpenSSL
openssl rand -base64 32

# Method 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Method 3: Online
# Visit: https://generate-secret.vercel.app/32
```

### Example .env.local

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=MySecurePassword123!
NEXTAUTH_URL=https://booking.example.com
NEXTAUTH_SECRET=Kp2s5v8y/B?E(H+MbQeThWmZq4t7w!z%
NODE_ENV=production
```

## SSL/TLS Setup

### Option 1: Let's Encrypt (Recommended for Production)

#### Install Certbot

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install certbot

# CentOS/RHEL
sudo yum install certbot
```

#### Generate Certificates

```bash
# Stop nginx if running
docker-compose stop nginx

# Generate certificates (standalone mode)
sudo certbot certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --email your-email@example.com \
  --agree-tos

# Copy to nginx/ssl directory
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./nginx/ssl/key.pem

# Set proper permissions
sudo chmod 644 ./nginx/ssl/cert.pem
sudo chmod 600 ./nginx/ssl/key.pem

# Restart nginx
docker-compose up -d nginx
```

#### Auto-Renewal Setup

```bash
# Test renewal
sudo certbot renew --dry-run

# Create renewal script
cat > renew-certs.sh << 'EOF'
#!/bin/bash
certbot renew --quiet
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /path/to/ceritakita-booking/nginx/ssl/cert.pem
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /path/to/ceritakita-booking/nginx/ssl/key.pem
cd /path/to/ceritakita-booking
docker-compose restart nginx
EOF

chmod +x renew-certs.sh

# Add to crontab (runs twice daily)
(crontab -l 2>/dev/null; echo "0 */12 * * * /path/to/renew-certs.sh") | crontab -
```

### Option 2: Self-Signed Certificates (Development Only)

```bash
# Navigate to SSL directory
cd nginx/ssl

# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout key.pem \
  -out cert.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Verify
ls -la
```

**Warning**: Browsers will show security warnings for self-signed certificates.

### Option 3: No SSL (Development Only)

Edit `nginx/nginx.conf`:

```nginx
# Comment out the HTTPS server block (lines 65-140)

# Update HTTP server block:
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://nextjs_app;
        # ... add all proxy settings from HTTPS block
    }
}
```

## Building and Running

### Build Commands

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build app

# Build without cache (fresh build)
docker-compose build --no-cache app

# Build with progress output
docker-compose build --progress=plain app
```

### Run Commands

```bash
# Start all services (detached)
docker-compose up -d

# Start specific service
docker-compose up -d app

# Start with build
docker-compose up -d --build

# Start and view logs
docker-compose up

# Scale service (not applicable for this setup)
# docker-compose up -d --scale app=2
```

### Stop Commands

```bash
# Stop all services
docker-compose stop

# Stop specific service
docker-compose stop app

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (CAUTION: deletes data!)
docker-compose down -v

# Stop and remove containers + images
docker-compose down --rmi all
```

## Data Persistence

### Named Volumes

The application uses Docker-managed named volumes for data persistence:

- `ceritakita-booking_data` - SQLite database files
- `ceritakita-booking_uploads` - Payment proof images

### Inspect Volumes

```bash
# List volumes
docker volume ls | grep ceritakita

# Inspect volume
docker volume inspect ceritakita-booking_data

# View volume location on host
docker volume inspect ceritakita-booking_data -f '{{ .Mountpoint }}'
```

### Backup Data

#### Method 1: Docker Run (Recommended)

```bash
# Create backup directory
mkdir -p backups

# Backup both data and uploads
docker run --rm \
  -v ceritakita-booking_data:/data \
  -v ceritakita-booking_uploads:/uploads \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/backup-$(date +%Y%m%d-%H%M%S).tar.gz /data /uploads

# List backups
ls -lh backups/
```

#### Method 2: Direct Volume Copy

```bash
# Stop application first
docker-compose stop app

# Copy data volume
docker run --rm \
  -v ceritakita-booking_data:/source \
  -v $(pwd)/backup-data:/backup \
  alpine cp -r /source /backup/

# Copy uploads volume
docker run --rm \
  -v ceritakita-booking_uploads:/source \
  -v $(pwd)/backup-uploads:/backup \
  alpine cp -r /source /backup/

# Restart application
docker-compose up -d app
```

### Restore Data

```bash
# Stop application
docker-compose stop app

# Restore from backup
docker run --rm \
  -v ceritakita-booking_data:/data \
  -v ceritakita-booking_uploads:/uploads \
  -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/backup-TIMESTAMP.tar.gz -C /

# Restart application
docker-compose up -d app
```

### Automated Backups

Create a backup script:

```bash
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/path/to/backups"
RETENTION_DAYS=30

# Create backup
docker run --rm \
  -v ceritakita-booking_data:/data \
  -v ceritakita-booking_uploads:/uploads \
  -v ${BACKUP_DIR}:/backup \
  alpine tar czf /backup/backup-$(date +%Y%m%d-%H%M%S).tar.gz /data /uploads

# Delete backups older than retention period
find ${BACKUP_DIR} -name "backup-*.tar.gz" -mtime +${RETENTION_DAYS} -delete

echo "Backup completed: $(date)"
EOF

chmod +x backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /path/to/backup.sh >> /var/log/ceritakita-backup.log 2>&1") | crontab -
```

## Monitoring and Maintenance

### View Logs

```bash
# Tail all logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100 app

# Logs since 1 hour ago
docker-compose logs --since 1h app

# Export logs to file
docker-compose logs --no-color > logs-$(date +%Y%m%d).txt
```

### Health Checks

```bash
# Check container health status
docker inspect --format='{{.State.Health.Status}}' ceritakita-booking

# View health check logs
docker inspect --format='{{json .State.Health}}' ceritakita-booking | jq

# Test health endpoint manually
curl http://localhost:3000/api/health
```

### Resource Usage

```bash
# View resource usage
docker stats ceritakita-booking ceritakita-nginx

# One-time snapshot
docker stats --no-stream

# Container processes
docker-compose top
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart (with zero-downtime)
docker-compose up -d --build --no-deps app

# View update logs
docker-compose logs -f app
```

### Database Maintenance

```bash
# Access database
docker exec -it ceritakita-booking sh
cd /app/data
sqlite3 bookings.db

# SQLite commands
.tables                    # List tables
.schema bookings           # Show table schema
SELECT COUNT(*) FROM bookings;  # Query data
.quit                      # Exit

# Vacuum database (optimize)
docker exec -it ceritakita-booking sh -c "sqlite3 /app/data/bookings.db 'VACUUM;'"

# Check database integrity
docker exec -it ceritakita-booking sh -c "sqlite3 /app/data/bookings.db 'PRAGMA integrity_check;'"
```

### Clean Up

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes (CAUTION!)
docker volume prune

# Remove everything unused
docker system prune -a --volumes

# View disk usage
docker system df
```

## Troubleshooting

### Application Won't Start

```bash
# Check logs
docker-compose logs app

# Common issues:
# 1. Missing environment variables
cat .env.local

# 2. Port already in use
sudo lsof -i :3000
sudo lsof -i :80
sudo lsof -i :443

# 3. Build errors
docker-compose build --no-cache app
```

### Database Connection Errors

```bash
# Verify database file exists
docker exec ceritakita-booking ls -la /app/data/

# Check permissions
docker exec ceritakita-booking ls -la /app/data/bookings.db

# Test database manually
docker exec -it ceritakita-booking sh
sqlite3 /app/data/bookings.db "SELECT 1;"
```

### Nginx SSL Errors

```bash
# Verify certificate files exist
ls -la nginx/ssl/

# Check certificate validity
openssl x509 -in nginx/ssl/cert.pem -text -noout

# Check private key
openssl rsa -in nginx/ssl/key.pem -check

# Test nginx configuration
docker exec ceritakita-nginx nginx -t

# Reload nginx
docker-compose restart nginx
```

### Better-sqlite3 Compilation Issues

If the native module fails to compile:

```bash
# Rebuild with verbose output
docker-compose build --no-cache --progress=plain app

# Check node version (should be 18)
docker run --rm ceritakita-booking node --version

# Verify build dependencies
docker run --rm -it node:18-alpine sh
apk add --no-cache python3 make g++
npm install better-sqlite3
```

### Permission Errors

```bash
# Check file ownership
docker exec ceritakita-booking ls -la /app/data/
docker exec ceritakita-booking ls -la /app/uploads/

# Fix ownership (if needed)
docker exec ceritakita-booking chown -R nextjs:nodejs /app/data
docker exec ceritakita-booking chown -R nextjs:nodejs /app/uploads

# Restart
docker-compose restart app
```

### Health Check Failing

```bash
# Test endpoint directly
curl http://localhost:3000/api/health

# Check application logs
docker-compose logs --tail=50 app

# Inspect health check
docker inspect --format='{{json .State.Health}}' ceritakita-booking | jq
```

### High Memory Usage

```bash
# Check current usage
docker stats --no-stream ceritakita-booking

# Adjust memory limits in docker-compose.yml
# Edit deploy.resources.limits.memory

# Restart with new limits
docker-compose up -d --force-recreate app
```

## Production Deployment Checklist

### Pre-Deployment

- [ ] Generate strong `NEXTAUTH_SECRET` (32+ characters)
- [ ] Set strong `ADMIN_PASSWORD`
- [ ] Configure `NEXTAUTH_URL` with production domain
- [ ] Setup SSL certificates (Let's Encrypt recommended)
- [ ] Review and update `nginx/nginx.conf` server_name
- [ ] Test environment variables: `cat .env.local`
- [ ] Ensure `.env.local` is in `.gitignore`

### Security

- [ ] Verify non-root user in Dockerfile (nextjs:nodejs)
- [ ] Confirm `no-new-privileges` security option enabled
- [ ] Check SSL/TLS configuration (TLSv1.2+, strong ciphers)
- [ ] Review nginx security headers
- [ ] Limit resource usage (memory: 512M)
- [ ] Enable Docker firewall rules
- [ ] Set up fail2ban for nginx (optional)

### Infrastructure

- [ ] Sufficient disk space (2GB+ free)
- [ ] RAM availability (1GB+ recommended)
- [ ] Open ports: 80 (HTTP), 443 (HTTPS)
- [ ] Configure firewall (allow 80, 443; block 3000 from public)
- [ ] Setup DNS A/AAAA records
- [ ] Configure reverse proxy (completed)

### Data & Backup

- [ ] Test volume mounts: `docker volume inspect ceritakita-booking_data`
- [ ] Setup automated backups (daily recommended)
- [ ] Test backup restoration process
- [ ] Define backup retention policy (30 days recommended)
- [ ] Document recovery procedures
- [ ] Setup off-site backup storage (optional)

### Monitoring

- [ ] Verify health checks working: `curl http://localhost:3000/api/health`
- [ ] Setup log rotation
- [ ] Configure monitoring alerts (Uptime Robot, etc.)
- [ ] Test application restart: `docker-compose restart app`
- [ ] Verify data persistence after restart
- [ ] Monitor resource usage: `docker stats`

### Testing

- [ ] Build Docker image successfully: `docker-compose build app`
- [ ] Application starts: `docker-compose up -d`
- [ ] Health check returns 200: `curl http://localhost:3000/api/health`
- [ ] Homepage loads: `curl http://localhost`
- [ ] Admin login works: `https://yourdomain.com/admin`
- [ ] Create test booking
- [ ] Upload payment proof
- [ ] Verify data persists after container restart
- [ ] Test SSL/TLS: `curl -I https://yourdomain.com`
- [ ] Check nginx proxy: `curl -I http://yourdomain.com`

### Documentation

- [ ] Document production URL
- [ ] Document admin credentials (secure location)
- [ ] Document SSL certificate renewal process
- [ ] Document backup/restore procedures
- [ ] Document rollback procedures
- [ ] Share access with team (if applicable)

### Post-Deployment

- [ ] Monitor logs for errors: `docker-compose logs -f`
- [ ] Verify health checks passing
- [ ] Test user flows (booking, admin)
- [ ] Monitor resource usage first 24 hours
- [ ] Setup uptime monitoring
- [ ] Schedule SSL certificate renewal
- [ ] Plan regular maintenance windows

## Advanced Configuration

### Custom Port Mapping

Edit `docker-compose.yml`:

```yaml
services:
  app:
    ports:
      - "${APP_PORT:-3000}:3000"
  nginx:
    ports:
      - "${HTTP_PORT:-80}:80"
      - "${HTTPS_PORT:-443}:443"
```

Add to `.env.local`:
```env
APP_PORT=3001
HTTP_PORT=8080
HTTPS_PORT=8443
```

### Multiple Instances (Load Balancing)

This requires external load balancer (nginx, HAProxy, or cloud LB).

### Behind Corporate Proxy

Add to Dockerfile:

```dockerfile
# Set proxy during build
ARG HTTP_PROXY
ARG HTTPS_PROXY
ENV http_proxy=$HTTP_PROXY
ENV https_proxy=$HTTPS_PROXY
```

Build with:
```bash
docker-compose build --build-arg HTTP_PROXY=http://proxy:8080
```

## Support

For issues or questions:

1. Check logs: `docker-compose logs -f`
2. Review this documentation
3. Check GitHub issues
4. Contact support team

## License

[Your License Here]
