import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { DifficultyChart } from '@/components/Charts';
import api from '@/utils/api';

export default function FacultyResults() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [results, setResults] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/faculty/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/quizzes/my-quizzes').then((r) => { setQuizzes(r.data); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [isAuthenticated]);

  const loadResults = async (quizId) => {
    setSelectedQuiz(quizId);
    if (!quizId) { setResults(null); setAnalysis(null); return; }
    try {
      const [resData, analysisData] = await Promise.all([
        api.get(`/results/quiz/${quizId}`).then((r) => r.data),
        api.get(`/results/question-analysis/${quizId}`).then((r) => r.data).catch(() => null),
      ]);
      setResults(resData); setAnalysis(analysisData);
    } catch { setResults([]); }
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <h1>Results</h1>
        <p>View and analyze student performance</p>
      </div>

      <div className="card mb-6">
        <div className="form-group" style={{ margin: 0 }}>
          <label>Select Quiz</label>
          <select className="form-input" value={selectedQuiz} onChange={(e) => loadResults(e.target.value)} style={{ maxWidth: 360 }}>
            <option value="">Choose a quiz...</option>
            {(Array.isArray(quizzes) ? quizzes : []).map((q) => <option key={q.id} value={q.id}>{q.title} ({q.quizCode})</option>)}
          </select>
        </div>
      </div>

      {results && (
        <>
          <div className="card mb-6" style={{ overflow: 'auto' }}>
            <h3 style={{ marginBottom: 16 }}>Student Scores</h3>
            {results.length === 0 ? <p className="text-secondary text-sm">No submissions yet.</p> : (
              <table className="data-table">
                <thead><tr><th>Student</th><th>Score</th><th>Percentage</th><th>Submitted</th></tr></thead>
                <tbody>
                  {(Array.isArray(results) ? results : []).map((r) => (
                    <tr key={r._id}>
                      <td className="font-medium">{r.username}</td>
                      <td>{r.score}/{r.totalQuestions}</td>
                      <td><span className={`badge ${r.percentage >= 70 ? 'badge-success' : r.percentage >= 40 ? 'badge-warning' : 'badge-danger'}`}>{r.percentage}%</span></td>
                      <td className="text-muted">{new Date(r.submittedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {analysis && analysis.length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom: 20 }}>Question Difficulty</h3>
              <DifficultyChart
                labels={(Array.isArray(analysis) ? analysis : []).map((a, i) => `Q${i + 1}`)}
                correctPercentages={(Array.isArray(analysis) ? analysis : []).map((a) => a.correctPercentage)}
                wrongPercentages={(Array.isArray(analysis) ? analysis : []).map((a) => a.wrongPercentage)}
              />
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
