import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/utils/api';

export default function ClassFeedback() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/faculty/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/quizzes/my-quizzes').then((r) => { setQuizzes(r.data); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [isAuthenticated]);

  const generateFeedback = async () => {
    if (!selectedQuiz) return;
    setFeedbackLoading(true);
    try { const res = await api.get(`/ai/class-feedback/${selectedQuiz}`); console.log("CLASS FEEDBACK RESPONSE:", res.data); setFeedback(res.data); }
    catch (err) { alert(err.response?.data?.message || 'Failed to generate feedback'); }
    finally { setFeedbackLoading(false); }
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <h1>Class Feedback</h1>
        <p>AI-generated class performance insights</p>
      </div>

      <div className="card mb-6">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <select className="form-input" value={selectedQuiz} onChange={(e) => { setSelectedQuiz(e.target.value); setFeedback(null); }} style={{ maxWidth: 320 }}>
            <option value="">Select a quiz...</option>
            {(Array.isArray(quizzes) ? quizzes : []).map((q) => <option key={q.id} value={q.id}>{q.title}</option>)}
          </select>
          <button className="btn btn-primary" onClick={generateFeedback} disabled={!selectedQuiz || feedbackLoading}>
            {feedbackLoading ? 'Analyzing...' : 'Generate Feedback'}
          </button>
        </div>
      </div>

      {feedback && (
        <div>
          {feedback?.data?.overallAssessment && (
            <div className="card mb-6">
              <h4 style={{ marginBottom: 8 }}>Overall Assessment</h4>
              <p className="text-sm text-secondary" style={{ lineHeight: 1.7 }}>{feedback.data.overallAssessment}</p>
            </div>
          )}
          <div className="card-grid">
            <div className="card">
              <h4 style={{ marginBottom: 12 }}>Strong Topics</h4>
              {(Array.isArray(feedback?.data?.strongTopics) ? feedback.data.strongTopics : []).map((t, i) => <p key={i} className="text-sm text-secondary" style={{ marginBottom: 6 }}>{t}</p>)}
            </div>
            <div className="card">
              <h4 style={{ marginBottom: 12 }}>Weak Topics</h4>
              {(Array.isArray(feedback?.data?.weakTopics) ? feedback.data.weakTopics : []).map((t, i) => <p key={i} className="text-sm text-secondary" style={{ marginBottom: 6 }}>{t}</p>)}
            </div>
          </div>
          <div className="card mt-4">
            <h4 style={{ marginBottom: 12 }}>Teaching Suggestions</h4>
            <ul style={{ paddingLeft: 18 }}>
              {(Array.isArray(feedback?.data?.teachingSuggestions) ? feedback.data.teachingSuggestions : []).map((s, i) => <li key={i} className="text-sm text-secondary" style={{ marginBottom: 8, lineHeight: 1.6 }}>{s}</li>)}
            </ul>
          </div>
        </div>
      )}
    </Layout>
  );
}
