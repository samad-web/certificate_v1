# Google Slides Integration - Quick Start Guide

## 🎯 What's New?

You can now use **Google Slides** as a template source for your certificates! This gives you the full power of Google Slides' design tools while maintaining the automated generation workflow.

---

## ⚡ Quick Example

Here's how to use it in 3 simple steps:

### 1️⃣ Prepare Your Google Slides Template

Create a certificate design in Google Slides:
- Open Google Slides: https://slides.google.com
- Design your certificate template
- Add placeholders for dynamic data (name, badge, date, etc.)

### 2️⃣ Get the Shareable Link

```
File → Share → Change to "Anyone with the link" → Copy link
```

Example link format:
```
https://docs.google.com/presentation/d/1abc123XYZ456/edit?usp=sharing
```

### 3️⃣ Use in Certificate Generator

1. Open your certificate app: http://localhost:5173
2. Click **Google Slides** template option
3. Paste your link
4. Click **Show Preview** to verify
5. Fill out recipient details
6. Click **Generate & Send Certificate**

---

## 🎨 Design Tips

### Best Practices for Google Slides Certificates

**Layout:**
- Use 16:9 or custom dimensions
- Keep important content away from edges
- Use high-contrast colors for text readability

**Placeholders:**
- Use clear, consistent naming (e.g., `{{NAME}}`, `{{BADGE}}`)
- Consider font sizes (minimum 16pt for names)
- Test with long names to ensure they fit

**Branding:**
- Add your logo in a corner
- Use your brand colors
- Include subtle background patterns or gradients

---

## 🔧 Integration with n8n

The certificate request now includes Google Slides data:

```json
{
  "mode": "single",
  "templateType": "googleslides",
  "googleSlidesTemplate": {
    "url": "https://docs.google.com/presentation/d/...",
    "embedUrl": "https://docs.google.com/presentation/d/.../embed"
  },
  "data": {
    "name": "John Doe",
    "badge": "Excellence Award",
    "date": "2026-01-20"
  }
}
```

### Backend Processing (n8n workflow)

Your n8n workflow should:
1. Receive the Google Slides URL
2. Make a copy of the template (optional)
3. Replace placeholders with actual data
4. Export as PDF or PNG
5. Send via email/WhatsApp

---

## 📋 Supported Features

✅ URL validation  
✅ Live preview (view/edit modes)  
✅ Automatic slide ID extraction  
✅ Error handling and user feedback  
✅ Responsive embed display  
✅ External editing link  

---

## 🚀 Example Workflow

**Scenario**: Send graduation certificates to 100 students

1. **Design once** in Google Slides
2. **Get share link** (one-time setup)
3. **Bulk upload** student data via Excel/Google Sheets
4. Use **Google Slides template** for all certificates
5. **Auto-generate and send** to all recipients

---

## ❓ FAQ

**Q: Can I edit the template after starting generation?**  
A: Yes! Changes to the Google Slides template can be reflected by using the same URL.

**Q: What happens if I delete the original slide?**  
A: The generation will fail. Always keep the original template accessible.

**Q: Can I use private Google Slides?**  
A: You need to set sharing to "Anyone with the link" for the embed to work.

**Q: What export formats are supported?**  
A: This depends on your n8n backend configuration. Typically PDF and PNG.

---

## 🎯 Next Steps

1. ✅ **Feature is live** - Start using Google Slides templates now!
2. 🔄 **Update n8n workflow** - Add Google Slides processing logic
3. 📊 **Test with real data** - Generate sample certificates
4. 🚀 **Deploy** - Roll out to production

---

## 💡 Pro Tips

> **Tip 1**: Create a library of template designs in Google Slides for different certificate types  
> **Tip 2**: Use Google Slides' collaboration features to let your team refine designs together  
> **Tip 3**: Keep a backup copy of your templates in a dedicated Google Drive folder  

---

Need help? The application includes built-in instructions when you select the Google Slides option!
