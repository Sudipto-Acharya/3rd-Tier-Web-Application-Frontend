import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const res = await axios.get('/api/progress');
      setProgress(res.data.progress);
    } catch (err) {
      console.error('Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  const totalTopics = progress.reduce((sum, p) => sum + parseInt(p.total_topics), 0);
  const totalCompleted = progress.reduce((sum, p) => sum + parseInt(p.completed_topics), 0);
  const overallPct = totalTopics > 0 ? Math.round((totalCompleted / totalTopics) * 100) : 0;
  const servicesCompleted = progress.filter(p => p.percentage === 100).length;

  if (loading) return <div className="spinner" />;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>👋 Welcome back, {user?.name}!</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Member since {new Date(user?.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link to="/" className="btn btn-primary">📚 Continue Learning</Link>
      </div>

      {/* Stats Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{overallPct}%</div>
          <div className="stat-label">Overall Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{totalCompleted}</div>
          <div className="stat-label">Topics Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{servicesCompleted}</div>
          <div className="stat-label">Services Mastered</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-value">{totalTopics - totalCompleted}</div>
          <div className="stat-label">Topics Remaining</div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h3>Overall AWS Learning Progress</h3>
          <span style={{ color: 'var(--accent-orange)', fontWeight: 600 }}>{overallPct}%</span>
        </div>
        <div className="progress-bar" style={{ height: 10 }}>
          <div className="progress-fill" style={{ width: `${overallPct}%` }} />
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          {totalCompleted} of {totalTopics} total topics completed
        </p>
      </div>

      {/* Per-Service Progress */}
      <h2 style={{ marginBottom: '1rem' }}>Service Breakdown</h2>
      <div className="progress-grid">
        {progress.map(item => (
          <Link to={`/service/${item.slug}`} key={item.service_id} style={{ textDecoration: 'none' }}>
            <div className="card progress-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.75rem' }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.95rem' }}>{item.name}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {item.completed_topics} / {item.total_topics} topics
                  </span>
                </div>
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: item.percentage === 100 ? 'var(--accent-green)' : 'var(--accent-orange)'
                }}>
                  {item.percentage}%
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${item.percentage}%` }} />
              </div>
              {item.percentage === 100 && (
                <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--accent-green)' }}>
                  🏆 Completed!
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
