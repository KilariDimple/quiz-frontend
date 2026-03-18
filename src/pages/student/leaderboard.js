import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import api from '@/utils/api';

export default function Leaderboard() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!authLoading && !isAuthenticated) { router.push('/student/login'); return null; }

  const handleSearch = async () => {
    if (!code) return;
    setLoading(true); setError('');
    try { const res = await api.get(`/results/leaderboard/${code}`); setResults(res.data); }
    catch (err) { setError(err.response?.data?.message || 'Failed to load leaderboard'); }
    finally { setLoading(false); }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>Leaderboard</h1>
        <p>See how you rank</p>
      </div>

      <div className="card mb-6">
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <input type="text" className="form-input" placeholder="Enter quiz code" value={code}
            onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{ maxWidth: 240 }} />
          <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>
        {error && <p className="text-sm" style={{ color: 'var(--danger)', marginTop: 8 }}>{error}</p>}
      </div>

      {results && (
        <div className="card" style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead><tr><th>Rank</th><th>Student</th><th>Score</th><th>Percentage</th></tr></thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={r._id}>
                  <td className="font-semibold">{i + 1}</td>
                  <td className="font-medium">{r.username}</td>
                  <td>{r.score}/{r.totalQuestions}</td>
                  <td><span className={`badge ${r.percentage >= 70 ? 'badge-success' : r.percentage >= 40 ? 'badge-warning' : 'badge-danger'}`}>{r.percentage}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
