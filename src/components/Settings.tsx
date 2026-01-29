import React from 'react';
import { Palette, Globe, Link as LinkIcon } from 'lucide-react';

const Settings: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                <p className="text-gray-600">Configure your certificate generator preferences</p>
            </div>

            <div className="space-y-6">
                {/* Default Sender Information */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Default Sender Information</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Organization Name
                            </label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Your Organization"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                className="input-field"
                                placeholder="sender@organization.com"
                            />
                        </div>
                    </div>
                </div>

                {/* Branding Preferences */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        Default Branding
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Brand Colors (comma-separated hex codes)
                            </label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="#0ea5e9, #d946ef"
                            />
                        </div>
                    </div>
                </div>

                {/* API Configuration */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <LinkIcon className="w-5 h-5" />
                        n8n Webhook Configuration
                    </h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Webhook URL
                        </label>
                        <input
                            type="url"
                            className="input-field"
                            placeholder="https://your-n8n-instance.com/webhook/..."
                        />
                        <p className="text-sm text-gray-500 mt-2">
                            Configure your n8n workflow webhook endpoint
                        </p>
                    </div>
                </div>

                {/* Theme */}
                <div className="card">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        Appearance
                    </h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Theme
                        </label>
                        <select className="input-field">
                            <option>Light</option>
                            <option>Dark</option>
                            <option>System</option>
                        </select>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button className="btn-primary">
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
