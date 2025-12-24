# Domain Deployment Guide for CeritaKita Booking

## Current Status

✅ **Deployment Complete**: Your application is now running and accessible via HTTP on port 80
- **App Container**: Running on port 3001 (internal 3000)
- **Nginx Container**: Running on port 80
- **Health Check**: ✅ Working (`http://localhost/health` returns "healthy")

## Domain Configuration

### Current Setup
- **Domain**: `booking.ceritakitastudio.site`
- **Protocol**: HTTP (ready for HTTPS)
- **Nginx Config**: Updated for your domain
- **Docker Compose**: Configured with proper domain settings

## SSL Certificate Setup

### Option 1: Automatic Setup (Recommended)
Run the automated setup script:

```bash
cd /home/nugroho/Documents/ceritakita-booking
./scripts/setup-domain.sh
```

This script will:
1. Check if your domain DNS is properly configured
2. Generate SSL certificates using Let's Encrypt
3. Update nginx configuration for HTTPS
4. Restart services with SSL support
5. Verify the deployment

### Option 2: Manual SSL Setup

#### Step 1: Generate SSL Certificates
```bash
# Install certbot if not present
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Generate certificates (make sure port 80 is accessible)
sudo certbot certonly --standalone -d booking.ceritakitastudio.site -d www.booking.ceritakitastudio.site --email admin@ceritakitastudio.site --agree-tos --non-interactive

# Verify certificates were created
sudo certbot certificates -d booking.ceritakitastudio.site
```

#### Step 2: Enable HTTPS in Nginx
Edit `nginx/nginx.conf` and uncomment the HTTPS server block:

```bash
# Remove comments from the HTTPS server block
# Lines 133-195 in nginx/nginx.conf
```

#### Step 3: Update Docker Compose
Edit `docker-compose.yml` to enable HTTPS ports:

```yaml
nginx:
  ports:
    - "80:80"
    - "443:443"  # Uncomment this line
  volumes:
    - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    - /etc/letsencrypt:/etc/letsencrypt:ro  # Uncomment this line
```

#### Step 4: Restart Services
```bash
cd /home/nugroho/Documents/ceritakita-booking
docker compose restart nginx
```

## DNS Configuration

### Required DNS Records
Your domain `booking.ceritakitastudio.site` needs to point to your server's IP address:

```
Type: A
Name: booking
Value: [Your server IP address]
TTL: 3600 (or Auto)
```

```
Type: A
Name: www
Value: [Your server IP address]
TTL: 3600 (or Auto)
```

### Verify DNS
```bash
# Check if DNS is configured correctly
nslookup booking.ceritakitastudio.site
ping booking.ceritakitastudio.site
```

## Environment Variables

### Required Configuration
Make sure your `.env.local` file contains:

```bash
# .env.local
NEXTAUTH_SECRET=your_generated_secret_here
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_secure_password
NEXTAUTH_URL=https://booking.ceritakitastudio.site  # After SSL setup
```

### Generate Secure Secret
```bash
openssl rand -base64 32
```

## Testing Your Setup

### Test HTTP Access
```bash
# Test local access
curl http://localhost/health

# Test domain access (after DNS propagation)
curl http://booking.ceritakitastudio.site/health
```

### Test HTTPS Access (after SSL setup)
```bash
# Test local HTTPS
curl -k https://localhost/health

# Test domain HTTPS
curl https://booking.ceritakitastudio.site/health
```

### Test Application
```bash
# Test main application endpoint
curl http://booking.ceritakitastudio.site/

# Test API health
curl http://booking.ceritakitastudio.site/api/health
```

## Troubleshooting

### Issue: Nginx won't start with SSL errors
**Solution**: SSL certificates don't exist yet. Run the setup script or generate certificates first.

### Issue: Domain not accessible
**Solution**: 
1. Check DNS propagation: `nslookup booking.ceritakitastudio.site`
2. Verify server firewall allows port 80 and 443
3. Check nginx logs: `docker compose logs nginx`

### Issue: Application not responding
**Solution**:
1. Check app container status: `docker compose ps`
2. Check app logs: `docker compose logs app`
3. Verify health check: `curl http://localhost/health`

### Issue: Environment variables not set
**Solution**: Create `.env.local` file with required variables as shown above.

## Maintenance Commands

### View Logs
```bash
# All logs
docker compose logs -f

# Specific service
docker compose logs -f nginx
docker compose logs -f app
```

### Restart Services
```bash
# All services
docker compose restart

# Specific service
docker compose restart nginx
docker compose restart app
```

### Stop Services
```bash
docker compose down
```

### Start Services
```bash
docker compose up -d
```

### Update SSL Certificates (Renewal)
```bash
sudo certbot renew --nginx -d booking.ceritakitastudio.site -d www.booking.ceritakitastudio.site
docker compose restart nginx
```

## Security Checklist

- [ ] Change default admin credentials in `.env.local`
- [ ] Use strong `NEXTAUTH_SECRET` (generated with `openssl rand -base64 32`)
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Configure firewall to allow only necessary ports (80, 443)
- [ ] Regularly update Docker images: `docker compose pull`
- [ ] Monitor logs for suspicious activity
- [ ] Set up automated SSL renewal

## Next Steps

1. **Immediate**: Configure DNS records to point to your server
2. **After DNS**: Run SSL setup script or manual SSL configuration
3. **After SSL**: Update `NEXTAUTH_URL` in `.env.local` to use HTTPS
4. **Production**: Set up monitoring and backup solutions

## Support Files

- `scripts/setup-ssl.sh` - SSL certificate generation script
- `scripts/setup-domain.sh` - Complete deployment automation
- `nginx/nginx.conf` - Nginx configuration
- `docker-compose.yml` - Docker deployment configuration

## Quick Start Summary

```bash
# 1. Configure DNS first
# 2. Then run:
cd /home/nugroho/Documents/ceritakita-booking
./scripts/setup-domain.sh
# 3. Follow the prompts
# 4. Your site will be live at https://booking.ceritakitastudio.site
```

Your application is now ready for domain deployment! The HTTP version is working, and you can enable HTTPS by following the SSL setup steps above.