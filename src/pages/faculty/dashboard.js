import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import DashboardCard from '@/components/DashboardCard';
import api from '@/utils/api';

export default function FacultyDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/faculty/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/quizzes/my-quizzes').then((r) => setQuizzes(r.data)).catch(() => {});
    }
  }, [isAuthenticated]);

  if (authLoading) return null;

  const totalStudents = quizzes.reduce((sum, q) => sum + (q.submittedCount || 0), 0);

  return (
    <Layout>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.name || user?.facultyId}</p>
      </div>

      <div className="card-grid">
        <DashboardCard title="Total Quizzes" value={quizzes.length} subtitle="Created" />
        <DashboardCard title="Total Submissions" value={totalStudents} subtitle="Across all quizzes" />
        <DashboardCard title="Create Quiz" subtitle="Upload a document and generate questions" onClick={() => router.push('/faculty/create-quiz')} />
        <DashboardCard title="My Quizzes" subtitle="Manage your quizzes" onClick={() => router.push('/faculty/my-quizzes')} />
        <DashboardCard title="View Results" subtitle="Analyze student performance" onClick={() => router.push('/faculty/results')} />
        <DashboardCard title="Monitor" subtitle="Real-time quiz monitoring" onClick={() => router.push('/faculty/monitor')} />
      </div>

      {quizzes.length > 0 && (
        <div className="card mt-4">
          <h3 style={{ marginBottom: 16 }}>Recent Quizzes</h3>
          <table className="data-table">
            <thead><tr><th>Title</th><th>Code</th><th>Questions</th><th>Submissions</th><th>Created</th></tr></thead>
            <tbody>
              {quizzes.slice(0, 5).map((q) => (
                <tr key={q.id}>
                  <td className="font-medium">{q.title}</td>
                  <td><code className="font-mono" style={{ fontSize: 13, fontWeight: 600, letterSpacing: 2 }}>{q.quizCode}</code></td>
                  <td>{q.questionCount}</td>
                  <td>{q.submittedCount || 0}</td>
                  <td className="text-muted">{new Date(q.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
