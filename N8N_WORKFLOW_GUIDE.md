# n8n Workflow Guide - Certificate Generator

This document provides comprehensive guidance for setting up the n8n workflows for the certificate generator system.

## Overview

The n8n backend consists of a main orchestration workflow that routes requests to specialized sub-workflows for certificate generation, rendering, and delivery.

## Prerequisites

1. **n8n Installation**: Ensure n8n is installed and running
2. **API Credentials**:
   - Google Gemini API key
   - Gmail OAuth2 credentials or App Password
   - Evolution API URL and authentication
   - Google Sheets API credentials (for bulk mode)

## Main Workflow: Certificate Orchestrator

### Workflow Structure

```
Webhook → Validate Input → Route by Mode → Process → Respond
```

### Node Configuration

#### 1. Webhook Node
- **Name**: `Certificate Request Webhook`
- **HTTP Method**: POST
- **Path**: `/webhook/certificate`
- **Response Mode**: When Last Node Finishes
- **Response Data**: Last Node

#### 2. Validation Node (Code)
```javascript
// Validate incoming request
const body = $input.item.json;

if (!body.mode || !body.templateType) {
  return {
    success: false,
    error: 'Missing required fields: mode and templateType',
    code: 'VALIDATION_ERROR'
  };
}

if (body.mode === 'single') {
  if (!body.data || !body.data.name || !body.data.badge) {
    return {
      success: false,
      error: 'Missing required certificate data',
      code: 'VALIDATION_ERROR'
    };
  }
}

// Pass through validated data
return body;
```

#### 3. Router (Switch)
- **Name**: `Route Request`
- **Mode**: Expression
- **Routing Rules**:
  1. `{{ $json.mode === 'single' && $json.templateType === 'custom' }}` → Custom Single
  2. `{{ $json.mode === 'single' && $json.templateType === 'ai' }}` → AI Single
  3. `{{ $json.mode === 'bulk' && $json.source === 'excel' }}` → Bulk Excel
  4. `{{ $json.mode === 'bulk' && $json.source === 'googlesheets' }}` → Bulk Sheets

---

## Sub-Workflow: Single Certificate - AI Generated

### Node Sequence

#### 1. Prepare Gemini Prompt (Code)
```javascript
const data = $input.item.json.data;
const branding = $input.item.json.branding || {};

const colors = branding.colors || ['#1e40af', '#3b82f6'];
const colorString = colors.join(', ');

const prompt = `Create a professional, modern certificate design in HTML and CSS with the following specifications:

CERTIFICATE DETAILS:
- Recipient Name: ${data.name}
- Award/Badge: ${data.badge}
- Date: ${data.date}
- Description: ${data.description || ''}
- Issuer: ${data.issuer || ''}

DESIGN REQUIREMENTS:
- Size: 1200px × 800px
- Use elegant fonts (Google Fonts: Playfair Display for names, Inter for body text)
- Brand colors: ${colorString}
- Include decorative border and elements
- Professional, premium aesthetic
- All positioning must use absolute positioning
- Include subtle gradients and shadows

OUTPUT FORMAT:
Return ONLY the complete HTML code with inline CSS. No markdown, no explanations. The HTML should be ready to render as-is.`;

return {
  prompt,
  data
};
```

#### 2. Call Gemini API (HTTP Request)
- **URL**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={{$env.GEMINI_API_KEY}}`
- **Method**: POST
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "contents": [{
    "parts": [{
      "text": "{{ $json.prompt }}"
    }]
  }]
}
```

#### 3. Extract HTML (Code)
```javascript
const response = $input.item.json;
let html = response.candidates[0].content.parts[0].text;

// Clean up markdown code blocks if present
html = html.replace(/```html\n?/g, '').replace(/```\n?/g, '');

return { html, data: $node['Prepare Gemini Prompt'].json.data };
```

#### 4. HTML to Image (Code - using node-html-to-image)
```javascript
// Install: npm install node-html-to-image
const nodeHtmlToImage = require('node-html-to-image');

const html = $input.item.json.html;

const image = await nodeHtmlToImage({
  html,
  type: 'png',
  encoding: 'base64'
});

return {
  certificateImage: `data:image/png;base64,${image}`,
  data: $input.item.json.data
};
```

#### 5. Send to Delivery
→ Connect to Delivery Sub-Workflow

---

## Sub-Workflow: Single Certificate - Custom Template

### Node Sequence

#### 1. Extract Template Data (Code)
```javascript
const body = $input.item.json;
const template = body.template;
const data = body.data;

return {
  templateBase64: template.base64,
  placeholders: template.placeholders,
  data
};
```

#### 2. Generate Certificate HTML (Code)
```javascript
const { templateBase64, placeholders, data } = $input.item.json;

// Create HTML with background image and positioned text
const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Roboto:wght@400;500&display=swap');
    
    body {
      margin: 0;
      padding: 0;
      width: 1200px;
      height: 800px;
    }
    
    .certificate {
      width: 100%;
      height: 100%;
      background-image: url('${templateBase64}');
      background-size: cover;
      background-position: center;
      position: relative;
    }
    
    .field {
      position: absolute;
      font-family: 'Roboto', sans-serif;
      color: #1a1a1a;
    }
    
    .name {
      font-family: 'Playfair Display', serif;
      font-size: ${placeholders.name?.fontSize || 48}px;
      font-weight: 700;
      color: ${placeholders.name?.color || '#1e40af'};
    }
    
    .badge {
      font-size: ${placeholders.badge?.fontSize || 32}px;
      font-weight: 500;
    }
    
    .description {
      font-size: ${placeholders.description?.fontSize || 18}px;
      max-width: 600px;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="field name" style="left: ${placeholders.name.x}px; top: ${placeholders.name.y}px;">
      ${data.name}
    </div>
    <div class="field badge" style="left: ${placeholders.badge.x}px; top: ${placeholders.badge.y}px;">
      ${data.badge}
    </div>
    <div class="field" style="left: ${placeholders.date?.x || 500}px; top: ${placeholders.date?.y || 500}px;">
      ${data.date}
    </div>
    ${data.description ? `
    <div class="field description" style="left: ${placeholders.description?.x || 500}px; top: ${placeholders.description?.y || 550}px;">
      ${data.description}
    </div>
    ` : ''}
  </div>
</body>
</html>
`;

return { html, data };
```

#### 3. Convert to Image
Same as AI workflow - use node-html-to-image

---

## Sub-Workflow: Bulk Processing

### Node Sequence

#### 1. Fetch Data (Switch)

**For Excel:**
```javascript
// Code node: Parse Excel
const XLSX = require('xlsx');

const base64 = $input.item.json.excelFile;
const buffer = Buffer.from(base64.split(',')[1], 'base64');

const workbook = XLSX.read(buffer);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(worksheet);

return {
  records: data,
  mapping: $input.item.json.fieldMapping,
  templateType: $input.item.json.templateType,
  template: $input.item.json.template,
  delivery: $input.item.json.delivery
};
```

**For Google Sheets:**
- Use Google Sheets node
- **Operation**: Read Rows
- **Document ID**: `{{ $json.sheetsUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)[1] }}`
- **Sheet Name**: `{{ $json.sheetName }}`

#### 2. Map Fields (Code)
```javascript
const records = $input.item.json.records || $input.item.json;
const mapping = $node['Fetch Data'].json.mapping;

const mapped = records.map(row => ({
  name: row[mapping.name],
  badge: row[mapping.badge],
  date: row[mapping.date],
  description: row[mapping.description],
  email: row[mapping.email],
  whatsapp: row[mapping.whatsapp],
  issuer: row[mapping.issuer] || $node['Webhook'].json.sender.name
}));

return mapped;
```

#### 3. Loop Over Records (Loop Over Items)
- **Batch Size**: 1
- Connect to Single Certificate workflow (AI or Custom based on templateType)

#### 4. Collect Results (Code)
```javascript
const allResults = $input.all();

const successful = allResults.filter(r => r.json.success).length;
const failed = allResults.filter(r => !r.json.success).length;
const errors = allResults
  .map((r, idx) => r.json.success ? null : { row: idx + 1, error: r.json.error })
  .filter(e => e !== null);

return {
  success: true,
  jobId: `job_${Date.now()}`,
  totalRecords: allResults.length,
  processed: allResults.length,
  successful,
  failed,
  errors
};
```

---

## Sub-Workflow: Delivery

This receives certificate image and delivery info, then sends via configured channels.

### Node Sequence

#### 1. Extract Delivery Info (Code)
```javascript
const delivery = $input.item.json.delivery;
const certificateImage = $input.item.json.certificateImage;
const data = $input.item.json.data;
const sender = $input.item.json.sender;

return {
  channels: delivery.channels,
  email: delivery.email,
  whatsapp: delivery.whatsapp,
  certificateImage,
  data,
  sender
};
```

#### 2. Route by Channel (Switch)
- **Gmail**: `{{ $json.channels.includes('gmail') }}`
- **WhatsApp**: `{{ $json.channels.includes('whatsapp') }}`

#### 3a. Gmail Send (Gmail Node)
- **Operation**: Send Email
- **To**: `{{ $json.email }}`
- **Subject**: `Your Certificate - {{ $json.data.name }}`
- **Email Type**: HTML
- **Message**:
```html
<p>Dear {{ $json.data.name }},</p>
<p>Congratulations! Your certificate for "<strong>{{ $json.data.badge }}</strong>" is attached.</p>
<p>{{ $json.data.description }}</p>
<p>Best regards,<br>{{ $json.sender.name }}</p>
```
- **Attachments**: Use `Attach File By Base64` with the certificate image

#### 3b. WhatsApp Send (HTTP Request - Evolution API)
- **URL**: `{{ $env.EVOLUTION_API_URL }}/message/sendMedia/{{ $env.EVOLUTION_INSTANCE }}`
- **Method**: POST
- **Headers**:
  - `Content-Type: application/json`
  - `apikey: {{ $env.EVOLUTION_API_KEY }}`
- **Body**:
```json
{
  "number": "{{ $json.whatsapp }}",
  "mediatype": "image",
  "mimetype": "image/png",
  "caption": "🎓 Congratulations {{ $json.data.name }}!\n\nYour certificate for *{{ $json.data.badge }}* is ready.\n\n{{ $json.data.description }}\n\n- {{ $json.sender.name }}",
  "media": "{{ $json.certificateImage }}"
}
```

#### 4. Return Status (Code)
```javascript
const gmailResult = $node['Gmail Send']?.json;
const whatsappResult = $node['WhatsApp Send']?.json;

return {
  success: true,
  certificateId: `cert_${Date.now()}`,
  deliveryStatus: {
    gmail: gmailResult ? 'sent' : undefined,
    whatsapp: whatsappResult ? 'sent' : undefined
  },
  preview: $json.certificateImage
};
```

---

## Environment Variables (.env in n8n)

```bash
GEMINI_API_KEY=your_gemini_api_key
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=your_evolution_api_key
EVOLUTION_INSTANCE=your_instance_name
```

## Testing Checklist

- [ ] Test single AI certificate generation
- [ ] Test single custom template
- [ ] Test Gmail delivery
- [ ] Test WhatsApp delivery
- [ ] Test both channels
- [ ] Test bulk Excel upload (10 records)
- [ ] Test bulk Google Sheets (5 records)
- [ ] Test error handling (invalid email, etc.)

## Troubleshooting

### Common Issues

1. **HTML to Image not working**:
   - Install required package: `npm install node-html-to-image` in n8n
   - Alternatively, use Puppeteer or external service

2. **Gmail authentication errors**:
   - Use OAuth2 or App Password
   - Enable "Less secure app access" if using password

3. **WhatsApp 404 errors**:
   - Verify Evolution API URL and instance name
   - Check API key validity
   - Ensure instance is connected

4. **Gemini API errors**:
   - Validate API key
   - Check quota limits
   - Use retry logic with exponential backoff

## Advanced: Database Integration

For production use, consider adding:
- PostgreSQL/MongoDB to track job status
- Store certificate URLs instead of Base64
- Implement webhook callbacks for bulk job completion
- Add user authentication and multi-tenancy
