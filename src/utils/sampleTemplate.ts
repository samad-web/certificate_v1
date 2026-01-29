// Sample Excel Template Generator for Bulk Certificates
import * as XLSX from 'xlsx';

export const generateSampleExcel = () => {
    // Sample data with proper column headers
    const sampleData = [
        {
            'Certificate Title': 'Certificate of Completion',
            'Recipient Name': 'John Doe',
            'Award Purpose': 'For successfully completing the Advanced Project Management Course',
            'Program Name': 'Advanced Project Management',
            'Issuing Organization': 'Tech Institute',
            'Date of Issue': '2024-01-20',
            'Email': 'john.doe@example.com',
            'WhatsApp': '+1234567890'
        },
        {
            'Certificate Title': 'Certificate of Achievement',
            'Recipient Name': 'Jane Smith',
            'Award Purpose': 'For outstanding performance in web development',
            'Program Name': 'Full Stack Web Development Bootcamp',
            'Issuing Organization': 'Code Academy',
            'Date of Issue': '2024-01-20',
            'Email': 'jane.smith@example.com',
            'WhatsApp': '+0987654321'
        },
        {
            'Certificate Title': 'Certificate of Participation',
            'Recipient Name': 'Bob Johnson',
            'Award Purpose': 'For active participation in the leadership workshop',
            'Program Name': 'Leadership Excellence Workshop',
            'Issuing Organization': 'Business School',
            'Date of Issue': '2024-01-20',
            'Email': 'bob.johnson@example.com',
            'WhatsApp': '+1122334455'
        }
    ];

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(sampleData);

    // Set column widths for better readability
    const columnWidths = [
        { wch: 25 },  // Certificate Title
        { wch: 20 },  // Recipient Name
        { wch: 50 },  // Award Purpose
        { wch: 35 },  // Program Name
        { wch: 25 },  // Issuing Organization
        { wch: 15 },  // Date of Issue
        { wch: 30 },  // Email
        { wch: 15 }   // WhatsApp
    ];
    worksheet['!cols'] = columnWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Certificates');

    // Generate and download file
    XLSX.writeFile(workbook, 'certificate_template_sample.xlsx');
};

export const generateSampleCSV = () => {
    const csvContent = `Certificate Title,Recipient Name,Award Purpose,Program Name,Issuing Organization,Date of Issue,Email,WhatsApp
Certificate of Completion,John Doe,For successfully completing the Advanced Project Management Course,Advanced Project Management,Tech Institute,2024-01-20,john.doe@example.com,+1234567890
Certificate of Achievement,Jane Smith,For outstanding performance in web development,Full Stack Web Development Bootcamp,Code Academy,2024-01-20,jane.smith@example.com,+0987654321
Certificate of Participation,Bob Johnson,For active participation in the leadership workshop,Leadership Excellence Workshop,Business School,2024-01-20,bob.johnson@example.com,+1122334455`;

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'certificate_template_sample.csv');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
