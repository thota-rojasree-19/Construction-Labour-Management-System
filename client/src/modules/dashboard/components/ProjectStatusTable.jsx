import React from 'react';

export default function ProjectStatusTable({ projects }) {
    return (
        <div className="dashboard-card">
            <div className="card-header-row">
                <h3>Projects Execution Status</h3>
            </div>
            
            <div className="table-responsive">
                <table className="project-table">
                    <thead>
                        <tr>
                            <th>Project</th>
                            <th>Location</th>
                            <th>Manager</th>
                            <th>Progress</th>
                            <th>Status</th>
                            <th>Budget</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map((proj) => {
                            let statusClass = 'badge';
                            if (proj.status === 'Active') statusClass += ' active';
                            else if (proj.status === 'Planning') statusClass += ' planning';
                            else if (proj.status === 'Completed') statusClass += ' completed';
                            else if (proj.status === 'Delayed') statusClass += ' delayed';

                            let progressColor = 'var(--primary)';
                            if (proj.status === 'Delayed') progressColor = 'var(--danger)';
                            else if (proj.status === 'Completed') progressColor = 'var(--success)';
                            else if (proj.status === 'Planning') progressColor = 'var(--accent)';

                            return (
                                <tr key={proj.id}>
                                    <td>
                                        <div className="project-info">
                                            <span className="project-name">{proj.name}</span>
                                        </div>
                                    </td>
                                    <td>{proj.location}</td>
                                    <td>{proj.manager}</td>
                                    <td>
                                        <div className="progress-bar-container">
                                            <div className="progress-bar-bg">
                                                <div 
                                                    className="progress-bar-fill" 
                                                    style={{ 
                                                        width: `${proj.progress}%`,
                                                        backgroundColor: progressColor
                                                    }}
                                                ></div>
                                            </div>
                                            <span className="progress-bar-text">{proj.progress}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={statusClass}>{proj.status}</span>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{proj.budget}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
