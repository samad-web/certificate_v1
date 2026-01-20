# Certificate Generator System

A production-ready SaaS certificate generator with Vite frontend and n8n backend orchestration. Supports single and bulk certificate generation with custom templates or AI-generated designs, automated delivery via Gmail and WhatsApp.

## Features

✨ **Dual Generation Modes**
- **AI-Generated**: Let Google Gemini create beautiful certificate designs automatically
- **Custom Template**: Upload your own template (PNG, JPG, PDF) with customizable placeholders

📧 **Multi-Channel Delivery**
- Email via Gmail API
- WhatsApp via Evolution API
- Support for both channels simultaneously

📊 **Bulk Processing**
- Excel file upload (.xlsx, .xls)
- Google Sheets integration
- Field mapping interface
- Progress tracking and error reporting

🎨 **Modern UI**
- Built with React + TypeScript
- TailwindCSS styling
- Responsive design
- Real-time validation

## Project Structure

```
certificate_v1/
├── src/
│   ├── components/
│   │   ├── CertificateForm.tsx    # Main form component
│   │   ├── BulkUpload.tsx         # Bulk upload interface
│   │   └── CertificatePreview.tsx # Preview component
│   ├── services/
│   │   └── webhookService.ts      # n8n webhook integration
│   ├── types/
│   │   └── certificate.ts         # TypeScript definitions
│   ├── config/
│   │   └── config.ts              # Configuration
│   ├── App.tsx                    # Main app
│   └── index.css                  # Styles
├── N8N_WORKFLOW_GUIDE.md          # Detailed n8n setup guide
└── README.md                      # This file
```

## Installation

### Frontend Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment variables**:
Create a `.env` file in the root directory:
```env
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/certificate
```

3. **Start development server**:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### n8n Setup

1. **Install n8n** (if not already installed):
```bash
npm install -g n8n
```

2. **Install required packages** in n8n:
```bash
# In your n8n directory
npm install node-html-to-image xlsx
```

3. **Configure environment variables**:
Add to your n8n `.env` file:
```env
GEMINI_API_KEY=your_gemini_api_key
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=your_evolution_api_key
EVOLUTION_INSTANCE=your_instance_name
```

4. **Import workflows**:
- Follow the detailed guide in `N8N_WORKFLOW_GUIDE.md`
- Create the main orchestrator workflow
- Set up sub-workflows for AI generation, custom templates, and delivery

## Usage Guide

### Single Certificate Generation

#### AI-Generated Template
1. Select "Single Certificate" mode
2. Choose "AI Generated" template type
3. Enter recipient information:
   - Name, Badge/Title, Date
   - Description (optional)
   - Issuer name
4. Optionally add brand colors (hex codes)
5. Select delivery channels
6. Click "Generate & Send Certificate"

#### Custom Template
1. Select "Single Certificate" mode
2. Choose "Custom Template" template type
3. Upload your template file
4. The system will automatically position placeholders
5. Enter recipient data
6. Select delivery channels
7. Generate and send

### Bulk Certificate Generation

#### Excel Upload
1. Select "Bulk Generation" mode
2. Choose "Excel File" as data source
3. Upload your Excel file with columns:
   - Name, Badge, Date, Description (optional)
   - Email, WhatsApp (based on delivery channels)
4. Map Excel columns to certificate fields
5. Select template type (AI or Custom)
6. Process bulk certificates

#### Google Sheets
1. Select "Bulk Generation" mode
2. Choose "Google Sheets" as data source
3. Enter your Google Sheets URL
4. Specify sheet name (default: Sheet1)
5. Map columns to fields
6. Select template type
7. Process

## API Documentation

### Request Format (Single Certificate)

```json
{
  "mode": "single",
  "templateType": "ai",
  "data": {
    "name": "John Doe",
    "badge": "Excellence Award",
    "date": "2026-01-14",
    "description": "For outstanding achievement",
    "issuer": "ABC Organization"
  },
  "branding": {
    "colors": ["#1e40af", "#3b82f6"]
  },
  "delivery": {
    "email": "john@example.com",
    "whatsapp": "+1234567890",
    "channels": ["gmail", "whatsapp"]
  },
  "sender": {
    "name": "ABC Organization",
    "email": "sender@abc.org"
  }
}
```

### Response Format

```json
{
  "success": true,
  "certificateId": "cert_abc123",
  "deliveryStatus": {
    "gmail": "sent",
    "whatsapp": "sent"
  },
  "preview": "data:image/png;base64,..."
}
```

## Configuration

### Frontend Configuration (`src/config/config.ts`)

- `n8nWebhookUrl`: n8n webhook endpoint
- `maxFileSize`: Maximum upload file size (default: 10MB)
- `supportedImageFormats`: Allowed template formats
- `supportedExcelFormats`: Allowed Excel formats
- `maxBatchSize`: Maximum bulk records (default: 100)

### n8n Configuration

See `N8N_WORKFLOW_GUIDE.md` for detailed workflow setup and configuration.

## Deployment

### Frontend Deployment

#### Production Build
```bash
npm run build
```

Deploy the `dist` folder to:
- **Vercel**: `vercel --prod`
- **Netlify**: Drag & drop `dist` folder
- **cPanel**: Upload to `public_html`

#### Environment Variables
Set `VITE_N8N_WEBHOOK_URL` to your production n8n URL

### n8n Deployment

#### Self-Hosted
```bash
# Using PM2
pm2 start n8n

# Using Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

#### n8n Cloud
- Deploy to n8n.cloud
- Import workflows
- Configure credentials
- Update frontend webhook URL

## Security Considerations

1. **API Keys**: Never commit API keys - use environment variables
2. **CORS**: Configure CORS in n8n for your frontend domain
3. **Rate Limiting**: Implement rate limiting in n8n
4. **Input Validation**: Both frontend and backend validate inputs
5. **File Upload**: Validate file types and sizes
6. **Authentication**: Add user authentication for production use

## Troubleshooting

### Common Issues

**Frontend won't connect to n8n**
- Check `VITE_N8N_WEBHOOK_URL` in `.env`
- Verify n8n is running on specified port
- Check CORS settings in n8n

**Certificates not generating**
- Check n8n workflow is activated
- Verify Gemini API key is valid
- Check node-html-to-image is installed

**Email delivery failing**
- Verify Gmail credentials in n8n
- Check OAuth2 configuration
- Review Gmail sending limits

**WhatsApp not sending**
- Confirm Evolution API is running
- Verify instance is connected
- Check API key and URL

## Development

### Running Tests
```bash
npm run test
```

### Lint & Format
```bash
npm run lint
npm run format
```

### Type Checking
```bash
npm run type-check
```

## Scaling Considerations

### For Production SaaS

1. **Database Integration**
   - Store certificate records
   - Track delivery status
   - User management

2. **Cloud Storage**
   - Store templates in S3/GCS
   - Reference by URL instead of Base64

3. **Queue System**
   - Redis-based queue for bulk jobs
   - Async processing with webhooks

4. **Multi-Tenancy**
   - Tenant isolation
   - Per-tenant quotas
   - Custom branding per tenant

5. **Monitoring**
   - Application Performance Monitoring
   - Error tracking (Sentry)
   - Analytics

## Tech Stack

- **Frontend**: Vite, React 18, TypeScript
- **Styling**: TailwindCSS
- **Form Handling**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Backend**: n8n workflow automation
- **AI**: Google Gemini 1.5
- **Email**: Gmail API
- **WhatsApp**: Evolution API
- **File Processing**: XLSX, node-html-to-image

## License

MIT License - feel free to use for personal or commercial projects

## Support

For issues and questions:
1. Check `N8N_WORKFLOW_GUIDE.md` for n8n setup
2. Review the troubleshooting section
3. Consult n8n documentation: https://docs.n8n.io
4. Check Evolution API docs: https://doc.evolution-api.com

---

Built with ❤️ for seamless certificate generation and delivery
