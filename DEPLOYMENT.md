# Deployment Guide

## Frontend Deployment Options

### Option 1: Vercel (Recommended for Vite)

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Login and deploy**:
```bash
vercel login
vercel --prod
```

3. **Set environment variables**:
- Go to Vercel dashboard → Project Settings → Environment Variables
- Add: `VITE_N8N_WEBHOOK_URL` = your n8n URL

### Option 2: Netlify

1. **Build the project**:
```bash
npm run build
```

2. **Deploy via Netlify CLI**:
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

Or drag and drop the `dist` folder to Netlify dashboard.

3. **Set environment variables**:
- Go to Site Settings → Build & Deploy → Environment
- Add: `VITE_N8N_WEBHOOK_URL`

### Option 3: cPanel Hosting

1. **Build the project**:
```bash
npm run build
```

2. **Upload files**:
- Compress the `dist` folder to `dist.zip`
- Upload to cPanel File Manager
- Extract to `public_html` (or subdirectory)

3. **Create `.htaccess`** for SPA routing:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

4. **Update n8n URL**:
- Edit `assets/index-*.js` in the built files
- Find and replace the n8n localhost URL with your production URL
- Or rebuild with correct `VITE_N8N_WEBHOOK_URL`

## n8n Deployment Options

### Option 1: n8n Cloud

1. **Sign up** at https://n8n.cloud
2. **Import workflows**:
   - Create new workflow
   - Copy workflow JSON from guide
   - Paste and activate
3. **Set credentials**:
   - Gemini API key
   - Gmail OAuth2
   - Evolution API credentials
4. **Get webhook URL**:
   - Copy your workflow webhook URL
   - Update frontend environment variable

### Option 2: Self-Hosted with Docker

1. **Create docker-compose.yml**:
```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your_password
      - WEBHOOK_URL=https://your-domain.com
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - EVOLUTION_API_URL=${EVOLUTION_API_URL}
      - EVOLUTION_API_KEY=${EVOLUTION_API_KEY}
      - EVOLUTION_INSTANCE=${EVOLUTION_INSTANCE}
    volumes:
      - n8n_data:/home/node/.n8n
    restart: unless-stopped

volumes:
  n8n_data:
```

2. **Start n8n**:
```bash
docker-compose up -d
```

3. **Access n8n**:
- Open http://your-server:5678
- Import workflows
- Configure credentials

### Option 3: VPS with PM2

1. **Install n8n globally**:
```bash
npm install -g n8n
```

2. **Install required packages**:
```bash
# Create a global node_modules directory
mkdir -p ~/.n8n/custom
cd ~/.n8n/custom
npm install node-html-to-image xlsx
```

3. **Create ecosystem file** `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'n8n',
    script: 'n8n',
    env: {
      N8N_PORT: 5678,
      WEBHOOK_URL: 'https://your-domain.com',
      GEMINI_API_KEY: 'your_key',
      EVOLUTION_API_URL: 'http://localhost:8080',
      EVOLUTION_API_KEY: 'your_key',
      EVOLUTION_INSTANCE: 'your_instance'
    }
  }]
};
```

4. **Start with PM2**:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

5. **Setup Nginx reverse proxy**:
```nginx
server {
    listen 80;
    server_name n8n.yourdomain.com;

    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Post-Deployment Checklist

### Frontend
- [ ] Environment variables set correctly
- [ ] n8n webhook URL updated
- [ ] CORS enabled in n8n for your domain
- [ ] Application loads without errors
- [ ] Form submissions reach n8n

### n8n
- [ ] All workflows imported
- [ ] Gemini API credentials configured
- [ ] Gmail credentials configured
- [ ] Evolution API credentials configured
- [ ] Google Sheets credentials configured (if using)
- [ ] All workflows activated
- [ ] Webhook endpoint accessible
- [ ] Test certificate generation works

### Testing
- [ ] Single AI certificate generation
- [ ] Single custom template
- [ ] Bulk Excel upload
- [ ] Bulk Google Sheets
- [ ] Gmail delivery
- [ ] WhatsApp delivery
- [ ] Error handling

## SSL/HTTPS Setup

### For n8n (Using Let's Encrypt)

```bash
sudo certbot --nginx -d n8n.yourdomain.com
```

### For Frontend (Vercel/Netlify)
- Automatic SSL provided
- Custom domain setup in dashboard

## Monitoring & Logs

### n8n Logs
```bash
# Docker
docker logs n8n -f

# PM2
pm2 logs n8n
```

### Frontend (Vercel)
- Check deployment logs in Vercel dashboard
- Monitor Functions tab for errors

## Backup

### n8n
```bash
# Backup workflows
docker exec n8n n8n export:workflow --all --output=/backup

# Backup credentials (encrypted)
docker exec n8n n8n export:credentials --all --output=/backup
```

### Frontend
- Store in Git repository
- Archive production build

## Scaling

### n8n
- Use n8n queue mode for high concurrency
- Deploy multiple n8n instances
- Use Redis for state management

### Frontend
- Enable CDN (automatic on Vercel/Netlify)
- Optimize images and bundle size
- Implement code splitting

---

**Need Help?**
- Frontend issues → Check browser console
- n8n issues → Check workflow execution logs
- API issues → Verify credentials and endpoints
