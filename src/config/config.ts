interface Config {
    n8nWebhookUrl: string;
    maxFileSize: number; // in bytes
    supportedImageFormats: string[];
    supportedExcelFormats: string[];
    maxBatchSize: number;
}

const config: Config = {
    n8nWebhookUrl: import.meta.env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/certificate',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    supportedImageFormats: ['image/png', 'image/jpeg', 'application/pdf'],
    supportedExcelFormats: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
    ],
    maxBatchSize: 100,
};

export default config;
