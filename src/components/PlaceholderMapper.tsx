import React from 'react';
import { ArrowRight, Trash2 } from 'lucide-react';

interface PlaceholderMapperProps {
    placeholders: string[];
    availableColumns: string[];
    mapping: Record<string, string>;
    onChange: (mapping: Record<string, string>) => void;
}

const PlaceholderMapper: React.FC<PlaceholderMapperProps> = ({
    placeholders,
    availableColumns,
    mapping,
    onChange
}) => {
    const handleMappingChange = (placeholder: string, column: string) => {
        onChange({
            ...mapping,
            [placeholder]: column
        });
    };

    const handleRemovePlaceholder = (placeholder: string) => {
        const newMapping = { ...mapping };
        delete newMapping[placeholder];
        onChange(newMapping);
    };

    if (placeholders.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-700">Placeholder Mapping</h4>
            <p className="text-xs text-gray-500">
                Map each Google Slides placeholder to a column from your Excel/Google Sheets file.
            </p>

            <div className="space-y-2">
                {placeholders.map((placeholder) => (
                    <div key={placeholder} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex-1 grid grid-cols-[1fr,auto,1fr] items-center gap-3">
                            {/* Placeholder Name */}
                            <div className="text-sm font-medium text-gray-700 bg-white px-3 py-2 rounded border border-gray-300">
                                {placeholder}
                            </div>

                            {/* Arrow Icon */}
                            <ArrowRight className="w-4 h-4 text-gray-400" />

                            {/* Column Dropdown */}
                            <select
                                value={mapping[placeholder] || ''}
                                onChange={(e) => handleMappingChange(placeholder, e.target.value)}
                                className="input-field text-sm"
                            >
                                <option value="">-- Select Column --</option>
                                {availableColumns.map((col) => (
                                    <option key={col} value={col}>
                                        {col}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Remove Button */}
                        <button
                            type="button"
                            onClick={() => handleRemovePlaceholder(placeholder)}
                            className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
                            title="Remove placeholder"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            {placeholders.some(p => !mapping[p]) && (
                <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
                    ⚠️ Some placeholders are not mapped. They will be left empty in the generated certificates.
                </p>
            )}
        </div>
    );
};

export default PlaceholderMapper;
