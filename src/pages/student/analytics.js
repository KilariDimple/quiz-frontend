import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { PerformanceChart } from '@/components/Charts';
import api from '@/utils/api';

export default function StudentAnalytics() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/student/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([
        api.get('/results/student').then((r) => r.data),
        api.get('/ai/analytics').then((r) => r.data).catch(() => null),
      ]).then(([res, ins]) => { setResults(res); setInsights(ins); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [isAuthenticated]);

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <h1>Analytics</h1>
        <p>Your performance overview</p>
      </div>

      {results.length > 0 && (
        <div className="card mb-6">
          <h3 style={{ marginBottom: 20 }}>Performance Over Time</h3>
          <PerformanceChart
            labels={results.map((r, i) => `Quiz ${i + 1}`)}
            scores={results.map((r) => r.score)}
            percentages={results.map((r) => r.percentage)}
          />
        </div>
      )}

      {insights && (
        <div className="card-grid">
          <div className="card">
            <h4 style={{ marginBottom: 12 }}>Trend</h4>
            <span className={`badge ${insights.trend === 'improving' ? 'badge-success' : insights.trend === 'declining' ? 'badge-danger' : 'badge-default'}`} style={{ marginBottom: 12, display: 'inline-flex' }}>
              {insights.trend}
            </span>
            <p className="text-sm text-secondary">{insights.trendDescription}</p>
          </div>
          <div className="card">
            <h4 style={{ marginBottom: 12 }}>Strong Areas</h4>
            {insights.strongAreas?.map((a, i) => <p key={i} className="text-sm" style={{ marginBottom: 6, color: 'var(--text-secondary)' }}>{a}</p>)}
          </div>
          <div className="card">
            <h4 style={{ marginBottom: 12 }}>Areas to Improve</h4>
            {insights.weakAreas?.map((a, i) => <p key={i} className="text-sm" style={{ marginBottom: 6, color: 'var(--text-secondary)' }}>{a}</p>)}
          </div>
        </div>
      )}

      {insights?.studySuggestions && (
        <div className="card mt-4">
          <h4 style={{ marginBottom: 12 }}>Study Suggestions</h4>
          <ul style={{ paddingLeft: 18 }}>
            {insights.studySuggestions.map((s, i) => <li key={i} className="text-sm text-secondary" style={{ marginBottom: 8, lineHeight: 1.6 }}>{s}</li>)}
          </ul>
        </div>
      )}
    </Layout>
  );
}
