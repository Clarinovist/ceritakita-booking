# SSL Certificate Setup

This directory contains SSL/TLS certificates for HTTPS.

## For Production (with SSL)

### Option 1: Let's Encrypt (Recommended)

1. Install Certbot on your host machine:
   ```bash
   sudo apt-get update
   sudo apt-get install certbot
   ```

2. Generate certificates:
   ```bash
   sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
   ```

3. Copy certificates to this directory:
   ```bash
   sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./cert.pem
   sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./key.pem
   sudo chmod 644 cert.pem
   sudo chmod 600 key.pem
   ```

4. Update `nginx/nginx.conf` to use the correct certificate paths.

### Option 2: Self-Signed Certificates (Development Only)

**WARNING: Self-signed certificates should ONLY be used for local development/testing!**

Generate self-signed certificates:
```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./key.pem \
  -out ./cert.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

## For Development (HTTP Only)

If you don't need HTTPS for local development:

1. Comment out the HTTPS server block in `nginx/nginx.conf`
2. Update the HTTP server block to proxy instead of redirect:
   ```nginx
   location / {
       proxy_pass http://nextjs_app;
       # ... proxy settings
   }
   ```

## Certificate Renewal

Let's Encrypt certificates expire every 90 days. Set up auto-renewal:

```bash
# Test renewal
sudo certbot renew --dry-run

# Add to crontab (runs twice daily)
0 */12 * * * certbot renew --quiet && cp /etc/letsencrypt/live/yourdomain.com/*.pem /path/to/nginx/ssl/ && docker-compose restart nginx
```

## Security Notes

- **NEVER commit certificate files to git** (already in .gitignore)
- Keep private keys (`key.pem`) secure with proper permissions (600)
- Use strong certificates (minimum 2048-bit RSA or 256-bit ECDSA)
- Regularly update certificates before expiration
