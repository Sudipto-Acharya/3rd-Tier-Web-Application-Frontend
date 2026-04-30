import React from 'react';
import { Link } from 'react-router-dom';

const categoryClass = {
  Compute: 'badge-compute',
  Storage: 'badge-storage',
  Networking: 'badge-networking',
  Security: 'badge-security',
  Management: 'badge-management',
};

const ServiceCard = ({ service, progress }) => {
  const pct = progress?.percentage ?? null;

  return (
    <Link to={`/service/${service.slug}`} style={{ textDecoration: 'none' }}>
      <div className="card service-card">
        <div className="service-card-header">
          <span className="service-icon">{service.icon}</span>
          <span className={`badge ${categoryClass[service.category] || 'badge-compute'}`}>
            {service.category}
          </span>
        </div>
        <h3 className="service-name">{service.name}</h3>
        <p className="service-desc">{service.short_description}</p>

        {pct !== null && (
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span>Progress</span>
              <span style={{ color: pct === 100 ? 'var(--accent-green)' : 'var(--accent-orange)' }}>{pct}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        <div className="service-card-footer">
          <span className="btn btn-secondary" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}>
            {pct === 100 ? '✅ Completed' : pct > 0 ? '📖 Continue' : '🚀 Start Learning'}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;
