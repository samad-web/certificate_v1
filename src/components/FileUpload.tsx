import React, { useState, useRef } from 'react';
import { Upload, X, FileImage } from 'lucide-react';

interface FileUploadProps {
    accept?: string;
    onChange: (file: File | null) => void;
    value?: File | null;
    label?: string;
    description?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
    accept = '*',
    onChange,
    value,
    label = 'Upload File',
    description = 'Drag and drop or click to browse',
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            onChange(files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files[0]) {
            onChange(files[0]);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div>
            <label className="label-minimal">{label}</label>
            <div
                className={`file-upload ${isDragOver ? 'file-upload-active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    className="hidden"
                />

                {value ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center">
                                <FileImage className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{value.name}</p>
                                <p className="text-sm text-gray-500">
                                    {(value.size / 1024).toFixed(2)} KB
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleRemove}
                            className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
                        >
                            <X className="w-4 h-4 text-red-600" />
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-100 to-purple-100 flex items-center justify-center">
                            <Upload className="w-8 h-8 text-primary-600" />
                        </div>
                        <p className="font-medium text-gray-900 mb-1">{description}</p>
                        <p className="text-sm text-gray-500">
                            {accept.split(',').map(ext => ext.trim().toUpperCase()).join(', ')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUpload;
