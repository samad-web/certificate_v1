import React, { useState } from 'react';
import { FileSpreadsheet, Link as LinkIcon, Upload, Loader2, CheckCircle, XCircle } from 'lucide-react';
import type { BulkCertificateRequest, BulkSource, FieldMapping, DeliveryChannel } from '../types/certificate';
import webhookService from '../services/webhookService';
import * as XLSX from 'xlsx';

const BulkUpload: React.FC = () => {
    const [bulkSource, setBulkSource] = useState<BulkSource>('excel');
    const [templateType, setTemplateType] = useState<'custom' | 'ai'>('ai');
    const [excelFile, setExcelFile] = useState<File | null>(null);
    const [templateFile, setTemplateFile] = useState<File | null>(null);
    const [sheetsUrl, setSheetsUrl] = useState('');
    const [sheetName, setSheetName] = useState('Sheet1');
    const [senderName, setSenderName] = useState('');
    const [deliveryChannels, setDeliveryChannels] = useState<DeliveryChannel[]>(['gmail']);
    const [brandColors, setBrandColors] = useState('');

    const [fieldMapping, setFieldMapping] = useState<FieldMapping>({
        name: 'Name',
        badge: 'Badge',
        date: 'Date',
        description: 'Description',
        email: 'Email',
        whatsapp: 'WhatsApp',
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [preview, setPreview] = useState<any[]>([]);

    const handleExcelUpload = async (file: File) => {
        setExcelFile(file);

        // Preview first 5 rows
        try {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            setPreview(jsonData.slice(0, 5));
        } catch (error) {
            console.error('Failed to preview Excel file:', error);
        }
    };

    const toggleDeliveryChannel = (channel: DeliveryChannel) => {
        if (deliveryChannels.includes(channel)) {
            setDeliveryChannels(deliveryChannels.filter(c => c !== channel));
        } else {
            setDeliveryChannels([...deliveryChannels, channel]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setResult(null);

        try {
            const request: BulkCertificateRequest = {
                mode: 'bulk',
                source: bulkSource,
                templateType,
                fieldMapping,
                delivery: {
                    channels: deliveryChannels,
                },
                sender: {
                    name: senderName,
                },
            };

            // Add template if custom
            if (templateType === 'custom' && templateFile) {
                const base64 = await webhookService.fileToBase64(templateFile);
                request.template = {
                    base64,
                    placeholders: {
                        name: { x: 500, y: 300 },
                        badge: { x: 500, y: 400 },
                        date: { x: 500, y: 500 },
                        description: { x: 500, y: 550 },
                    },
                };
            }

            // Add branding for AI
            if (templateType === 'ai' && brandColors) {
                request.branding = {
                    colors: brandColors.split(',').map(c => c.trim()),
                };
            }

            // Add data source
            if (bulkSource === 'excel' && excelFile) {
                const base64 = await webhookService.fileToBase64(excelFile);
                request.excelFile = base64;
            } else if (bulkSource === 'googlesheets') {
                request.sheetsUrl = sheetsUrl;
                request.sheetName = sheetName;
            }

            const response = await webhookService.submitCertificate(request);
            setResult(response);
        } catch (error) {
            setResult({ success: false, error: 'An unexpected error occurred' });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="card">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Bulk Certificate Generation</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Data Source Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Data Source</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setBulkSource('excel')}
                                className={`p-4 border-2 rounded-lg transition-all ${bulkSource === 'excel'
                                    ? 'border-primary-600 bg-primary-50'
                                    : 'border-gray-300 hover:border-gray-400'
                                    }`}
                            >
                                <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                                <h3 className="font-semibold">Excel File</h3>
                                <p className="text-sm text-gray-600 mt-1">Upload .xlsx or .xls</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setBulkSource('googlesheets')}
                                className={`p-4 border-2 rounded-lg transition-all ${bulkSource === 'googlesheets'
                                    ? 'border-primary-600 bg-primary-50'
                                    : 'border-gray-300 hover:border-gray-400'
                                    }`}
                            >
                                <LinkIcon className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                                <h3 className="font-semibold">Google Sheets</h3>
                                <p className="text-sm text-gray-600 mt-1">Connect via URL</p>
                            </button>
                        </div>
                    </div>

                    {/* Template Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Template Type</label>
                        <div className="flex gap-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={templateType === 'ai'}
                                    onChange={() => setTemplateType('ai')}
                                    className="w-4 h-4 text-primary-600"
                                />
                                <span>AI Generated</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    checked={templateType === 'custom'}
                                    onChange={() => setTemplateType('custom')}
                                    className="w-4 h-4 text-primary-600"
                                />
                                <span>Custom Template</span>
                            </label>
                        </div>
                    </div>

                    {/* Custom Template Upload */}
                    {templateType === 'custom' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Template (will be used for all certificates)
                            </label>
                            <input
                                type="file"
                                accept=".png,.jpg,.jpeg,.pdf"
                                onChange={(e) => setTemplateFile(e.target.files?.[0] || null)}
                                className="input-field"
                            />
                        </div>
                    )}

                    {/* AI Branding */}
                    {templateType === 'ai' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Brand Colors (comma-separated)
                            </label>
                            <input
                                type="text"
                                value={brandColors}
                                onChange={(e) => setBrandColors(e.target.value)}
                                placeholder="#1e40af, #3b82f6"
                                className="input-field"
                            />
                        </div>
                    )}

                    {/* Excel Upload */}
                    {bulkSource === 'excel' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Excel File
                            </label>
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={(e) => e.target.files?.[0] && handleExcelUpload(e.target.files[0])}
                                className="input-field"
                                required
                            />
                        </div>
                    )}

                    {/* Google Sheets */}
                    {bulkSource === 'googlesheets' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Google Sheets URL
                                </label>
                                <input
                                    type="url"
                                    value={sheetsUrl}
                                    onChange={(e) => setSheetsUrl(e.target.value)}
                                    placeholder="https://docs.google.com/spreadsheets/d/..."
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sheet Name
                                </label>
                                <input
                                    type="text"
                                    value={sheetName}
                                    onChange={(e) => setSheetName(e.target.value)}
                                    className="input-field"
                                />
                            </div>
                        </div>
                    )}

                    {/* Field Mapping */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Field Mapping</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {Object.entries(fieldMapping).map(([field, column]) => (
                                <div key={field}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                        {field} Column Name
                                    </label>
                                    <input
                                        type="text"
                                        value={column}
                                        onChange={(e) => setFieldMapping({ ...fieldMapping, [field]: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    {preview.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Data Preview (First 5 Rows)</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full border border-gray-300">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            {Object.keys(preview[0]).map((key) => (
                                                <th key={key} className="px-4 py-2 border text-left text-sm font-medium">
                                                    {key}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.map((row, idx) => (
                                            <tr key={idx}>
                                                {Object.values(row).map((value: any, cellIdx) => (
                                                    <td key={cellIdx} className="px-4 py-2 border text-sm">
                                                        {String(value)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Delivery Channels */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Delivery Channels
                        </label>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => toggleDeliveryChannel('gmail')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${deliveryChannels.includes('gmail')
                                    ? 'border-primary-600 bg-primary-50'
                                    : 'border-gray-300'
                                    }`}
                            >
                                Gmail
                            </button>
                            <button
                                type="button"
                                onClick={() => toggleDeliveryChannel('whatsapp')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${deliveryChannels.includes('whatsapp')
                                    ? 'border-primary-600 bg-primary-50'
                                    : 'border-gray-300'
                                    }`}
                            >
                                WhatsApp
                            </button>
                        </div>
                    </div>

                    {/* Sender Info */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sender Name *
                        </label>
                        <input
                            type="text"
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                            className="input-field"
                            required
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isProcessing}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Processing Certificates...</span>
                            </>
                        ) : (
                            <>
                                <Upload className="w-5 h-5" />
                                <span>Generate Bulk Certificates</span>
                            </>
                        )}
                    </button>

                    {/* Result */}
                    {result && (
                        <div
                            className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                                }`}
                        >
                            {result.success ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-green-800">
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-semibold">Success!</span>
                                    </div>
                                    <p className="text-green-700">
                                        Processed: {result.processed}/{result.totalRecords} |
                                        Successful: {result.successful} |
                                        Failed: {result.failed}
                                    </p>
                                    {result.errors && result.errors.length > 0 && (
                                        <div className="mt-2">
                                            <p className="font-semibold text-sm">Errors:</p>
                                            <ul className="list-disc list-inside text-sm">
                                                {result.errors.map((err: any, idx: number) => (
                                                    <li key={idx}>Row {err.row}: {err.error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-red-800">
                                    <XCircle className="w-5 h-5" />
                                    <span>{result.error || 'Failed to process certificates'}</span>
                                </div>
                            )}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default BulkUpload;
