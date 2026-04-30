import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import QuestionBox from '../components/QuestionBox';

const ServicePage = () => {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const [service, setService] = useState(null);
  const [topics, setTopics] = useState([]);
  const [progress, setProgress] = useState([]);
  const [activeTopicId, setActiveTopicId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchService();
  }, [slug]);

  const fetchService = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/services/${slug}`);
      setService(res.data.service);
      setTopics(res.data.topics);
      setProgress(res.data.progress || []);
      if (res.data.topics.length > 0) {
        setActiveTopicId(res.data.topics[0].id);
      }
    } catch (err) {
      setError('Service not found');
    } finally {
      setLoading(false);
    }
  };

  const isTopicCompleted = (topicId) =>
    progress.some(p => p.topic_id === topicId && p.completed);

  const handleToggleComplete = async (topicId) => {
    if (!isAuthenticated) return;
    const completed = !isTopicCompleted(topicId);
    try {
      await axios.put(`/api/progress/${topicId}`, { completed });
      setProgress(prev => {
        const existing = prev.find(p => p.topic_id === topicId);
        if (existing) {
          return prev.map(p => p.topic_id === topicId ? { ...p, completed } : p);
        }
        return [...prev, { topic_id: topicId, completed }];
      });
    } catch (err) {
      console.error('Progress update failed');
    }
  };

  const completedCount = topics.filter(t => isTopicCompleted(t.id)).length;
  const pct = topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0;
  const activeTopic = topics.find(t => t.id === activeTopicId);

  if (loading) return <div className="spinner" />;
  if (error) return (
    <div className="page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <h2>⚠️ {error}</h2>
      <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>← Back to Home</Link>
    </div>
  );

  return (
    <div className="service-page">
      {/* Service Header */}
      <div className="service-hero" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '2rem' }}>
        <div className="page-container" style={{ padding: '0' }}>
          <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem' }}>
            ← All Services
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
            <span style={{ fontSize: '3rem' }}>{service.icon}</span>
            <div>
              <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>{service.name}</h1>
              <p style={{ color: 'var(--text-secondary)' }}>{service.short_description}</p>
            </div>
          </div>

          {isAuthenticated && (
            <div style={{ marginTop: '1.5rem', maxWidth: 400 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>{completedCount} / {topics.length} topics completed</span>
                <span style={{ color: pct === 100 ? 'var(--accent-green)' : 'var(--accent-orange)' }}>{pct}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="service-layout page-container">
        {/* Sidebar */}
        <aside className="topics-sidebar">
          <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Topics
          </h3>
          {topics.map((topic, idx) => (
            <button
              key={topic.id}
              className={`topic-btn ${activeTopicId === topic.id ? 'active' : ''}`}
              onClick={() => setActiveTopicId(topic.id)}
            >
              <span className="topic-number">{idx + 1}</span>
              <span className="topic-title">{topic.title}</span>
              {isAuthenticated && isTopicCompleted(topic.id) && (
                <span className="topic-check">✓</span>
              )}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <main className="topic-content">
          {activeTopic && (
            <>
              <div className="topic-header">
                <h2>{activeTopic.title}</h2>
                {isAuthenticated && (
                  <button
                    className={`btn ${isTopicCompleted(activeTopic.id) ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => handleToggleComplete(activeTopic.id)}
                  >
                    {isTopicCompleted(activeTopic.id) ? '↩ Mark Incomplete' : '✓ Mark Complete'}
                  </button>
                )}
              </div>

              <div className="topic-body">
                <ReactMarkdown>{activeTopic.content}</ReactMarkdown>
              </div>

              {/* Navigation */}
              <div className="topic-nav">
                {topics.findIndex(t => t.id === activeTopicId) > 0 && (
                  <button className="btn btn-ghost" onClick={() => {
                    const idx = topics.findIndex(t => t.id === activeTopicId);
                    setActiveTopicId(topics[idx - 1].id);
                  }}>← Previous</button>
                )}
                {topics.findIndex(t => t.id === activeTopicId) < topics.length - 1 && (
                  <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => {
                    const idx = topics.findIndex(t => t.id === activeTopicId);
                    setActiveTopicId(topics[idx + 1].id);
                  }}>Next →</button>
                )}
              </div>
            </>
          )}

          {/* Questions Section */}
          <QuestionBox serviceSlug={slug} />
        </main>
      </div>
    </div>
  );
};

export default ServicePage;
