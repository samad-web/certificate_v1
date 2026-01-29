import { useState } from 'react';
import Navbar from './components/Navbar';
import CertificateForm from './components/CertificateForm';
import CertificateHistory from './components/CertificateHistory';
import Settings from './components/Settings';

type Tab = 'generate' | 'history' | 'settings';

function App() {
  const [currentTab, setCurrentTab] = useState<Tab>('generate');

  const renderContent = () => {
    switch (currentTab) {
      case 'generate':
        return <CertificateForm />;
      case 'history':
        return <CertificateHistory />;
      case 'settings':
        return <Settings />;
      default:
        return <CertificateForm />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentTab={currentTab} onTabChange={setCurrentTab} />

      <main className="py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Certificate Generator · Powered by n8n & Gemini 2.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
