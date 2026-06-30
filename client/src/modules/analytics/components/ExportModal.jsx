import React, { useState } from 'react';
import { FaFilePdf, FaFileExcel, FaTimes, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

export default function ExportModal({ isOpen, onClose, filters }) {
    const [loading, setLoading] = useState(false);
    const [selectedModule, setSelectedModule] = useState('projects');
    const [exportFormat, setExportFormat] = useState('pdf');

    if (!isOpen) return null;

    const handleExport = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        // Prepare query string
        let queryParams = `module=${selectedModule}`;
        if (filters.project) queryParams += `&project=${filters.project}`;
        if (filters.startDate) queryParams += `&startDate=${filters.startDate}`;
        if (filters.endDate) queryParams += `&endDate=${filters.endDate}`;

        try {
            if (exportFormat === 'excel') {
                // Fetch CSV/Excel attachment from backend
                const response = await fetch(`/api/v1/reports/excel?${queryParams}`, { headers });
                if (!response.ok) throw new Error('Failed to generate Excel report');
                
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${selectedModule}_report_${Date.now()}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                toast.success('Excel Report downloaded successfully');
            } else {
                // Fetch JSON rows from backend and assemble PDF locally with jsPDF
                const response = await fetch(`/api/v1/reports/pdf?${queryParams}`, { headers });
                const result = await response.json();
                if (!result.success || !result.data || result.data.length === 0) {
                    throw new Error('No data available to generate PDF');
                }

                const doc = new jsPDF();
                
                // Add header
                doc.setFont('Helvetica', 'bold');
                doc.setFontSize(20);
                doc.setTextColor(249, 115, 22); // ConstroConnect Orange
                doc.text('ConstroConnect - Construction ERP', 14, 20);
                
                doc.setFontSize(14);
                doc.setTextColor(51, 65, 85); // Slate 700
                doc.text(`${selectedModule.toUpperCase()} EXECUTIVE SUMMARY REPORT`, 14, 30);
                
                doc.setFont('Helvetica', 'normal');
                doc.setFontSize(10);
                doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 38);
                doc.text(`Filters: Project Site ID [${filters.project || 'All'}], Dates [${filters.startDate || 'Any'} to ${filters.endDate || 'Any'}]`, 14, 44);
                
                doc.line(14, 48, 196, 48);

                // Build simple grid lists
                let yPos = 56;
                doc.setFont('Helvetica', 'bold');
                doc.setFontSize(11);
                
                // Extract headers
                const cols = Object.keys(result.data[0]);
                
                // Print header row
                let xPos = 14;
                cols.forEach((col, idx) => {
                    doc.text(col.substring(0, 15), xPos, yPos);
                    xPos += (182 / cols.length);
                });
                
                doc.line(14, yPos + 2, 196, yPos + 2);
                yPos += 10;
                
                doc.setFont('Helvetica', 'normal');
                doc.setFontSize(9);
                
                // Print data rows
                result.data.forEach((row, rowIdx) => {
                    if (yPos > 270) {
                        doc.addPage();
                        yPos = 20;
                    }
                    xPos = 14;
                    cols.forEach(col => {
                        const val = row[col] !== undefined && row[col] !== null ? String(row[col]) : '';
                        doc.text(val.substring(0, 18), xPos, yPos);
                        xPos += (182 / cols.length);
                    });
                    yPos += 8;
                });

                // Add footer page numbers
                const pageCount = doc.internal.getNumberOfPages();
                for (let i = 1; i <= pageCount; i++) {
                    doc.setPage(i);
                    doc.setFontSize(9);
                    doc.setTextColor(148, 163, 184); // slate-400
                    doc.text(`Page ${i} of ${pageCount}`, 95, 288);
                    doc.text('© ConstroConnect ERP Systems Inc. Confidential.', 14, 288);
                }

                doc.save(`${selectedModule}_report_${Date.now()}.pdf`);
                toast.success('PDF Report generated and downloaded');
            }
            onClose();
        } catch (error) {
            toast.error(error.message || 'Failed to export report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="export-modal-overlay">
            <div className="export-modal-content">
                <div className="export-modal-header">
                    <h3>Export Executive BI Reports</h3>
                    <button className="export-modal-close" onClick={onClose} disabled={loading}>
                        <FaTimes />
                    </button>
                </div>
                
                <div className="export-modal-body">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>SELECT REPORT DOMAIN</label>
                            <select
                                className="form-input"
                                value={selectedModule}
                                onChange={(e) => setSelectedModule(e.target.value)}
                                disabled={loading}
                            >
                                <option value="projects">Projects Portfolio List</option>
                                <option value="labour">Workforce & Labour Allocation</option>
                                <option value="attendance">Daily Attendance Logs</option>
                                <option value="payroll">Payroll Expense Audits</option>
                                <option value="expenses">Direct Operations Expenses</option>
                                <option value="site-reports">Daily Site Progress Reports</option>
                            </select>
                        </div>

                        <div>
                            <label className="form-label" style={{ fontWeight: 600, fontSize: '13px' }}>EXPORT FORMAT</label>
                            <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="format"
                                        value="pdf"
                                        checked={exportFormat === 'pdf'}
                                        onChange={() => setExportFormat('pdf')}
                                        disabled={loading}
                                    />
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <FaFilePdf style={{ color: '#ef4444' }} /> PDF Document
                                    </span>
                                </label>
                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="format"
                                        value="excel"
                                        checked={exportFormat === 'excel'}
                                        onChange={() => setExportFormat('excel')}
                                        disabled={loading}
                                    />
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        <FaFileExcel style={{ color: '#10b981' }} /> Excel CSV Spreadsheet
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="export-modal-footer">
                    <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleExport} disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        {loading ? (
                            <>
                                <FaSpinner className="fa-spin" /> Exporting...
                            </>
                        ) : (
                            'Download File'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
