import React, { useEffect } from 'react';
import { FileText, Download, Calendar, Mail, Trash2 } from 'lucide-react';
import { certificateStorage, type StoredCertificate } from '../services/certificateStorage';

const CertificateHistory: React.FC = () => {
    const [certificates, setCertificates] = React.useState<StoredCertificate[]>([]);

    useEffect(() => {
        // Load certificates from localStorage
        setCertificates(certificateStorage.getAll());
    }, []);

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this certificate?')) {
            certificateStorage.delete(id);
            setCertificates(certificateStorage.getAll());
        }
    };

    const handleClearAll = () => {
        if (confirm('Are you sure you want to delete all certificates?')) {
            certificateStorage.clearAll();
            setCertificates([]);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="max-w-6xl mx-auto px-4">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificate History</h1>
                    <p className="text-gray-600">View and manage all your generated certificates ({certificates.length})</p>
                </div>
                {certificates.length > 0 && (
                    <button
                        onClick={handleClearAll}
                        className="btn-secondary flex items-center gap-2 text-red-600 hover:bg-red-50"
                    >
                        <Trash2 className="w-4 h-4" />
                        Clear All
                    </button>
                )}
            </div>

            {certificates.length === 0 ? (
                <div className="card text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No certificates yet</h3>
                    <p className="text-gray-600">Generate your first certificate to see it here</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {certificates.map((cert) => (
                        <div
                            key={cert.id}
                            className="card hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {cert.recipientName}
                                        </h3>
                                        <span
                                            className={`px-2 py-1 text-xs font-medium rounded-full ${cert.status === 'success'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}
                                        >
                                            {cert.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-2">{cert.badge}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDate(cert.generatedAt)}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Mail className="w-4 h-4" />
                                            <span>{cert.deliveryChannels.join(', ')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button className="btn-secondary flex items-center gap-2">
                                        <Download className="w-4 h-4" />
                                        <span className="hidden sm:inline">Download</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cert.id)}
                                        className="btn-secondary flex items-center gap-2 text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="hidden sm:inline">Delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CertificateHistory;
