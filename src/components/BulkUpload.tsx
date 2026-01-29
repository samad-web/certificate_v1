import React, { useState } from 'react';
import { FileSpreadsheet, Link as LinkIcon, Upload, Loader2, Download, Mail, MessageCircle, Square } from 'lucide-react';
import type { BulkSource, FieldMapping, DeliveryChannel, TemplateType, SingleCertificateRequest } from '../types/certificate';
import webhookService from '../services/webhookService';
import { certificateStorage } from '../services/certificateStorage';
import GoogleSlidesEditor from './GoogleSlidesEditor';
import PlaceholderMapper from './PlaceholderMapper';
import * as XLSX from 'xlsx';
import { generateSampleExcel } from '../utils/sampleTemplate';

const BulkUpload: React.FC = () => {
    const [bulkSource, setBulkSource] = useState<BulkSource>('excel');
    const [templateType, setTemplateType] = useState<TemplateType>('ai');
    const [sheetsUrl, setSheetsUrl] = useState('');
    const [sheetName, setSheetName] = useState('Sheet1');
    const [googleSlidesUrl, setGoogleSlidesUrl] = useState('');
    const [googleSlidesEmbedUrl, setGoogleSlidesEmbedUrl] = useState('');
    const [googleSlidesImageUrl, setGoogleSlidesImageUrl] = useState('');
    const [googleSlidesImageWidth, setGoogleSlidesImageWidth] = useState(3000000);
    const [googleSlidesImageHeight, setGoogleSlidesImageHeight] = useState(2000000);
    const [googleSlidesPositionX, setGoogleSlidesPositionX] = useState(1000000);
    const [googleSlidesPositionY, setGoogleSlidesPositionY] = useState(1000000);
    const [senderName, setSenderName] = useState('');
    const [deliveryChannels, setDeliveryChannels] = useState<DeliveryChannel[]>(['gmail']);
    const [brandColors, setBrandColors] = useState('');
    const [slidePlaceholders, setSlidePlaceholders] = useState<string[]>([]);
    const [placeholderMapping, setPlaceholderMapping] = useState<Record<string, string>>({});

    // Mapping state
    const [fieldMapping, setFieldMapping] = useState<FieldMapping>({
        certificateTitle: 'Certificate Title',
        name: 'Recipient Name',
        awardPurpose: 'Award Purpose',
        programName: 'Program Name',
        issuer: 'Issuing Organization',
        date: 'Date of Issue',
        email: 'Email',
        whatsapp: 'WhatsApp',
    });

    // Data state
    const [bulkData, setBulkData] = useState<any[]>([]);
    const [preview, setPreview] = useState<any[]>([]);

    // Processing state
    const [isProcessing, setIsProcessing] = useState(false);
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    const [progress, setProgress] = useState({
        total: 0,
        processed: 0,
        successful: 0,
        failed: 0,
        currentDetails: '',
    });
    const [logs, setLogs] = useState<{ row: number; status: 'success' | 'error'; message: string }[]>([]);


    const handleExcelUpload = async (file: File) => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            setBulkData(jsonData);
            setPreview(jsonData.slice(0, 5));
        } catch (error) {
            console.error('Failed to preview Excel file:', error);
            alert('Failed to read Excel file');
        }
    };

    const handleSheetsPreview = async () => {
        if (!sheetsUrl) return;

        try {
            setIsProcessing(true);
            const matches = sheetsUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
            if (!matches || !matches[1]) {
                alert('Invalid Google Sheets URL');
                return;
            }

            const sheetId = matches[1];
            const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

            const response = await fetch(csvUrl);
            if (!response.ok) throw new Error('Failed to fetch sheet data');

            const text = await response.text();
            const workbook = XLSX.read(text, { type: 'string' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            console.log('✅ Google Sheets loaded:', jsonData.length, 'rows');
            if (jsonData.length > 0) {
                console.log('Column names:', Object.keys(jsonData[0] as Record<string, any>));
                console.log('First row sample:', jsonData[0]);
            }

            setBulkData(jsonData);
            setPreview(jsonData.slice(0, 5));
            alert(`Successfully loaded ${jsonData.length} rows!`);
        } catch (error) {
            console.error('Failed to preview Google Sheet:', error);
            alert('Could not load preview. Ensure the sheet is "Public" or "Anyone with the link".');
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleDeliveryChannel = (channel: DeliveryChannel) => {
        if (deliveryChannels.includes(channel)) {
            setDeliveryChannels(deliveryChannels.filter((c: DeliveryChannel) => c !== channel));
        } else {
            setDeliveryChannels([...deliveryChannels, channel]);
        }
    };

    const stopProcessing = () => {
        if (abortController) {
            abortController.abort();
            setAbortController(null);
            setIsProcessing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (bulkData.length === 0) {
            alert('No data to process. Please upload a file or connect a Google Sheet.');
            return;
        }

        console.log('Starting bulk processing...');
        console.log('Total rows:', bulkData.length);
        console.log('Field mapping:', fieldMapping);
        console.log('First row data:', bulkData[0]);

        setIsProcessing(true);
        setLogs([]);
        setProgress({
            total: bulkData.length,
            processed: 0,
            successful: 0,
            failed: 0,
            currentDetails: 'Starting...',
        });

        const controller = new AbortController();
        setAbortController(controller);

        let successCount = 0;
        let failCount = 0;

        try {
            for (let i = 0; i < bulkData.length; i++) {
                if (controller.signal.aborted) break;

                const row = bulkData[i];
                setProgress((prev: any) => ({
                    ...prev,
                    processed: i + 1,
                    currentDetails: `Processing ${row[fieldMapping.name] || 'Record ' + (i + 1)}...`
                }));

                try {
                    // Map row data to Single Certificate Request
                    const request: SingleCertificateRequest = {
                        mode: 'single',
                        templateType,
                        data: {
                            certificateTitle: row[fieldMapping.certificateTitle] || '',
                            name: row[fieldMapping.name] || '',
                            awardPurpose: row[fieldMapping.awardPurpose] || '',
                            programName: row[fieldMapping.programName] || '',
                            issuer: row[fieldMapping.issuer] || senderName,
                            date: row[fieldMapping.date] || new Date().toISOString().split('T')[0],
                            // Backwards compatibility
                            badge: row[fieldMapping.programName] || '',
                            description: row[fieldMapping.awardPurpose] || '',
                        },
                        delivery: {
                            email: row[fieldMapping.email],
                            whatsapp: row[fieldMapping.whatsapp],
                            channels: deliveryChannels,
                        },
                        sender: {
                            name: senderName,
                        },
                    };

                    // Add template if custom
                    if (templateType === 'googleslides' && googleSlidesUrl) {
                        request.googleSlidesTemplate = {
                            url: googleSlidesUrl,
                            embedUrl: googleSlidesEmbedUrl,
                            imageUrl: googleSlidesImageUrl,
                            imageWidth: googleSlidesImageWidth,
                            imageHeight: googleSlidesImageHeight,
                            positionX: googleSlidesPositionX,
                            positionY: googleSlidesPositionY,
                        };
                    }

                    // Add branding for AI
                    if (templateType === 'ai' && brandColors) {
                        request.branding = {
                            colors: brandColors.split(',').map((c: string) => c.trim()),
                        };
                    }

                    // Send Request
                    console.log('📤 Sending request for row', i + 1, ':', request.data.name);
                    console.log('Request payload:', JSON.stringify(request, null, 2));
                    const response = await webhookService.submitCertificate(request);

                    if (response.success && 'certificateId' in response) {
                        successCount++;
                        // Save to history
                        certificateStorage.add({
                            recipientName: request.data.name || 'Unknown',
                            badge: request.data.badge || 'Certificate',
                            date: request.data.date || new Date().toISOString(),
                            description: request.data.description,
                            deliveryChannels: request.delivery.channels,
                            templateType: request.templateType,
                            status: 'success',
                            certificateId: response.certificateId,
                        });
                        setLogs((prev: any[]) => [...prev, { row: i + 1, status: 'success', message: `Generated for ${request.data.name}` }]);
                    } else {
                        throw new Error(response.error || 'Unknown error');
                    }

                } catch (err: any) {
                    failCount++;
                    const rowName = row[fieldMapping.name] || `Row ${i + 1}`;
                    setLogs((prev: any) => [...prev, { row: i + 1, status: 'error', message: `Failed for ${rowName}: ${err.message || 'Error'}` }]);
                    // Save failed record to history
                    certificateStorage.add({
                        recipientName: row[fieldMapping.name] || 'Unknown',
                        badge: row[fieldMapping.programName] || 'Certificate',
                        date: row[fieldMapping.date] || new Date().toISOString(),
                        description: row[fieldMapping.awardPurpose] || '',
                        deliveryChannels: deliveryChannels,
                        templateType: templateType,
                        status: 'failed',
                        errorMessage: err.message
                    });
                }

                setProgress((prev: any) => ({
                    ...prev,
                    successful: successCount,
                    failed: failCount
                }));

                // Small delay to prevent rate limiting
                await new Promise(r => setTimeout(r, 500));
            }
        } finally {
            setIsProcessing(false);
            setAbortController(null);
            setProgress((prev: any) => ({ ...prev, currentDetails: 'Completed' }));
        }
    };

    return (
        <div className="space-y-6">
            {isProcessing || progress.processed > 0 ? (
                <div className="card bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">Bulk Generation Progress</h3>
                        {isProcessing && (
                            <button onClick={stopProcessing} className="btn-secondary text-red-600 flex items-center gap-2">
                                <Square className="w-4 h-4 fill-current" /> Stop
                            </button>
                        )}
                        {!isProcessing && progress.processed > 0 && (
                            <button onClick={() => {
                                setProgress({ total: 0, processed: 0, successful: 0, failed: 0, currentDetails: '' });
                                setLogs([]);
                            }} className="btn-secondary">
                                Reset
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Progress: {progress.processed} / {progress.total}</span>
                            <span>{Math.round((progress.processed / progress.total) * 100) || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${(progress.processed / progress.total) * 100}%` }}
                            ></div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-3 bg-green-50 rounded-lg">
                                <span className="block text-2xl font-bold text-green-700">{progress.successful}</span>
                                <span className="text-xs text-green-600 uppercase font-semibold">Successful</span>
                            </div>
                            <div className="p-3 bg-red-50 rounded-lg">
                                <span className="block text-2xl font-bold text-red-700">{progress.failed}</span>
                                <span className="text-xs text-red-600 uppercase font-semibold">Failed</span>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <span className="block text-2xl font-bold text-blue-700">{progress.total - progress.processed}</span>
                                <span className="text-xs text-blue-600 uppercase font-semibold">Remaining</span>
                            </div>
                        </div>

                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Process Log:</p>
                            <div className="bg-gray-50 rounded-lg p-3 h-48 overflow-y-auto text-sm space-y-1 font-mono">
                                {logs.map((log, idx) => (
                                    <div key={idx} className={`flex gap-2 ${log.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                        <span className="opacity-50">[{log.row}]</span>
                                        <span>{log.message}</span>
                                    </div>
                                ))}
                                {logs.length === 0 && <span className="text-gray-400">Waiting to start...</span>}
                            </div>
                        </div>

                        {progress.currentDetails && (
                            <p className="text-center text-sm text-gray-500 animate-pulse">
                                {progress.currentDetails}
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Data Source Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Data Source
                        </label>
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

                        {/* Download Sample Template */}
                        <div className="mt-3">
                            <button
                                type="button"
                                onClick={generateSampleExcel}
                                className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                                <Download className="w-4 h-4" />
                                Download Sample Excel Template
                            </button>
                            <p className="text-xs text-gray-500 mt-1">
                                Use this template to see the required format for bulk uploads
                            </p>
                        </div>
                    </div>

                    {/* Template Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Template Type</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setTemplateType('ai')}
                                className={`p-4 border-2 rounded-lg transition-all ${templateType === 'ai'
                                    ? 'border-primary-600 bg-primary-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="text-2xl mb-2">🤖</div>
                                <div className="font-semibold">AI Generated</div>
                                <div className="text-xs text-gray-500 mt-1">Powered by Gemini 2.0</div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setTemplateType('googleslides')}
                                className={`p-4 border-2 rounded-lg transition-all ${templateType === 'googleslides'
                                    ? 'border-primary-600 bg-primary-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="text-2xl mb-2">📊</div>
                                <div className="font-semibold">Google Slides</div>
                                <div className="text-xs text-gray-500 mt-1">Use existing template</div>
                            </button>
                        </div>
                    </div>

                    {/* Google Slides Template */}
                    {templateType === 'googleslides' && (
                        <div className="animate-fade-in">
                            <GoogleSlidesEditor
                                onUrlChange={(url, embedUrl, imageUrl, imageWidth, imageHeight, positionX, positionY, placeholders) => {
                                    setGoogleSlidesUrl(url);
                                    setGoogleSlidesEmbedUrl(embedUrl);
                                    setGoogleSlidesImageUrl(imageUrl || '');
                                    if (imageWidth) setGoogleSlidesImageWidth(imageWidth);
                                    if (imageHeight) setGoogleSlidesImageHeight(imageHeight);
                                    if (positionX) setGoogleSlidesPositionX(positionX);
                                    if (positionY) setGoogleSlidesPositionY(positionY);
                                    if (placeholders) setSlidePlaceholders(placeholders);
                                }}
                                initialUrl={googleSlidesUrl}
                                initialImageUrl={googleSlidesImageUrl}
                                initialImageWidth={googleSlidesImageWidth}
                                initialImageHeight={googleSlidesImageHeight}
                                initialPositionX={googleSlidesPositionX}
                                initialPositionY={googleSlidesPositionY}
                                initialPlaceholders={slidePlaceholders}
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

                    {bulkSource === 'googlesheets' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Google Sheets URL
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        value={sheetsUrl}
                                        onChange={(e) => setSheetsUrl(e.target.value)}
                                        placeholder="https://docs.google.com/spreadsheets/d/..."
                                        className="input-field flex-1"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSheetsPreview}
                                        disabled={!sheetsUrl || isProcessing}
                                        className="btn-secondary whitespace-nowrap"
                                    >
                                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load Preview'}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Ensure link sharing is set to "Anyone with the link"
                                </p>
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

                    {/* Delivery Channels */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Delivery Channels
                        </label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => toggleDeliveryChannel('gmail')}
                                className={`toggle-button ${deliveryChannels.includes('gmail') ? 'toggle-button-active' : 'toggle-button-inactive'}`}
                            >
                                <Mail className="w-4 h-4" />
                                <span>Email</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => toggleDeliveryChannel('whatsapp')}
                                className={`toggle-button ${deliveryChannels.includes('whatsapp') ? 'toggle-button-active' : 'toggle-button-inactive'}`}
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span>WhatsApp</span>
                            </button>
                        </div>
                    </div>

                    {/* Sender Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sender Name
                        </label>
                        <input
                            type="text"
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                            className="input-field"
                            placeholder="Your Organization Name"
                            required
                        />
                    </div>

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

                    {/* Placeholder Mapping for Google Slides */}
                    {templateType === 'googleslides' && slidePlaceholders.length > 0 && preview.length > 0 && (
                        <div>
                            <PlaceholderMapper
                                placeholders={slidePlaceholders}
                                availableColumns={preview.length > 0 ? Object.keys(preview[0]) : []}
                                mapping={placeholderMapping}
                                onChange={setPlaceholderMapping}
                            />
                        </div>
                    )}

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
                </form>
            )}
        </div>
    );
};

export default BulkUpload;
