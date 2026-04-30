import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const QuestionBox = ({ serviceSlug }) => {
  const { isAuthenticated, user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, [serviceSlug]);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(`/api/questions/${serviceSlug}`);
      setQuestions(res.data.questions);
    } catch (err) {
      console.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setPosting(true);
    setError('');
    try {
      const res = await axios.post(`/api/questions/${serviceSlug}`, { question: newQuestion });
      setQuestions([res.data.question, ...questions]);
      setNewQuestion('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post question');
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (questionId) => {
    if (!isAuthenticated) return;
    try {
      const res = await axios.post(`/api/questions/like/${questionId}`);
      setQuestions(questions.map(q =>
        q.id === questionId
          ? { ...q, likes: res.data.likes, userLiked: res.data.liked }
          : q
      ));
    } catch (err) {
      console.error('Like failed');
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="question-box">
      <div className="question-box-header">
        <h2>💬 Community Questions</h2>
        <p>Ask questions or browse what others are asking about this service</p>
      </div>

      {/* Post Question */}
      {isAuthenticated ? (
        <form onSubmit={handlePost} className="question-form">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <textarea
              className="form-input"
              placeholder="Ask a question about this service..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              rows={3}
            />
          </div>
          {error && <div className="alert alert-error" style={{ marginTop: 8 }}>{error}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button type="submit" className="btn btn-primary" disabled={posting || !newQuestion.trim()}>
              {posting ? 'Posting...' : '📤 Post Question'}
            </button>
          </div>
        </form>
      ) : (
        <div className="login-prompt">
          <p>🔐 <Link to="/login">Log in</Link> or <Link to="/register">sign up</Link> to ask questions</p>
        </div>
      )}

      {/* Questions List */}
      <div className="questions-list">
        {loading ? (
          <div className="spinner" />
        ) : questions.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: '2rem' }}>🌱</span>
            <p>No questions yet. Be the first to ask!</p>
          </div>
        ) : (
          questions.map((q) => (
            <div key={q.id} className="question-item">
              <div className="question-meta">
                <span className="question-avatar">{q.user_avatar || '🎓'}</span>
                <span className="question-user">{q.user_name}</span>
                <span className="question-date">{formatDate(q.created_at)}</span>
              </div>
              <p className="question-text">{q.question}</p>
              {q.answer && (
                <div className="question-answer">
                  <strong>✅ Answer:</strong>
                  <p>{q.answer}</p>
                  {q.answered_by_name && (
                    <small>— {q.answered_by_name}</small>
                  )}
                </div>
              )}
              <div className="question-actions">
                <button
                  className={`like-btn ${q.userLiked ? 'liked' : ''}`}
                  onClick={() => handleLike(q.id)}
                  disabled={!isAuthenticated}
                  title={isAuthenticated ? 'Like this question' : 'Login to like'}
                >
                  👍 {q.likes}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuestionBox;
