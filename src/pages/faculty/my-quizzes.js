import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/utils/api';

export default function MyQuizzes() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/faculty/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/quizzes/my-quizzes').then((r) => { setQuizzes(r.data); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [isAuthenticated]);

  const handleRelease = async (id) => {
    try { await api.put(`/quizzes/release/${id}`); setQuizzes(quizzes.map((q) => q.id === id ? { ...q, isReleased: true } : q)); }
    catch { alert('Failed to release results'); }
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <h1>My Quizzes</h1>
        <p>{quizzes.length} quizzes created</p>
      </div>

      {quizzes.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <p className="text-secondary" style={{ marginBottom: 16 }}>No quizzes created yet.</p>
          <button className="btn btn-primary" onClick={() => router.push('/faculty/create-quiz')}>Create Quiz</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {quizzes.map((q) => (
            <div className="card" key={q.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h4 style={{ marginBottom: 6 }}>{q.title}</h4>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span className="text-xs text-secondary">Code: <code className="font-mono font-semibold" style={{ letterSpacing: 2 }}>{q.quizCode}</code></span>
                    <span className="text-xs text-secondary">{q.questionCount} questions</span>
                    <span className="text-xs text-secondary">{q.submittedCount || 0} submissions</span>
                    <span className="text-xs text-muted">{new Date(q.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  {q.resultMode === 'hidden' && !q.isReleased && (
                    <button className="btn btn-sm btn-success" onClick={() => handleRelease(q.id)}>Release Results</button>
                  )}
                  {q.isReleased && <span className="badge badge-success">Released</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
