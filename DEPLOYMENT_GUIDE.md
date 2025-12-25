# Deployment Guide - CeritaKita Studio Booking System

**Technical Guide for Server Deployment & Maintenance**

This guide covers the complete setup, deployment, and ongoing maintenance of the CeritaKita booking system.

---

## 📋 Table of Contents
1. [Prerequisites & System Requirements](#prerequisites--system-requirements)
2. [Environment Variables Configuration](#environment-variables-configuration)
3. [Installation & Build Process](#installation--build-process)
4. [Database Management](#database-management)
5. [Process Management with PM2](#process-management-with-pm2)
6. [Production Web Server Setup](#production-web-server-setup)
7. [SSL/HTTPS Configuration](#sslhttps-configuration)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites & System Requirements

### Server Requirements
- **OS**: Ubuntu 20.04/22.04 LTS (recommended), Debian 11+, or similar Linux distribution
- **Node.js**: Version 18.18+ (LTS recommended)
- **Memory**: Minimum 2GB RAM (4GB recommended)
- **Storage**: 10GB+ free disk space
- **CPU**: 2+ cores recommended

### Software Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Git
sudo apt install -y git

# Install Nginx (for reverse proxy)
sudo apt install -y nginx

# Install Certbot (for SSL)
sudo apt install -y certbot python3-certbot-nginx
```

### Verify Installation
```bash
node --version    # Should be v18.18+ or v20.x
npm --version     # Should be 9.x+
pm2 --version     # Should be 5.x+
nginx -v          # Should be 1.18+
```

---

## Environment Variables Configuration

### Required Environment Variables

Create `.env.production` file in the project root:

```bash
# Authentication & Security
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-very-secure-secret-key-here

# Admin Credentials
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_secure_password

# Database (SQLite - no configuration needed for local file)

# Optional: Backblaze B2 (for file storage)
B2_APPLICATION_KEY_ID=your_b2_key_id
B2_APPLICATION_KEY=your_b2_key
B2_BUCKET_ID=your_bucket_id
B2_BUCKET_NAME=your_bucket_name
```

### Generating Secure Values

**NEXTAUTH_SECRET**:
```bash
openssl rand -base64 32
```

**ADMIN_PASSWORD**:
- Use a strong, unique password
- Minimum 12 characters
- Mix of letters, numbers, symbols

### Environment Variable Security

**Never commit `.env.production` to git**:
```bash
echo ".env.production" >> .gitignore
```

**File permissions**:
```bash
chmod 600 .env.production
```

---

## Installation & Build Process

### 1. Clone Repository
```bash
cd /var/www
git clone https://github.com/your-username/ceritakita-booking.git
cd ceritakita-booking
```

### 2. Install Dependencies
```bash
npm ci --only=production
```

### 3. Configure Environment
```bash
cp .env.production.example .env.production
nano .env.production
```

### 4. Build the Application
```bash
npm run build
```

**Expected Output**:
```
✓ Compiled successfully
✓ Linting passed
✓ Type checking passed
```

### 5. Verify Build
```bash
ls -la .next/
# Should show: server/, static/, app/
```

---

## Database Management

### SQLite Database Location
```
/var/www/ceritakita-booking/data/bookings.db
```

### Database Persistence

**Critical**: The SQLite database file must persist across deployments.

#### Backup Strategy

**Manual Backup**:
```bash
sudo mkdir -p /var/backups/ceritakita
sudo cp /var/www/ceritakita-booking/data/bookings.db /var/backups/ceritakita/bookings.db.$(date +%Y%m%d_%H%M%S)
sudo gzip /var/backups/ceritakita/bookings.db.*
sudo find /var/backups/ceritakita/ -name "bookings.db.*" -mtime +7 -delete
```

**Automated Backup (Cron Job)**:
```bash
sudo crontab -e
# Add: 0 2 * * * cp /var/www/ceritakita-booking/data/bookings.db /var/backups/ceritakita/bookings.db.$(date +\%Y\%m\%d_\%H\%M\%S) && gzip /var/backups/ceritakita/bookings.db.$(date +\%Y\%m\%d_\%H\%M\%S)
```

**Backup Script** (`/usr/local/bin/backup_ceritakita.sh`):
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/ceritakita"
DB_PATH="/var/www/ceritakita-booking/data/bookings.db"
DATE=$(date +%Y%m%d_%H%M%S)

cp $DB_PATH $BACKUP_DIR/bookings.db.$DATE
gzip $BACKUP_DIR/bookings.db.$DATE
find $BACKUP_DIR -name "bookings.db.*.gz" -mtime +7 -delete
echo "[$(date)] Backup completed: bookings.db.$DATE.gz" >> /var/log/ceritakita_backup.log
```

Make executable:
```bash
sudo chmod +x /usr/local/bin/backup_ceritakita.sh
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup_ceritakita.sh
```

### Database Integrity Check

```bash
sudo apt install sqlite3
sqlite3 /var/www/ceritakita-booking/data/bookings.db "PRAGMA integrity_check;"
# Should return: "ok"
```

### Viewing Database Content

```bash
# View tables
sqlite3 /var/www/ceritakita-booking/data/bookings.db ".tables"

# View schema
sqlite3 /var/www/ceritakita-booking/data/bookings.db ".schema"

# Count bookings
sqlite3 /var/www/ceritakita-booking/data/bookings.db "SELECT COUNT(*) FROM bookings;"

# View recent bookings
sqlite3 /var/www/ceritakita-booking/data/bookings.db "SELECT id, customer_name, booking_date, status FROM bookings ORDER BY created_at DESC LIMIT 10;"
```

---

## Process Management with PM2

### PM2 Configuration

Create `ecosystem.config.js` in project root:

```javascript
module.exports = {
  apps: [{
    name: 'ceritakita-booking',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/ceritakita-booking',
    env: {
      NODE_ENV: 'production',
    },
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    watch: false,
    max_restarts: 10,
    min_uptime: '10s',
    max_backoff_restart_delay: 60000,
    log_file: '/var/log/ceritakita/combined.log',
    out_file: '/var/log/ceritakita/out.log',
    error_file: '/var/log/ceritakita/error.log',
    time: true,
  }]
};
```

### Start Application with PM2

```bash
# Create log directory
sudo mkdir -p /var/log/ceritakita

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Generate startup script
pm2 startup

# Copy and run the output command
# Example: sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u www-data --hp /var/www
```

### PM2 Management Commands

```bash
# View status
pm2 status
pm2 list

# View logs
pm2 logs ceritakita-booking
pm2 logs ceritakita-booking --lines 100
pm2 logs ceritakita-booking --err

# Restart application
pm2 restart ceritakita-booking

# Stop application
pm2 stop ceritakita-booking

# Reload (zero-downtime)
pm2 reload ceritakita-booking

# Monitor
pm2 monit

# Delete from PM2
pm2 delete ceritakita-booking
```

### PM2 Ecosystem File Location
Save the ecosystem file in your project root for version control:
```
/var/www/ceritakita-booking/ecosystem.config.js
```

---

## Production Web Server Setup

### Nginx Reverse Proxy

Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/ceritakita-booking
```

**Configuration**:
```nginx
# CeritaKita Studio Booking System
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### Enable Site

```bash
# Test configuration
sudo nginx -t

# Enable site
sudo ln -s /etc/nginx/sites-available/ceritakita-booking /etc/nginx/sites-enabled/

# Remove default if conflicting
sudo rm /etc/nginx/sites-enabled/default

# Restart Nginx
sudo systemctl restart nginx
```

### Firewall Configuration

```bash
# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## SSL/HTTPS Configuration

### Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx
```

### Obtain SSL Certificate
```bash
# Replace with your domain
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Automatic Renewal
```bash
# Test renewal
sudo certbot renew --dry-run

# Add to crontab (runs twice daily)
sudo crontab -e
# Add: 0 */12 * * * certbot renew --quiet
```

### Verify SSL
```bash
# Check certificate
sudo certbot certificates

# Test SSL configuration
curl -I https://your-domain.com
```

---

## Monitoring & Maintenance

### System Monitoring

**Check Application Health**:
```bash
# Test endpoint
curl -f http://localhost:3000/health || echo "Health check failed"

# Check PM2 status
pm2 status

# Check logs for errors
pm2 logs --err | grep -i error
```

**System Resources**:
```bash
# Memory usage
free -h

# Disk usage
df -h

# Process list
ps aux | grep node

# Network connections
netstat -tlnp | grep 3000
```

### Log Management

**View Application Logs**:
```bash
# Real-time logs
pm2 logs ceritakita-booking

# Error logs only
pm2 logs ceritakita-booking --err

# Last 100 lines
pm2 logs ceritakita-booking --lines 100
```

**Log Rotation**:
```bash
# Install logrotate
sudo apt install logrotate

# Create config
sudo nano /etc/logrotate.d/ceritakita
```

**Logrotate Config**:
```
/var/log/ceritakita/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0640 www-data www-data
    postrotate
        pm2 reload ceritakita-booking
    endscript
}
```

### Regular Maintenance Tasks

**Daily**:
- Check PM2 status
- Review error logs
- Verify disk space

**Weekly**:
- Backup database
- Check system updates
- Review access logs

**Monthly**:
- Update Node.js dependencies
- Review security logs
- Test backup restoration
- Check SSL certificate expiry

### Performance Optimization

**Node.js Memory**:
```bash
# Set Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=2048"
```

**Database Optimization**:
```bash
# Vacuum database (free space)
sqlite3 /var/www/ceritakita-booking/data/bookings.db "VACUUM;"

# Analyze for query optimization
sqlite3 /var/www/ceritakita-booking/data/bookings.db "ANALYZE;"
```

---

## Troubleshooting

### Application Won't Start

**Check PM2 Status**:
```bash
pm2 status
pm2 logs --err
```

**Check Port Availability**:
```bash
netstat -tlnp | grep 3000
lsof -i :3000
```

**Check Permissions**:
```bash
ls -la /var/www/ceritakita-booking/
chown -R www-data:www-data /var/www/ceritakita-booking/
```

### Database Issues

**Database Locked**:
```bash
# Check for running processes
ps aux | grep sqlite

# Kill stuck processes
sudo pkill -f "node.*ceritakita"
```

**Corrupted Database**:
```bash
# Restore from backup
sudo cp /var/backups/ceritakita/bookings.db.latest /var/www/ceritakita-booking/data/bookings.db

# Verify integrity
sqlite3 /var/www/ceritakita-booking/data/bookings.db "PRAGMA integrity_check;"
```

### Nginx Issues

**Configuration Test**:
```bash
sudo nginx -t
```

**Check Nginx Logs**:
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### SSL Issues

**Renewal Problems**:
```bash
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

**Certificate Expired**:
```bash
sudo certbot renew
```

### Memory Issues

**Check Memory Usage**:
```bash
pm2 monit
free -h
top
```

**Restart Application**:
```bash
pm2 restart ceritakita-booking
```

### Common Error Messages

**"EADDRINUSE"**:
```bash
# Port already in use
lsof -i :3000
kill -9 <PID>
```

**"Database is locked"**:
```bash
# Wait for processes to finish or restart
pm2 restart ceritakita-booking
```

**"Out of memory"**:
```bash
# Increase memory limit in ecosystem.config.js
max_memory_restart: '2G'
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database backup created
- [ ] Dependencies installed
- [ ] Build completed successfully
- [ ] SSL certificate ready (if needed)

### Deployment
- [ ] Stop existing application
- [ ] Update code (git pull)
- [ ] Install new dependencies
- [ ] Run database migrations (if any)
- [ ] Build application
- [ ] Start with PM2
- [ ] Test application
- [ ] Update Nginx if needed

### Post-Deployment
- [ ] Monitor logs for errors
- [ ] Test all features
- [ ] Verify database persistence
- [ ] Check SSL certificate
- [ ] Confirm backups running
- [ ] Document changes

---

## Emergency Procedures

### Application Down
1. Check PM2 status: `pm2 status`
2. View error logs: `pm2 logs --err`
3. Restart application: `pm2 restart ceritakita-booking`
4. Check system resources: `free -h`, `df -h`

### Database Corruption
1. Stop application: `pm2 stop ceritakita-booking`
2. Restore from latest backup
3. Verify integrity: `sqlite3 bookings.db "PRAGMA integrity_check;"`
4. Restart application

### SSL Certificate Expired
1. Renew certificate: `sudo certbot renew`
2. Reload Nginx: `sudo systemctl reload nginx`
3. Test: `curl -I https://your-domain.com`

### Server Reboot Required
1. PM2 will auto-start if configured
2. Verify: `pm2 status`
3. Test application
4. Check Nginx: `sudo systemctl status nginx`

---

## Support & Documentation

### Useful Commands Reference
```bash
# Full restart sequence
pm2 stop ceritakita-booking
cd /var/www/ceritakita-booking
git pull origin main
npm ci --only=production
npm run build
pm2 start ceritakita-booking
pm2 logs

# Emergency rollback
sudo cp /var/backups/ceritakita/bookings.db.20241225_020000 /var/www/ceritakita-booking/data/bookings.db
pm2 restart ceritakita-booking
```

### Monitoring Scripts
Create `/usr/local/bin/ceritakita-monitor.sh`:
```bash
#!/bin/bash
# Health check script
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "[$(date)] System OK" >> /var/log/ceritakita/health.log
else
    echo "[$(date)] Health check FAILED" >> /var/log/ceritakita/health.log
    pm2 restart ceritakita-booking
fi
```

Add to crontab:
```bash
*/5 * * * * /usr/local/bin/ceritakita-monitor.sh
```

---

**Remember**: Always test in a staging environment before deploying to production. Keep backups current and monitor system health regularly.