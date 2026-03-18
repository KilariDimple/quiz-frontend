import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/utils/api';

export default function StudentResults() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/student/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/results/student').then((res) => { setResults(res.data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [isAuthenticated]);

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <h1>Results</h1>
        <p>Your quiz performance history</p>
      </div>
      {results.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <p className="text-secondary">No results yet. Take a quiz to see your scores.</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Quiz</th><th>Score</th><th>Percentage</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {results.map((r) => (
                <tr key={r._id}>
                  <td className="font-medium">{r.quizId?.title || 'Quiz'}</td>
                  <td>{r.score}/{r.totalQuestions}</td>
                  <td><span className={`badge ${r.percentage >= 70 ? 'badge-success' : r.percentage >= 40 ? 'badge-warning' : 'badge-danger'}`}>{r.percentage}%</span></td>
                  <td className="text-muted">{new Date(r.submittedAt).toLocaleDateString()}</td>
                  <td>{r.isReleased === false ? <span className="badge badge-default">Pending</span> : <span className="badge badge-success">Released</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
