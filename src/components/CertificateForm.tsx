import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FileUp, Sparkles, Mail, MessageCircle, Send, Loader2, Check, Zap, Award } from 'lucide-react';
import type { CertificateFormData, SingleCertificateRequest, DeliveryChannel } from '../types/certificate';
import webhookService from '../services/webhookService';
import config from '../config/config';
import BulkUpload from './BulkUpload';
import CertificatePreview from './CertificatePreview';
import FileUpload from './FileUpload';

const CertificateForm: React.FC = () => {
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CertificateFormData>({
        defaultValues: {
            mode: 'single',
            templateType: 'ai',
            deliveryChannels: ['gmail'],
            senderName: '',
            date: new Date().toISOString().split('T')[0],
        },
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
    const [previewData, setPreviewData] = useState<string | null>(null);

    const mode = watch('mode');
    const templateType = watch('templateType');
    const deliveryChannels = watch('deliveryChannels');
    const templateFile = watch('templateFile');

    const toggleDeliveryChannel = (channel: DeliveryChannel) => {
        const current = deliveryChannels || [];
        if (current.includes(channel)) {
            setValue('deliveryChannels', current.filter(c => c !== channel));
        } else {
            setValue('deliveryChannels', [...current, channel]);
        }
    };

    const onSubmit = async (data: CertificateFormData) => {
        setIsSubmitting(true);
        setResult(null);

        try {
            // Handle bulk mode
            if (data.mode === 'bulk') {
                // Bulk upload is handled by BulkUpload component
                return;
            }

            // Validate single mode data
            if (!data.recipientName || !data.badge || !data.date) {
                setResult({ success: false, message: 'Please fill all required fields' });
                setIsSubmitting(false);
                return;
            }

            // Prepare request payload
            const request: SingleCertificateRequest = {
                mode: 'single',
                templateType: data.templateType,
                data: {
                    name: data.recipientName,
                    badge: data.badge,
                    date: data.date,
                    description: data.description || '',
                    issuer: data.issuer || data.senderName,
                },
                delivery: {
                    email: data.recipientEmail,
                    whatsapp: data.recipientWhatsApp,
                    channels: data.deliveryChannels,
                },
                sender: {
                    name: data.senderName,
                    email: data.senderEmail,
                },
            };

            // Handle custom template
            if (data.templateType === 'custom' && data.templateFile) {
                const validation = webhookService.validateFile(
                    data.templateFile,
                    config.supportedImageFormats,
                    config.maxFileSize
                );

                if (!validation.valid) {
                    setResult({ success: false, message: validation.error || 'Invalid file' });
                    setIsSubmitting(false);
                    return;
                }

                const base64 = await webhookService.fileToBase64(data.templateFile);
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

            // Handle AI branding
            if (data.templateType === 'ai') {
                request.branding = {
                    colors: data.brandColors ? data.brandColors.split(',').map(c => c.trim()) : undefined,
                };

                if (data.brandLogo) {
                    const logoBase64 = await webhookService.fileToBase64(data.brandLogo);
                    request.branding.logo = logoBase64;
                }
            }

            // Submit request
            const response = await webhookService.submitCertificate(request);

            if (response.success && 'certificateId' in response) {
                setResult({ success: true, message: `Certificate generated successfully! ID: ${response.certificateId}` });
                if (response.preview) {
                    setPreviewData(response.preview);
                }
            } else {
                setResult({ success: false, message: response.error || 'Failed to generate certificate' });
            }
        } catch (error) {
            setResult({ success: false, message: 'An unexpected error occurred' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (mode === 'bulk') {
        return <BulkUpload />;
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Dynamic Header with Stats */}
            <div className="text-center mb-12 animate-fade-in">
                <div className="inline-block mb-6 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl blur-xl opacity-50 animate-pulse-slow"></div>
                    <div className="relative w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-2xl shadow-primary-300/50">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>
                </div>
                <h1 className="text-6xl font-bold text-gray-900 mb-3 tracking-tight">
                    <span className="bg-gradient-to-r from-primary-600 via-accent-600 to-primary-600 bg-clip-text text-transparent animate-gradient">
                        Certificate Generator
                    </span>
                </h1>
                <p className="text-gray-600 text-lg mb-6">Create and deliver professional certificates effortlessly</p>

                {/* Quick stats */}
                <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-white shadow-sm">
                        <Zap className="w-4 h-4 text-primary-600" />
                        <span className="font-medium text-gray-700">Instant Delivery</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-white shadow-sm">
                        <Award className="w-4 h-4 text-accent-600" />
                        <span className="font-medium text-gray-700">AI Powered</span>
                    </div>
                </div>
            </div>

            <div className="card animate-fade-in relative overflow-hidden">
                {/* Decorative gradient corner */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-bl-full"></div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative z-10">
                    {/* Mode Selection */}
                    <div>
                        <label className="label-minimal">Generation Mode</label>
                        <div className="flex gap-3">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="radio"
                                    value="single"
                                    {...register('mode')}
                                    className="w-4 h-4 accent-black"
                                />
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Single Certificate</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="radio"
                                    value="bulk"
                                    {...register('mode')}
                                    className="w-4 h-4 accent-black"
                                />
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Bulk Generation</span>
                            </label>
                        </div>
                    </div>

                    {/* Template Type */}
                    <div>
                        <label className="label-minimal">Template Type</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setValue('templateType', 'ai')}
                                className={`option-card ${templateType === 'ai' ? 'option-card-selected' : 'option-card-default'}`}
                            >
                                <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center ${templateType === 'ai'
                                    ? 'bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-300/30'
                                    : 'bg-gradient-to-br from-gray-100 to-gray-50'
                                    }`}>
                                    <Sparkles className={`w-7 h-7 ${templateType === 'ai' ? 'text-white' : 'text-gray-400'}`} />
                                </div>
                                <h3 className="font-semibold text-base mb-1">AI Generated</h3>
                                <p className="text-sm text-gray-500">Let AI design your certificate</p>
                            </button>

                            <button
                                type="button"
                                onClick={() => setValue('templateType', 'custom')}
                                className={`option-card ${templateType === 'custom' ? 'option-card-selected' : 'option-card-default'}`}
                            >
                                <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center ${templateType === 'custom'
                                    ? 'bg-gradient-to-br from-primary-500 to-accent-500 shadow-lg shadow-primary-300/30'
                                    : 'bg-gradient-to-br from-gray-100 to-gray-50'
                                    }`}>
                                    <FileUp className={`w-7 h-7 ${templateType === 'custom' ? 'text-white' : 'text-gray-400'}`} />
                                </div>
                                <h3 className="font-semibold text-base mb-1">Custom Template</h3>
                                <p className="text-sm text-gray-500">Upload your own template</p>
                            </button>
                        </div>
                    </div>

                    {/* Custom Template Upload */}
                    {templateType === 'custom' && (
                        <div className="animate-fade-in">
                            <FileUpload
                                accept=".png,.jpg,.jpeg,.pdf"
                                onChange={(file) => setValue('templateFile', file as File)}
                                value={templateFile}
                                label="Upload Template"
                                description="Drag and drop or click to browse"
                            />
                        </div>
                    )}

                    {/* AI Branding */}
                    {templateType === 'ai' && (
                        <div className="space-y-4">
                            <div>
                                <label className="label-minimal">
                                    Brand Colors
                                </label>
                                <input
                                    type="text"
                                    placeholder="#0ea5e9, #d946ef"
                                    {...register('brandColors')}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <FileUpload
                                    accept=".png,.jpg,.jpeg"
                                    onChange={(file) => setValue('brandLogo', file as File)}
                                    value={watch('brandLogo')}
                                    label="Brand Logo"
                                    description="Drag and drop your logo"
                                />
                            </div>
                        </div>
                    )}

                    <div className="divider" />

                    {/* Recipient Information */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-minimal">
                                Recipient Name
                            </label>
                            <input
                                type="text"
                                {...register('recipientName', { required: true })}
                                className="input-field"
                                placeholder="John Doe"
                            />
                            {errors.recipientName && (
                                <p className="text-red-600 text-sm mt-1">This field is required</p>
                            )}
                        </div>

                        <div>
                            <label className="label-minimal">
                                Badge / Title
                            </label>
                            <input
                                type="text"
                                {...register('badge', { required: true })}
                                className="input-field"
                                placeholder="Excellence Award"
                            />
                            {errors.badge && (
                                <p className="text-red-600 text-sm mt-1">This field is required</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-minimal">Date</label>
                            <input
                                type="date"
                                {...register('date', { required: true })}
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="label-minimal">Issuer</label>
                            <input
                                type="text"
                                {...register('issuer')}
                                className="input-field"
                                placeholder="ABC Organization"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="label-minimal">Description</label>
                        <textarea
                            {...register('description')}
                            className="input-field"
                            rows={3}
                            placeholder="For outstanding achievement in..."
                        />
                    </div>

                    <hr className="my-6" />

                    {/* Delivery Settings */}
                    <div>
                        <label className="label-minimal">
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

                    {deliveryChannels.includes('gmail') && (
                        <div>
                            <label className="label-minimal">
                                Recipient Email
                            </label>
                            <input
                                type="email"
                                {...register('recipientEmail', { required: deliveryChannels.includes('gmail') })}
                                className="input-field"
                                placeholder="recipient@example.com"
                            />
                        </div>
                    )}

                    {deliveryChannels.includes('whatsapp') && (
                        <div>
                            <label className="label-minimal">
                                WhatsApp Number
                            </label>
                            <input
                                type="tel"
                                {...register('recipientWhatsApp', {
                                    required: deliveryChannels.includes('whatsapp'),
                                })}
                                className="input-field"
                                placeholder="+1234567890"
                            />
                        </div>
                    )}

                    {/* Sender Information */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label-minimal">
                                Sender Name
                            </label>
                            <input
                                type="text"
                                {...register('senderName', { required: true })}
                                className="input-field"
                                placeholder="ABC Organization"
                            />
                        </div>

                        <div>
                            <label className="label-minimal">
                                Sender Email
                            </label>
                            <input
                                type="email"
                                {...register('senderEmail')}
                                className="input-field"
                                placeholder="sender@abc.org"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Generating Certificate...</span>
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                <span>Generate & Send Certificate</span>
                            </>
                        )}
                    </button>

                    {/* Result Message */}
                    {result && (
                        <div
                            className={`p-4 rounded-lg text-sm animate-fade-in ${result.success
                                ? 'bg-green-50 text-green-900 border border-green-200'
                                : 'bg-red-50 text-red-900 border border-red-200'
                                }`}
                        >
                            {result.message}
                        </div>
                    )}
                </form>
            </div>

            {/* Preview */}
            {previewData && (
                <div className="mt-6">
                    <CertificatePreview previewData={previewData} />
                </div>
            )}
        </div>
    );
};

export default CertificateForm;
