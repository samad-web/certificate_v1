# 🚀 Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- n8n installed (or access to n8n Cloud)
- API credentials ready:
  - Google Gemini API key
  - Gmail credentials
  - Evolution API credentials (for WhatsApp)

## Frontend Setup (5 minutes)

1. **Install dependencies**:
```bash
cd certificate_v1
npm install
```

2. **Configure n8n webhook**:
Edit `.env` file:
```env
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/certificate
```

3. **Start development server**:
```bash
npm run dev
```

Open: http://localhost:5173

## n8n Setup (15-20 minutes)

1. **Start n8n**:
```bash
n8n start
```

2. **Install required packages**:
```bash
# In your n8n installation directory
npm install node-html-to-image xlsx
```

3. **Set environment variables**:
Add to `.env` in n8n directory:
```env
GEMINI_API_KEY=your_api_key_here
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=your_key_here
EVOLUTION_INSTANCE=your_instance_name
```

4. **Import workflows**:
- Open n8n at http://localhost:5678
- Create new workflow
- Follow `N8N_WORKFLOW_GUIDE.md` step-by-step
- Configure each node as documented
- Activate workflow

## Test the System (5 minutes)

1. Open frontend at http://localhost:5173
2. Fill in a single certificate form
3. Select "AI Generated"
4. Enter your email
5. Click "Generate & Send"
6. Check your email for certificate

## Production Deployment

### Frontend
```bash
npm run build
```
Upload `dist/` folder to Vercel/Netlify/cPanel

### n8n
- Deploy to n8n Cloud, or
- Use Docker: `docker run -p 5678:5678 n8nio/n8n`

Update `.env` with production URLs.

## Troubleshooting

**Frontend won't start?**
- Run `npm install` again
- Check Node.js version (18+)
- Clear `node_modules` and reinstall

**n8n webhook not responding?**
- Verify n8n is running
- Check webhook URL in `.env`
- Enable CORS in n8n settings
- Verify workflow is activated

**Certificates not generating?**
- Check Gemini API key is valid
- Verify n8n workflow execution logs
- Check node-html-to-image is installed

**Email/WhatsApp not sending?**
- Verify Gmail/Evolution API credentials
- Check API quotas and limits
- Review n8n execution logs for errors

## Project Structure

```
certificate_v1/
├── src/
│   ├── components/       # React components
│   ├── services/         # API services
│   ├── types/           # TypeScript types
│   └── config/          # Configuration
├── README.md            # Full documentation
├── N8N_WORKFLOW_GUIDE.md # n8n setup guide
└── DEPLOYMENT.md        # Deployment guide
```

## Quick Commands

```bash
npm run dev      # Start development
npm run build    # Build for production
npm run preview  # Preview production build
node start.js    # Quick start script
```

## Next Steps

1. ✅ Test single certificate generation
2. ✅ Test bulk upload (Excel)
3. ✅ Configure delivery channels
4. ✅ Deploy to production
5. ⭐ Add your custom features

## Support

- 📖 [Full Documentation](README.md)
- 🛠️ [n8n Setup Guide](N8N_WORKFLOW_GUIDE.md)
- 🚀 [Deployment Guide](DEPLOYMENT.md)
- 💡 [Project Walkthrough](walkthrough.md) (in brain directory)

---

**Need Help?** Check the documentation files for detailed guides!
