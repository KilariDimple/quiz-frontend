import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import DashboardCard from '@/components/DashboardCard';
import api from '@/utils/api';

export default function Monitor() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [monitorData, setMonitorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/faculty/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/quizzes/my-quizzes').then((r) => { setQuizzes(r.data); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!selectedQuiz) return;
    const fetchData = () => {
      api.get(`/quizzes/monitor/${selectedQuiz}`).then((r) => setMonitorData(r.data)).catch(() => {});
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [selectedQuiz]);

  if (authLoading) return null;

  return (
    <Layout>
      <div className="page-header">
        <h1>Monitor</h1>
        <p>Real-time quiz monitoring</p>
      </div>

      <div className="card mb-6">
        <div className="form-group" style={{ margin: 0 }}>
          <label>Select Quiz</label>
          <select className="form-input" value={selectedQuiz} onChange={(e) => { setSelectedQuiz(e.target.value); setMonitorData(null); }} style={{ maxWidth: 360 }}>
            <option value="">Choose a quiz...</option>
            {quizzes.map((q) => <option key={q.id} value={q.id}>{q.title} ({q.quizCode})</option>)}
          </select>
        </div>
      </div>

      {monitorData && (
        <>
          <div className="card-grid">
            <DashboardCard title="Active Students" value={monitorData.activeStudents || 0} subtitle="Currently taking" />
            <DashboardCard title="Submitted" value={monitorData.submittedCount || 0} subtitle="Completed quiz" />
            <DashboardCard title="Questions" value={monitorData.totalQuestions || 0} subtitle="In this quiz" />
          </div>

          {monitorData.cheatingLogs && monitorData.cheatingLogs.length > 0 && (
            <div className="card mt-4">
              <h3 style={{ marginBottom: 16 }}>Cheating Alerts</h3>
              <table className="data-table">
                <thead><tr><th>Student</th><th>Warnings</th></tr></thead>
                <tbody>
                  {monitorData.cheatingLogs.map((log, i) => (
                    <tr key={i}>
                      <td className="font-medium">{log.username}</td>
                      <td><span className="badge badge-danger">{log.totalAttempts} warnings</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-muted mt-4">Auto-refreshes every 5 seconds</p>
        </>
      )}
    </Layout>
  );
}
