import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/utils/api';

export default function Feedback() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/student/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/results/student').then((r) => { setResults(r.data); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [isAuthenticated]);

  const generateFeedback = async () => {
    if (!selectedResult) return;
    setFeedbackLoading(true);
    try { const res = await api.post(`/ai/feedback/${selectedResult}`); console.log("FEEDBACK RESPONSE:", res.data); setFeedback(res.data); }
    catch (err) { alert(err.response?.data?.message || 'Failed to generate feedback'); }
    finally { setFeedbackLoading(false); }
  };

  const downloadPdf = async () => {
    try {
      const res = await api.get(`/ai/feedback-pdf/${selectedResult}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'feedback-report.pdf'; a.click();
      window.URL.revokeObjectURL(url);
    } catch { alert('Failed to download PDF'); }
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <h1>Feedback</h1>
        <p>AI-generated performance feedback</p>
      </div>

      <div className="card mb-6">
        <h4 style={{ marginBottom: 14 }}>Select a quiz</h4>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <select className="form-input" value={selectedResult} onChange={(e) => { setSelectedResult(e.target.value); setFeedback(null); }} style={{ maxWidth: 320 }}>
            <option value="">Choose...</option>
            {(Array.isArray(results) ? results : []).map((r) => <option key={r._id} value={r._id}>{r.quizId?.title || 'Quiz'} — {r.percentage}%</option>)}
          </select>
          <button className="btn btn-primary" onClick={generateFeedback} disabled={!selectedResult || feedbackLoading}>
            {feedbackLoading ? 'Generating...' : 'Generate Feedback'}
          </button>
        </div>
      </div>

      {feedback && (
        <div>
          <div className="card-grid">
            <div className="card">
              <h4 style={{ marginBottom: 12 }}>Strengths</h4>
              <ul style={{ paddingLeft: 18 }}>
                {(Array.isArray(feedback?.data?.strengths) ? feedback.data.strengths : []).map((s, i) => <li key={i} className="text-sm text-secondary" style={{ marginBottom: 6 }}>{s}</li>)}
              </ul>
            </div>
            <div className="card">
              <h4 style={{ marginBottom: 12 }}>Areas to Improve</h4>
              <ul style={{ paddingLeft: 18 }}>
                {(Array.isArray(feedback?.data?.weaknesses) ? feedback.data.weaknesses : []).map((w, i) => <li key={i} className="text-sm text-secondary" style={{ marginBottom: 6 }}>{w}</li>)}
              </ul>
            </div>
          </div>

          <div className="card mt-4">
            <h4 style={{ marginBottom: 12 }}>Suggestions</h4>
            <ul style={{ paddingLeft: 18 }}>
              {(Array.isArray(feedback?.data?.suggestions) ? feedback.data.suggestions : []).map((s, i) => <li key={i} className="text-sm text-secondary" style={{ marginBottom: 6, lineHeight: 1.6 }}>{s}</li>)}
            </ul>
          </div>

          {feedback?.data?.overallComment && (
            <div className="card mt-4">
              <h4 style={{ marginBottom: 8 }}>Summary</h4>
              <p className="text-sm text-secondary" style={{ lineHeight: 1.7 }}>{feedback.data.overallComment}</p>
            </div>
          )}

          <div className="mt-4">
            <button className="btn" onClick={downloadPdf}>Download PDF Report</button>
          </div>
        </div>
      )}
    </Layout>
  );
}
