// Certificate data types
export interface CertificateData {
    certificateTitle?: string;  // e.g., "Certificate of Completion"
    name: string;                // Recipient name
    awardPurpose?: string;       // e.g., "For successfully completing..."
    programName?: string;        // Program/Course/Event name
    issuer?: string;             // Issuing organization
    date: string;                // Date of issue
    badge?: string;              // Legacy field (kept for backwards compatibility)
    description?: string;        // Legacy field (kept for backwards compatibility)
}

// Template types
export type TemplateType = 'ai' | 'googleslides';

export interface PlaceholderPosition {
    x: number;
    y: number;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
}

export interface CustomTemplate {
    base64: string;
    placeholders: Record<string, PlaceholderPosition>;
}

export interface GoogleSlidesTemplate {
    url: string;
    embedUrl: string;
    imageUrl?: string;
    imageWidth?: number;
    imageHeight?: number;
    positionX?: number;
    positionY?: number;
    slideId?: string;
    placeholderMapping?: Record<string, string>; // Maps slide placeholder name -> column name
}

export interface AIBranding {
    colors?: string[];
    logo?: string;
}

// Delivery types
export type DeliveryChannel = 'gmail' | 'whatsapp';

export interface DeliveryInfo {
    email?: string;
    whatsapp?: string;
    channels: DeliveryChannel[];
}

export interface SenderInfo {
    name: string;
    email?: string;
}

// Bulk upload types
export type BulkSource = 'excel' | 'googlesheets';

export interface FieldMapping {
    [key: string]: string; // certificateField -> columnName
}

// Request payload types
export interface SingleCertificateRequest {
    mode: 'single';
    templateType: TemplateType;
    template?: CustomTemplate;
    googleSlidesTemplate?: GoogleSlidesTemplate;
    data: CertificateData;
    branding?: AIBranding;
    delivery: DeliveryInfo;
    sender: SenderInfo;
}

export interface BulkCertificateRequest {
    mode: 'bulk';
    source: BulkSource;
    templateType: TemplateType;
    template?: CustomTemplate;
    googleSlidesTemplate?: GoogleSlidesTemplate;
    excelFile?: string; // base64
    sheetsUrl?: string;
    sheetName?: string;
    fieldMapping: FieldMapping;
    delivery: {
        channels: DeliveryChannel[];
    };
    sender: SenderInfo;
    branding?: AIBranding;
}

export type CertificateRequest = SingleCertificateRequest | BulkCertificateRequest;

// Response types
export interface DeliveryStatus {
    gmail?: 'sent' | 'failed';
    whatsapp?: 'sent' | 'failed';
}

export interface SingleCertificateResponse {
    success: boolean;
    certificateId?: string;
    deliveryStatus?: DeliveryStatus;
    preview?: string;
    error?: string;
    code?: string;
}

export interface BulkError {
    row: number;
    error: string;
}

export interface BulkCertificateResponse {
    success: boolean;
    jobId?: string;
    totalRecords?: number;
    processed?: number;
    successful?: number;
    failed?: number;
    errors?: BulkError[];
    error?: string;
    code?: string;
}

export type CertificateResponse = SingleCertificateResponse | BulkCertificateResponse;

// Form state types
export interface CertificateFormData {
    mode: 'single' | 'bulk';
    templateType: TemplateType;

    // Single mode fields
    recipientName?: string;
    badge?: string;
    date?: string;
    description?: string;
    issuer?: string;
    recipientEmail?: string;
    recipientWhatsApp?: string;

    // Custom template
    templateFile?: File;

    // Google Slides template
    googleSlidesUrl?: string;
    googleSlidesEmbedUrl?: string;
    googleSlidesImageUrl?: string;
    googleSlidesImageWidth?: number;
    googleSlidesImageHeight?: number;
    googleSlidesPositionX?: number;
    googleSlidesPositionY?: number;

    // AI branding
    brandColors?: string;
    brandLogo?: File;

    // Bulk mode
    bulkSource?: BulkSource;
    excelFile?: File;
    sheetsUrl?: string;
    sheetName?: string;

    // Delivery
    deliveryChannels: DeliveryChannel[];

    // Sender
    senderName: string;
    senderEmail?: string;
}
