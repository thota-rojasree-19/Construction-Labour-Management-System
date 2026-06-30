import React, { useState, useEffect } from 'react';
import { FaSync, FaFilter } from 'react-icons/fa';

export default function FilterPanel({ onFilterChange, onReload }) {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        fetch('/api/v1/projects', { headers })
            .then(res => res.json())
            .then(data => {
                if (data && data.projects) setProjects(data.projects);
            })
            .catch(() => {});
    }, []);

    const handleApply = () => {
        onFilterChange({
            project: selectedProject,
            startDate,
            endDate
        });
    };

    const handleReset = () => {
        setSelectedProject('');
        setStartDate('');
        setEndDate('');
        onFilterChange({
            project: '',
            startDate: '',
            endDate: ''
        });
    };

    return (
        <div className="attendance-filters-panel" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>PROJECT SITE</span>
                        <select
                            className="form-input"
                            style={{ width: '200px', padding: '8px 12px', fontSize: '13px' }}
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                        >
                            <option value="">All Projects</option>
                            {projects.map(p => (
                                <option key={p._id} value={p._id}>{p.projectName}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>START DATE</span>
                        <input
                            type="date"
                            className="form-input"
                            style={{ width: '160px', padding: '8px 12px', fontSize: '13px' }}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>END DATE</span>
                        <input
                            type="date"
                            className="form-input"
                            style={{ width: '160px', padding: '8px 12px', fontSize: '13px' }}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={handleApply}>
                            <FaFilter /> Apply
                        </button>
                        <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={handleReset}>
                            Reset
                        </button>
                    </div>
                </div>

                <button className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px' }} onClick={onReload}>
                    <FaSync /> Reload Data
                </button>
            </div>
        </div>
    );
}
