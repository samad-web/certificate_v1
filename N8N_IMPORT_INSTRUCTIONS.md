# 📥 How to Import n8n Workflow

## Quick Import Steps

1. **Start n8n**
   ```bash
   n8n start
   ```
   Access at: http://localhost:5678

2. **Import the Workflow**
   - Click **"+"** in the top right
   - Select **"Import from File"**
   - Choose `n8n-certificate-workflow.json`
   - Click **"Import"**

3. **Install Required Packages**
   
   In your terminal (where n8n is running):
   ```bash
   npm install node-html-to-image uuid
   ```

4. **Configure Credentials**

   ### Google Gemini API
   - Click on the "Google Gemini API" node
   - Click "Create New Credential"
   - Enter your Gemini API Key
   - Get key from: https://makersuite.google.com/app/apikey

   ### Gmail
   - Click on the "Send via Gmail" node
   - Click "Create New Credential"
   - Follow OAuth2 authentication flow
   - Or use App Password

5. **Set Environment Variables**

   Create `.env` file in n8n directory:
   ```env
   EVOLUTION_API_URL=http://your-evolution-api-url
   EVOLUTION_API_KEY=your_api_key
   EVOLUTION_INSTANCE=your_instance_name
   ```

6. **Activate the Workflow**
   - Click the toggle at top to **activate**
   - The webhook URL will be shown

7. **Update Frontend**
   
   Update `certificate_v1/.env`:
   ```env
   VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/certificate
   ```

## 🧪 Test the Workflow

### Test Single Certificate (AI)
```bash
curl -X POST http://localhost:5678/webhook/certificate \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "single",
    "templateType": "ai",
    "data": {
      "name": "John Doe",
      "badge": "Excellence Award",
      "date": "2024-01-14",
      "description": "For outstanding performance"
    },
    "delivery": {
      "email": "test@example.com",
      "channels": ["gmail"]
    },
    "sender": {
      "name": "ABC Organization"
    }
  }'
```

## 📝 Notes

- **Gemini API**: Required for AI-generated certificates
- **Gmail**: Set up OAuth2 or App Password
- **WhatsApp**: Requires Evolution API setup
- **node-html-to-image**: Converts HTML to PNG images

## 🔧 Troubleshooting

**Workflow not executing?**
- Check if workflow is activated (toggle on)
- Verify webhook path is `/certificate`
- Check n8n console for errors

**Credentials not working?**
- Re-authenticate Gmail OAuth
- Verify Gemini API key is valid
- Check API quotas

**Images not generating?**
- Ensure `node-html-to-image` is installed
- Check Puppeteer dependencies
- May need: `apt-get install -y chromium`

## 🎯 What This Workflow Does

1. **Receives** webhook requests from frontend
2. **Validates** request data
3. **Routes** based on mode (single/bulk) and template type
4. **Generates** certificates using AI (Gemini) or custom templates
5. **Converts** HTML to PNG images
6. **Delivers** via Gmail and/or WhatsApp
7. **Returns** success response with certificate ID

Perfect for production use! 🚀
