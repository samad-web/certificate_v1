import axios, { AxiosError } from 'axios';
import config from '../config/config';
import type { CertificateRequest, CertificateResponse } from '../types/certificate';

class WebhookService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = config.n8nWebhookUrl;
    }

    /**
     * Submit certificate generation request to n8n webhook
     */
    async submitCertificate(request: CertificateRequest): Promise<CertificateResponse> {
        try {
            const response = await axios.post<CertificateResponse>(this.baseUrl, request, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: request.mode === 'bulk' ? 300000 : 60000, // 5 min for bulk, 1 min for single
            });

            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError<CertificateResponse>;

                if (axiosError.response?.data) {
                    return axiosError.response.data;
                }

                return {
                    success: false,
                    error: axiosError.message || 'Failed to connect to certificate service',
                    code: 'NETWORK_ERROR',
                };
            }

            return {
                success: false,
                error: 'An unexpected error occurred',
                code: 'UNKNOWN_ERROR',
            };
        }
    }

    /**
     * Convert File to Base64 string
     */
    async fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    }

    /**
     * Validate file type and size
     */
    validateFile(file: File, allowedTypes: string[], maxSize: number): { valid: boolean; error?: string } {
        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
            };
        }

        if (file.size > maxSize) {
            return {
                valid: false,
                error: `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`,
            };
        }

        return { valid: true };
    }
}

export default new WebhookService();
