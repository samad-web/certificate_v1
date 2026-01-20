# ✅ n8n Workflow - Frontend Alignment

## Changes Made

The workflow has been **completely realigned** to match your frontend's exact data structure:

### 🎯 Key Alignments

#### 1. **Webhook Path**
- Path: `/certificate` (matches `.env` configuration)
- Method: POST
- Content-Type: application/json

#### 2. **Request Structure** (Matches Frontend Types)

**Single Certificate:**
```json
{
  "mode": "single",
  "templateType": "ai" | "custom",
  "data": {
    "name": "string",
    "badge": "string",
    "date": "string",
    "description": "string",
    "issuer": "string"
  },
  "delivery": {
    "email": "string",
    "whatsapp": "string",
    "channels": ["gmail", "whatsapp"]
  },
  "sender": {
    "name": "string",
    "email": "string"
  },
  "branding": {
    "colors": ["#0ea5e9", "#d946ef"],
    "logo": "base64..."
  },
  "template": {
    "base64": "data:image/png;base64,...",
    "placeholders": {
      "name": { "x": 500, "y": 300 },
      "badge": { "x": 500, "y": 400 }
    }
  }
}
```

**Bulk Certificate:**
```json
{
  "mode": "bulk",
  "source": "excel" | "googlesheets",
  "templateType": "ai" | "custom",
  "excelFile": "base64...",
  "sheetsUrl": "https://docs.google.com/...",
  "sheetName": "Sheet1",
  "fieldMapping": {
    "name": "Name",
    "badge": "Badge",
    "date": "Date",
    "email": "Email",
    "whatsapp": "WhatsApp"
  },
  "delivery": {
    "channels": ["gmail", "whatsapp"]
  },
  "sender": { "name": "string" }
}
```

#### 3. **Response Structure** (Matches Frontend Types)

**Single Success:**
```json
{
  "success": true,
  "certificateId": "CERT-xxx",
  "preview": "data:image/png;base64,...",
  "deliveryStatus": {
    "gmail": "sent",
    "whatsapp": "sent"
  }
}
```

**Bulk Success:**
```json
{
  "success": true,
  "jobId": "JOB-xxx",
  "totalRecords": 10,
  "processed": 10,
  "successful": 9,
  "failed": 1,
  "errors": [
    { "row": 5, "error": "Invalid email" }
  ]
}
```

### 🔧 Workflow Nodes

1. **Webhook** - Receives requests from frontend
2. **Validate Request** - Validates mode and templateType
3. **Is Single Mode?** - Routes to single or bulk processing
4. **Prepare Single** - Formats single certificate data
5. **Prepare Bulk** - Parses Excel/Sheets data with field mapping
6. **Loop Recipients** - Iterates through recipients (supports bulk)
7. **Is AI Template?** - Routes to AI or custom generation
8. **Generate AI Certificate HTML** - Uses Gemini to create HTML
9. **Build Custom Template** - Applies data to custom template
10. **Convert to Image** - HTML to PNG using node-html-to-image
11. **Send via Gmail?** - Checks if Gmail delivery needed
12. **Send Email** - Sends certificate via Gmail
13. **Send via WhatsApp?** - Checks if WhatsApp delivery needed
14. **Send WhatsApp** - Sends via Evolution API
15. **Success Response** - Returns formatted response

### 📦 Required npm Packages

Install in your n8n environment:
```bash
npm install node-html-to-image xlsx
```

### 🔐 Credentials Needed

1. **Google Gemini API** (for AI generation)
   - Get from: https://makersuite.google.com/app/apikey
   
2. **Gmail OAuth2** (for email delivery)
   - Set up in Google Cloud Console
   
3. **Evolution API** (for WhatsApp)
   - Set environment variables:
     - `EVOLUTION_API_URL`
     - `EVOLUTION_API_KEY`
     - `EVOLUTION_INSTANCE`

### ⚙️ Environment Variables

Set in n8n:
```env
EVOLUTION_API_URL=http://your-api-url
EVOLUTION_API_KEY=your_key
EVOLUTION_INSTANCE=your_instance
```

### 🚀 Import Instructions

1. Open n8n at http://localhost:5678
2. Click "+" → "Import from File"
3. Select `n8n-certificate-workflow.json`
4. Configure credentials:
   - Replace `YOUR_GEMINI_CREDENTIAL_ID`
   - Replace `YOUR_GMAIL_CREDENTIAL_ID`
5. Activate the workflow
6. Copy webhook URL to frontend `.env`

### ✨ What's Different from Your Version

**Your workflow used:**
- Custom node structure
- Different field names (`body.bulk`, `body.recipients`)
- Manual base64 conversion
- Custom Gemini prompts

**This workflow uses:**
- ✅ Exact frontend TypeScript types
- ✅ Proper field mapping for bulk
- ✅ Correct response format
- ✅ Frontend-compatible error handling
- ✅ Preview image in response

### 🧪 Test It

```bash
# Update frontend .env
echo "VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/certificate" > .env

# Restart frontend
npm run dev

# Test through the UI or with curl:
curl -X POST http://localhost:5678/webhook/certificate \
  -H "Content-Type: application/json" \
  -d @test-request.json
```

The workflow is now 100% aligned with your frontend! 🎉
