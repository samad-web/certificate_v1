import React, { useState, useEffect } from 'react';
import { ExternalLink, Eye, Edit3, Check, X, AlertCircle, Presentation } from 'lucide-react';

interface GoogleSlidesEditorProps {
    onUrlChange: (url: string, embedUrl: string, imageUrl?: string, imageWidth?: number, imageHeight?: number, positionX?: number, positionY?: number, placeholders?: string[]) => void;
    initialUrl?: string;
    initialImageUrl?: string;
    initialImageWidth?: number;
    initialImageHeight?: number;
    initialPositionX?: number;
    initialPositionY?: number;
    initialPlaceholders?: string[];
}

const GoogleSlidesEditor: React.FC<GoogleSlidesEditorProps> = ({
    onUrlChange,
    initialUrl = '',
    initialImageUrl = '',
    initialImageWidth = 3000000,
    initialImageHeight = 2000000,
    initialPositionX = 1000000,
    initialPositionY = 1000000,
    initialPlaceholders = []
}) => {
    const [includeImage, setIncludeImage] = useState(!!initialImageUrl);
    const [slideUrl, setSlideUrl] = useState(initialUrl);
    const [embedUrl, setEmbedUrl] = useState('');
    const [imageUrl, setImageUrl] = useState(initialImageUrl);
    const [imageWidth, setImageWidth] = useState(initialImageWidth);
    const [imageHeight, setImageHeight] = useState(initialImageHeight);
    const [positionX, setPositionX] = useState(initialPositionX);
    const [positionY, setPositionY] = useState(initialPositionY);
    const [viewMode, setViewMode] = useState<'edit' | 'view'>('view');
    const [isValidUrl, setIsValidUrl] = useState<boolean | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [placeholders, setPlaceholders] = useState<string[]>(initialPlaceholders);
    const [placeholderInput, setPlaceholderInput] = useState('');

    // Extract slide ID from various Google Slides URL formats
    const extractSlideId = (url: string): string | null => {
        try {
            // Match various Google Slides URL patterns
            const patterns = [
                /\/presentation\/d\/([a-zA-Z0-9-_]+)/,           // Standard format
                /\/presentation\/d\/e\/([a-zA-Z0-9-_]+)/,        // Published format
                /id=([a-zA-Z0-9-_]+)/,                            // Query param format
            ];

            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match) {
                    return match[1];
                }
            }
            return null;
        } catch (error) {
            return null;
        }
    };

    // Generate embed URL from slide ID
    const generateEmbedUrl = (slideId: string, mode: 'edit' | 'view' = 'view'): string => {
        if (mode === 'edit') {
            return `https://docs.google.com/presentation/d/${slideId}/edit?rm=minimal`;
        }
        return `https://docs.google.com/presentation/d/${slideId}/embed?start=false&loop=false&delayms=3000`;
    };

    // Validate and process URL
    const validateUrl = (url: string) => {
        if (!url.trim()) {
            setIsValidUrl(null);
            setEmbedUrl('');
            setErrorMessage('');
            setShowPreview(false);
            return;
        }

        const slideId = extractSlideId(url);

        if (slideId) {
            const generatedEmbedUrl = generateEmbedUrl(slideId, viewMode);
            setEmbedUrl(generatedEmbedUrl);
            setIsValidUrl(true);
            setErrorMessage('');
            onUrlChange(
                url,
                generatedEmbedUrl,
                includeImage ? imageUrl : '',
                includeImage ? imageWidth : 0,
                includeImage ? imageHeight : 0,
                includeImage ? positionX : 0,
                includeImage ? positionY : 0,
                placeholders
            );
        } else {
            setIsValidUrl(false);
            setEmbedUrl('');
            setErrorMessage('Invalid Google Slides URL. Please paste a valid link.');
            setShowPreview(false);
        }
    };

    // Handle URL input change
    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newUrl = e.target.value;
        setSlideUrl(newUrl);
        validateUrl(newUrl);
    };

    // Handle view mode toggle
    const handleViewModeChange = (mode: 'edit' | 'view') => {
        setViewMode(mode);
        if (isValidUrl && slideUrl) {
            const slideId = extractSlideId(slideUrl);
            if (slideId) {
                const generatedEmbedUrl = generateEmbedUrl(slideId, mode);
                setEmbedUrl(generatedEmbedUrl);
                setEmbedUrl(generatedEmbedUrl);
                onUrlChange(
                    slideUrl,
                    generatedEmbedUrl,
                    includeImage ? imageUrl : '',
                    includeImage ? imageWidth : 0,
                    includeImage ? imageHeight : 0,
                    includeImage ? positionX : 0,
                    includeImage ? positionY : 0,
                    placeholders
                );
            }
        }
    };

    // Toggle preview
    const handlePreviewToggle = () => {
        if (isValidUrl) {
            setShowPreview(!showPreview);
        }
    };

    useEffect(() => {
        if (initialUrl) {
            validateUrl(initialUrl);
        }
        if (initialImageUrl) {
            setImageUrl(initialImageUrl);
            setIncludeImage(true);
        }
    }, [initialUrl, initialImageUrl]);

    // Update parent whenever config changes
    useEffect(() => {
        if (isValidUrl && slideUrl) {
            const slideId = extractSlideId(slideUrl);
            if (slideId) {
                const generatedEmbedUrl = generateEmbedUrl(slideId, viewMode);
                onUrlChange(
                    slideUrl,
                    generatedEmbedUrl,
                    includeImage ? imageUrl : '',
                    includeImage ? imageWidth : 0,
                    includeImage ? imageHeight : 0,
                    includeImage ? positionX : 0,
                    includeImage ? positionY : 0,
                    placeholders
                );
            }
        }
    }, [imageUrl, imageWidth, imageHeight, positionX, positionY, includeImage, placeholders]);

    // Handle Image URL change
    const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newImageUrl = e.target.value;
        setImageUrl(newImageUrl);
    };

    return (
        <div className="space-y-4 animate-fade-in">
            {/* URL Input Section */}
            <div>
                <label className="label-minimal flex items-center gap-2">
                    <Presentation className="w-4 h-4 text-primary-600" />
                    Google Slides URL
                </label>
                <div className="relative">
                    <input
                        type="url"
                        value={slideUrl}
                        onChange={handleUrlChange}
                        placeholder="https://docs.google.com/presentation/d/YOUR_SLIDE_ID/edit"
                        className={`input-field pr-10 ${isValidUrl === true
                            ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                            : isValidUrl === false
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                : ''
                            }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isValidUrl === true && (
                            <Check className="w-5 h-5 text-green-500" />
                        )}
                        {isValidUrl === false && (
                            <X className="w-5 h-5 text-red-500" />
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {errorMessage && (
                    <div className="mt-2 flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* Help Text */}
                {!isValidUrl && !errorMessage && (
                    <p className="mt-2 text-sm text-gray-500 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>
                            Paste a Google Slides share link. Get it by clicking <strong>Share</strong> in Google Slides.
                        </span>
                    </p>
                )}
            </div>

            {/* Toggle Image Option */}
            {isValidUrl && (
                <div className="flex items-center gap-2 mt-4">
                    <input
                        type="checkbox"
                        id="includeImage"
                        checked={includeImage}
                        onChange={(e) => setIncludeImage(e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                    />
                    <label htmlFor="includeImage" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                        Insert Dynamic Image (e.g., User Photo)
                    </label>
                </div>
            )}

            {/* Image URL Input Section */}
            {isValidUrl && includeImage && (
                <div className="space-y-4 border-t border-gray-200 pt-4 mt-2 animate-fade-in">
                    <div>
                        <label className="label-minimal flex items-center gap-2">
                            <span className="text-xl">🖼️</span>
                            Image URL
                        </label>
                        <div className="relative">
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={handleImageUrlChange}
                                placeholder="https://example.com/image.png"
                                className="input-field"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Provide a direct link to an image to insert into the slide.
                            </p>
                        </div>
                    </div>

                    {imageUrl && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                            <h4 className="font-semibold text-sm text-gray-700">Image Configuration</h4>

                            {/* Preview */}
                            <div className="flex justify-center bg-gray-200 rounded-lg p-2 overflow-hidden items-center" style={{ height: '200px' }}>
                                <img
                                    src={imageUrl}
                                    alt="Preview"
                                    className="max-h-full object-contain shadow-sm"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label-minimal text-xs">Width (EMU)</label>
                                    <input
                                        type="number"
                                        value={imageWidth}
                                        onChange={(e) => setImageWidth(Number(e.target.value))}
                                        className="input-field text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="label-minimal text-xs">Height (EMU)</label>
                                    <input
                                        type="number"
                                        value={imageHeight}
                                        onChange={(e) => setImageHeight(Number(e.target.value))}
                                        className="input-field text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="label-minimal text-xs">Pos X (EMU)</label>
                                    <input
                                        type="number"
                                        value={positionX}
                                        onChange={(e) => setPositionX(Number(e.target.value))}
                                        className="input-field text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="label-minimal text-xs">Pos Y (EMU)</label>
                                    <input
                                        type="number"
                                        value={positionY}
                                        onChange={(e) => setPositionY(Number(e.target.value))}
                                        className="input-field text-sm"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 text-center">
                                1 inch = 914,400 EMUs. Default: 3M x 2M at (1M, 1M).
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Placeholder Names Input */}
            {isValidUrl && (
                <div className="space-y-3 border-t border-gray-200 pt-4 mt-4">
                    <label className="label-minimal">Google Slides Placeholders</label>
                    <p className="text-xs text-gray-500 mb-2">
                        Enter the placeholder names from your Google Slides (e.g., NAME, BADGE, DESCRIPTION). Separate multiple with commas.
                    </p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={placeholderInput}
                            onChange={(e) => setPlaceholderInput(e.target.value)}
                            placeholder="NAME, BADGE, DESCRIPTION"
                            className="input-field flex-1"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                const newPlaceholders = placeholderInput
                                    .split(',')
                                    .map((p: string) => p.trim())
                                    .filter((p: string) => p.length > 0 && !placeholders.includes(p));
                                if (newPlaceholders.length > 0) {
                                    setPlaceholders([...placeholders, ...newPlaceholders]);
                                    setPlaceholderInput('');
                                }
                            }}
                            className="btn-secondary"
                        >
                            Add
                        </button>
                    </div>
                    {placeholders.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {placeholders.map((placeholder) => (
                                <span
                                    key={placeholder}
                                    className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-3 py-1 rounded text-sm font-medium"
                                >
                                    {placeholder}
                                    <button
                                        type="button"
                                        onClick={() => setPlaceholders(placeholders.filter((p: string) => p !== placeholder))}
                                        className="hover:text-primary-900"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}


            {/* View Mode Toggle */}
            {isValidUrl && (
                <div className="space-y-3">
                    <label className="label-minimal">Preview Mode</label>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => handleViewModeChange('view')}
                            className={`toggle-button ${viewMode === 'view'
                                ? 'toggle-button-active'
                                : 'toggle-button-inactive'
                                }`}
                        >
                            <Eye className="w-4 h-4" />
                            <span>View Only</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleViewModeChange('edit')}
                            className={`toggle-button ${viewMode === 'edit'
                                ? 'toggle-button-active'
                                : 'toggle-button-inactive'
                                }`}
                        >
                            <Edit3 className="w-4 h-4" />
                            <span>Edit Mode</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Preview Button */}
            {isValidUrl && (
                <button
                    type="button"
                    onClick={handlePreviewToggle}
                    className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                    <Eye className="w-5 h-5" />
                    <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
                </button>
            )}

            {/* Preview Section */}
            {showPreview && isValidUrl && embedUrl && (
                <div className="mt-4 animate-fade-in">
                    <div className="bg-white rounded-xl border-2 border-gray-200 p-3 shadow-xl">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Presentation className="w-5 h-5 text-primary-600" />
                                Certificate Template Preview
                            </h3>
                            <a
                                href={slideUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 font-medium"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Open in Google Slides
                            </a>
                        </div>

                        <div className="relative bg-gray-50 rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                            <iframe
                                src={embedUrl}
                                className="absolute top-0 left-0 w-full h-full border-0"
                                allowFullScreen
                                title="Google Slides Preview"
                            />
                        </div>

                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-900 flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span>
                                    {viewMode === 'edit'
                                        ? 'Edit mode allows you to modify the template directly in the preview.'
                                        : 'View-only mode displays the template without editing capabilities.'}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Instructions */}
            {!slideUrl && (
                <div className="mt-4 p-4 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl border border-primary-100">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Presentation className="w-5 h-5 text-primary-600" />
                        How to get your Google Slides URL:
                    </h4>
                    <ol className="space-y-2 text-sm text-gray-700">
                        <li className="flex gap-2">
                            <span className="font-semibold text-primary-600">1.</span>
                            <span>Open your certificate template in Google Slides</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-semibold text-primary-600">2.</span>
                            <span>Click the <strong>Share</strong> button (top right)</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-semibold text-primary-600">3.</span>
                            <span>Change access to <strong>"Anyone with the link"</strong> can view/edit</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="font-semibold text-primary-600">4.</span>
                            <span>Click <strong>Copy link</strong> and paste it above</span>
                        </li>
                    </ol>
                </div>
            )}
        </div>
    );
};

export default GoogleSlidesEditor;
