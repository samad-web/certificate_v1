// Certificate History Storage Service
export interface StoredCertificate {
    id: string;
    recipientName: string;
    badge: string;
    date: string;
    description?: string;
    generatedAt: string;
    deliveryChannels: string[];
    templateType: 'ai' | 'googleslides';
    status: 'success' | 'failed';
    certificateId?: string;
    errorMessage?: string;
}

const STORAGE_KEY = 'certificate_history';

class CertificateStorageService {
    // Get all certificates from localStorage
    getAll(): StoredCertificate[] {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load certificate history:', error);
            return [];
        }
    }

    // Add a new certificate
    add(certificate: Omit<StoredCertificate, 'id' | 'generatedAt'>): StoredCertificate {
        const certificates = this.getAll();
        const newCertificate: StoredCertificate = {
            ...certificate,
            id: Date.now().toString(),
            generatedAt: new Date().toISOString(),
        };

        certificates.unshift(newCertificate); // Add to beginning
        this.save(certificates);
        return newCertificate;
    }

    // Delete a certificate
    delete(id: string): void {
        const certificates = this.getAll().filter(cert => cert.id !== id);
        this.save(certificates);
    }

    // Clear all certificates
    clearAll(): void {
        localStorage.removeItem(STORAGE_KEY);
    }

    // Save certificates array
    private save(certificates: StoredCertificate[]): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(certificates));
        } catch (error) {
            console.error('Failed to save certificate history:', error);
        }
    }
}

export const certificateStorage = new CertificateStorageService();
