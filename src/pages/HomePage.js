import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ServiceCard from '../components/ServiceCard';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [services, setServices] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [apiError, setApiError] = useState(false);

  const categories = ['All', 'Compute', 'Storage', 'Networking', 'Security', 'Management'];

  useEffect(() => {
    fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const servicesRes = await axios.get('/api/services');
      // ✅ Safe fallback to [] if undefined
      setServices(servicesRes.data.services || []);

      if (isAuthenticated) {
        try {
          const progressRes = await axios.get('/api/progress');
          setProgress(progressRes.data.progress || []);
        } catch (err) {
          setProgress([]);
        }
      }
    } catch (err) {
      // ✅ API not reachable - show empty state instead of crashing
      console.error('Backend not available:', err.message);
      setServices([]);
      setApiError(true);
    } finally {
      setLoading(false);
    }
  };

  const getProgress = (serviceId) => progress.find(p => p.service_id === serviceId);

  const filteredServices = filter === 'All'
    ? services
    : services.filter(s => s.category === filter);

  if (loading) return <div className="spinner" />;

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">☁️ Cloud Learning Platform</div>
          <h1 className="hero-title">
            Master AWS Services
            <span className="hero-highlight"> the right way</span>
          </h1>
          <p className="hero-subtitle">
            Comprehensive guides, hands-on explanations, and community Q&A for the 7 core AWS services
            every cloud practitioner needs to know.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <strong>7</strong>
              <span>AWS Services</span>
            </div>
            <div className="stat">
              <strong>30+</strong>
              <span>Topics</span>
            </div>
            <div className="stat">
              <strong>Free</strong>
              <span>Forever</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="aws-globe">
            {['💻', '🗄️', '🌐', '⚡', '📊', '🔒', '🛡️'].map((icon, i) => (
              <div key={i} className="orbit-icon" style={{ '--i': i }}>
                {icon}
              </div>
            ))}
            <div className="globe-center">AWS</div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <div className="page-container">
        <div className="section-header">
          <h2>Explore AWS Services</h2>
          <p>Click any service to start learning</p>
        </div>

        {/* API Error Banner */}
        {apiError && (
          <div style={{
            background: 'rgba(255,107,53,0.1)',
            border: '1px solid rgba(255,107,53,0.3)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            color: 'var(--accent-orange)',
            fontSize: '0.9rem'
          }}>
            ⚠️ Backend API is not connected. Connect your backend to see AWS services.
          </div>
        )}

        {/* Category Filter */}
        <div className="filter-bar">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services Grid or Empty State */}
        {filteredServices.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>☁️</div>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              No services available
            </h3>
            <p>
              {apiError
                ? 'Connect your backend API to load AWS services.'
                : 'No services found for this category.'}
            </p>
          </div>
        ) : (
          <div className="services-grid">
            {filteredServices.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                progress={getProgress(service.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;