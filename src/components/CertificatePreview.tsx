import React from 'react';
import { Download } from 'lucide-react';

interface CertificatePreviewProps {
    previewData: string; // Base64 image data
}

const CertificatePreview: React.FC<CertificatePreviewProps> = ({ previewData }) => {
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = previewData;
        link.download = `certificate-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Certificate Preview</h2>
                <button onClick={handleDownload} className="btn-secondary flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                </button>
            </div>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
                <img src={previewData} alt="Certificate Preview" className="w-full h-auto" />
            </div>
        </div>
    );
};

export default CertificatePreview;
