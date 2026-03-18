import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import DashboardCard from '@/components/DashboardCard';
import api from '@/utils/api';

export default function StudentDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ totalQuizzes: 0, avgScore: 0 });
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [loadingCode, setLoadingCode] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/student/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/results/student').then((res) => {
        const results = res.data;
        setStats({
          totalQuizzes: results.length,
          avgScore: results.length > 0 ? Math.round(results.reduce((sum, r) => sum + (r.percentage || 0), 0) / results.length) : 0,
        });
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  const handleEnterCode = async () => {
    if (!codeInput || codeInput.length !== 6) { setCodeError('Enter a valid 6-digit code'); return; }
    setCodeError('');
    setLoadingCode(true);
    try {
      const res = await api.get(`/quizzes/by-code/${codeInput}`);
      if (res.data) router.push(`/student/quiz/${codeInput}`);
    } catch (err) {
      setCodeError(err.response?.data?.message || 'Invalid quiz code');
    } finally {
      setLoadingCode(false);
    }
  };

  if (authLoading) return null;

  return (
    <Layout>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.username}</p>
      </div>

      {/* Enter Code */}
      <div className="card mb-6" style={{ background: 'var(--bg-orange-tint)', borderColor: 'var(--accent)', borderWidth: 1 }}>
        <h4 style={{ marginBottom: 14 }}>Enter Quiz Code</h4>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <input
              type="text" className="form-input" placeholder="000000"
              value={codeInput}
              onChange={(e) => { setCodeInput(e.target.value.replace(/\D/g, '').slice(0, 6)); setCodeError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleEnterCode()}
              maxLength={6} id="quiz-code-input"
              style={{ fontSize: 18, letterSpacing: 8, textAlign: 'center', fontWeight: 600, fontFamily: "'SF Mono', 'Fira Code', monospace", background: '#fff' }}
            />
            {codeError && <p style={{ color: 'var(--red)', fontSize: 12, marginTop: 6 }}>{codeError}</p>}
          </div>
          <button className="btn btn-accent" onClick={handleEnterCode} disabled={loadingCode} id="start-quiz-btn">
            {loadingCode ? 'Joining...' : 'Start Quiz'}
          </button>
        </div>
      </div>

      <div className="card-grid">
        <DashboardCard title="Quizzes Taken" value={stats.totalQuizzes} subtitle="Total completed" />
        <DashboardCard title="Average Score" value={`${stats.avgScore}%`} subtitle="Across all quizzes" />
        <DashboardCard title="Results" subtitle="View all quiz results" onClick={() => router.push('/student/results')} />
        <DashboardCard title="Analytics" subtitle="Performance insights" onClick={() => router.push('/student/analytics')} />
        <DashboardCard title="Leaderboard" subtitle="See rankings" onClick={() => router.push('/student/leaderboard')} />
        <DashboardCard title="Feedback" subtitle="AI-generated reports" onClick={() => router.push('/student/feedback')} />
      </div>
    </Layout>
  );
}
