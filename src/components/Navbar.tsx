import React from 'react';
import { Award, History, Settings, Menu, X } from 'lucide-react';

interface NavbarProps {
    currentTab: 'generate' | 'history' | 'settings';
    onTabChange: (tab: 'generate' | 'history' | 'settings') => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    const tabs = [
        { id: 'generate' as const, label: 'Generate', icon: Award },
        { id: 'history' as const, label: 'History', icon: History },
        { id: 'settings' as const, label: 'Settings', icon: Settings },
    ];

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo/Brand */}
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                                <Award className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                                CertGen
                            </span>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:gap-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => onTabChange(tab.id)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${currentTab === tab.id
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-gray-200">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        onTabChange(tab.id);
                                        setMobileMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${currentTab === tab.id
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
