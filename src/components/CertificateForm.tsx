import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, MessageCircle, Zap, Award, Loader2, Send } from 'lucide-react';
import type { CertificateFormData, SingleCertificateRequest, DeliveryChannel } from '../types/certificate';
import webhookService from '../services/webhookService';
import { certificateStorage } from '../services/certificateStorage';
import BulkUpload from './BulkUpload';
import CertificatePreview from './CertificatePreview';
import GoogleSlidesEditor from './GoogleSlidesEditor';

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

            // Handle Google Slides template
            if (data.templateType === 'googleslides') {
                if (!data.googleSlidesUrl || !data.googleSlidesEmbedUrl) {
                    setResult({ success: false, message: 'Please provide a valid Google Slides URL' });
                    setIsSubmitting(false);
                    return;
                }

                request.googleSlidesTemplate = {
                    url: data.googleSlidesUrl,
                    embedUrl: data.googleSlidesEmbedUrl,
                    imageUrl: data.googleSlidesImageUrl,
                    imageWidth: data.googleSlidesImageWidth,
                    imageHeight: data.googleSlidesImageHeight,
                    positionX: data.googleSlidesPositionX,
                    positionY: data.googleSlidesPositionY,
                };
            }

            // Submit request
            const response = await webhookService.submitCertificate(request);

            if (response.success && 'certificateId' in response) {
                setResult({ success: true, message: `Certificate generated successfully! ID: ${response.certificateId} ` });
                if (response.preview) {
                    setPreviewData(response.preview);
                }

                // Save to history
                certificateStorage.add({
                    recipientName: data.recipientName || 'Unknown',
                    badge: data.badge || 'Certificate',
                    date: data.date || new Date().toISOString(),
                    description: data.description,
                    deliveryChannels: data.deliveryChannels,
                    templateType: data.templateType,
                    status: 'success',
                    certificateId: response.certificateId,
                });
            } else {
                setResult({ success: false, message: response.error || 'Failed to generate certificate' });
            }
        } catch (error) {
            setResult({ success: false, message: 'An unexpected error occurred' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* Compact Header */}
            <h1 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                Certificate Generator
            </h1>

            <div className="card animate-fade-in relative overflow-hidden">
                {/* Decorative gradient corner */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-bl-full"></div>

                {/* Mode Selection - Tab Style - Always Visible */}
                <div className="mb-5 border-b border-gray-200 relative z-10">
                    <nav className="flex gap-8">
                        <button
                            type="button"
                            onClick={() => setValue('mode', 'single')}
                            className={`pb-4 px-1 relative font-medium transition-colors ${mode === 'single'
                                ? 'text-primary-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Award className="w-5 h-5" />
                                <span>Single Certificate</span>
                            </div>
                            {mode === 'single' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => setValue('mode', 'bulk')}
                            className={`pb-4 px-1 relative font-medium transition-colors ${mode === 'bulk'
                                ? 'text-primary-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Zap className="w-5 h-5" />
                                <span>Bulk Generation</span>
                            </div>
                            {mode === 'bulk' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
                            )}
                        </button>
                    </nav>
                </div>

                {/* Conditionally render Single or Bulk */}
                {mode === 'bulk' ? (
                    <BulkUpload />
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative z-10">
                        {/* Template Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Template Type
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setValue('templateType', 'ai')}
                                    className={`p-4 border-2 rounded-lg transition-all ${templateType === 'ai'
                                        ? 'border-primary-600 bg-primary-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="text-2xl mb-2">🤖</div>
                                    <h3 className="font-semibold">AI Generated</h3>
                                    <p className="text-sm text-gray-600 mt-1">Powered by Gemini 2.0</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setValue('templateType', 'googleslides')}
                                    className={`p-4 border-2 rounded-lg transition-all ${templateType === 'googleslides'
                                        ? 'border-primary-600 bg-primary-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="text-2xl mb-2">📊</div>
                                    <h3 className="font-semibold">Google Slides</h3>
                                    <p className="text-sm text-gray-600 mt-1">Use existing template</p>
                                </button>
                            </div>
                        </div>

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
                            </div>
                        )}

                        {/* Google Slides Template */}
                        {templateType === 'googleslides' && (
                            <div className="animate-fade-in">
                                <GoogleSlidesEditor
                                    onUrlChange={(url, embedUrl, imageUrl, imageWidth, imageHeight, positionX, positionY) => {
                                        setValue('googleSlidesUrl', url);
                                        setValue('googleSlidesEmbedUrl', embedUrl);
                                        setValue('googleSlidesImageUrl', imageUrl);
                                        setValue('googleSlidesImageWidth', imageWidth);
                                        setValue('googleSlidesImageHeight', imageHeight);
                                        setValue('googleSlidesPositionX', positionX);
                                        setValue('googleSlidesPositionY', positionY);
                                    }}
                                    initialUrl={watch('googleSlidesUrl')}
                                    initialImageUrl={watch('googleSlidesImageUrl')}
                                    initialImageWidth={watch('googleSlidesImageWidth')}
                                    initialImageHeight={watch('googleSlidesImageHeight')}
                                    initialPositionX={watch('googleSlidesPositionX')}
                                    initialPositionY={watch('googleSlidesPositionY')}
                                />
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
                                    <span>Generate Certificate</span>
                                </>
                            )}
                        </button>

                        {/* Result Message */}
                        {result && (
                            <div
                                className={`p - 4 rounded - lg text - sm animate - fade -in ${result.success
                                    ? 'bg-green-50 text-green-900 border border-green-200'
                                    : 'bg-red-50 text-red-900 border border-red-200'
                                    } `}
                            >
                                {result.message}
                            </div>
                        )}
                    </form>
                )}
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
