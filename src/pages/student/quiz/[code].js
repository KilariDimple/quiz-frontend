import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import { initAntiCheat, requestFullscreen } from '@/utils/antiCheat';
import { ScoreDonut } from '@/components/Charts';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function QuizPage() {
  const router = useRouter();
  const { code } = router.query;
  const { user, isAuthenticated } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState([]);
  const [cheatingCount, setCheatingCount] = useState(0);

  useEffect(() => {
    if (!code || !isAuthenticated) return;
    api.get(`/quizzes/by-code/${code}`).then((res) => {
      setQuiz(res.data); setAnswers(new Array(res.data.questions.length).fill(-1));
      if (res.data.timer > 0) setTimeLeft(res.data.timer * 60);
      setLoading(false); requestFullscreen();
    }).catch((err) => { setError(err.response?.data?.message || 'Failed to load quiz'); setLoading(false); });
  }, [code, isAuthenticated]);

  useEffect(() => {
    if (!quiz || submitted) return;
    const cleanup = initAntiCheat((type) => {
      setCheatingCount((prev) => prev + 1);
      const labels = { tab_switch: 'Tab switching detected', fullscreen_exit: 'Fullscreen exited', devtools_open: 'Developer tools detected', copy_attempt: 'Copy blocked' };
      setWarnings((prev) => [...prev, labels[type] || 'Suspicious activity']);
      api.post('/quizzes/log-cheating', { quizId: quiz.quizId, type }).catch(() => {});
      setTimeout(() => setWarnings((prev) => prev.slice(1)), 4000);
    });
    return cleanup;
  }, [quiz, submitted]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => { if (prev <= 1) { clearInterval(timer); handleSubmit(); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  const handleAnswer = (qi, oi) => { const a = [...answers]; a[qi] = oi; setAnswers(a); };

  const handleSubmit = useCallback(async () => {
    if (submitted) return; setSubmitted(true);
    try { const res = await api.post('/quizzes/submit', { quizId: quiz.quizId, answers }); setResult(res.data); }
    catch (err) { setError(err.response?.data?.message || 'Failed to submit'); setSubmitted(false); }
  }, [quiz, answers, submitted]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  if (loading) return <LoadingSpinner text="Loading quiz..." />;
  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-layer-2)' }}>
      <div className="card" style={{ maxWidth: 440, textAlign: 'center', padding: 40 }}>
        <h2 style={{ marginBottom: 8 }}>Error</h2>
        <p className="text-secondary text-sm" style={{ marginBottom: 24 }}>{error}</p>
        <button className="btn btn-primary" onClick={() => router.push('/student/dashboard')}>Back to Dashboard</button>
      </div>
    </div>
  );

  if (submitted && result) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-layer-2)', padding: 20 }}>
      <div className="card" style={{ maxWidth: 440, textAlign: 'center', padding: 40 }}>
        <h2 style={{ marginBottom: 8 }}>{result.showResult ? 'Quiz Completed' : 'Quiz Submitted'}</h2>
        {result.showResult ? (<>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0' }}><ScoreDonut score={result.score} total={result.totalQuestions} /></div>
          <p className="text-secondary text-sm" style={{ marginBottom: 24 }}>
            You scored <strong style={{ color: 'var(--text-primary)' }}>{result.score}</strong> out of <strong style={{ color: 'var(--text-primary)' }}>{result.totalQuestions}</strong>
          </p>
        </>) : (<p className="text-secondary text-sm" style={{ marginBottom: 24 }}>{result.message}</p>)}
        {cheatingCount > 0 && <p style={{ color: 'var(--warning)', fontSize: 13, marginBottom: 16 }}>{cheatingCount} warning{cheatingCount > 1 ? 's' : ''} recorded.</p>}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => router.push('/student/dashboard')}>Dashboard</button>
          <button className="btn" onClick={() => router.push('/student/results')}>View Results</button>
        </div>
      </div>
    </div>
  );

  if (!quiz) return null;
  const q = quiz.questions[currentQ];
  const answeredCount = answers.filter((a) => a !== -1).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-layer-2)', padding: 20 }}>
      {/* Warnings */}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {warnings.map((w, i) => <div key={i} className="alert alert-warning" style={{ margin: 0 }}>{w}</div>)}
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3>{quiz.title}</h3>
              <p className="text-sm text-secondary">Question {currentQ + 1} of {quiz.totalQuestions} &middot; {answeredCount} answered</p>
            </div>
            {timeLeft !== null && (
              <div className="font-mono font-semibold" style={{ fontSize: 20, color: timeLeft < 60 ? 'var(--red)' : 'var(--text-primary)' }}>
                {formatTime(timeLeft)}
              </div>
            )}
          </div>
          <div style={{ height: 3, background: 'var(--bg-layer-3)', borderRadius: 2, marginTop: 16 }}>
            <div style={{ height: '100%', width: `${((currentQ + 1) / quiz.totalQuestions) * 100}%`, background: 'var(--accent)', borderRadius: 2, transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {/* Question */}
        <div className="card" style={{ marginBottom: 16 }}>
          <p className="font-semibold" style={{ fontSize: '1rem', marginBottom: 20, lineHeight: 1.6 }}>{currentQ + 1}. {q.question}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {q.options.map((opt, oi) => (
              <button key={oi} onClick={() => handleAnswer(currentQ, oi)} id={`option-${oi}`}
                style={{
                  padding: '13px 16px', background: answers[currentQ] === oi ? 'var(--brand)' : 'var(--bg-layer-1)',
                  border: `1px solid ${answers[currentQ] === oi ? 'var(--brand)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)', color: answers[currentQ] === oi ? '#fff' : 'var(--text-primary)',
                  fontSize: '0.8125rem', cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif',
                  display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s ease',
                }}>
                <span style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: answers[currentQ] === oi ? '#fff' : 'var(--bg-layer-3)',
                  color: answers[currentQ] === oi ? 'var(--brand)' : 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12, flexShrink: 0,
                }}>{String.fromCharCode(65 + oi)}</span>
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
          <button className="btn" disabled={currentQ === 0} onClick={() => setCurrentQ(currentQ - 1)}>Previous</button>
          {currentQ < quiz.totalQuestions - 1 ? (
            <button className="btn btn-primary" onClick={() => setCurrentQ(currentQ + 1)}>Next</button>
          ) : (
            <button className="btn btn-primary" onClick={() => { if (confirm(`Submit? ${answeredCount}/${quiz.totalQuestions} answered.`)) handleSubmit(); }} id="submit-quiz-btn">Submit Quiz</button>
          )}
        </div>

        {/* Navigator */}
        <div className="card">
          <p className="text-xs text-muted" style={{ marginBottom: 10 }}>Jump to question</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {quiz.questions.map((_, i) => (
              <button key={i} onClick={() => setCurrentQ(i)} style={{
                width: 36, height: 36, borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 500,
                border: currentQ === i ? '2px solid var(--accent)' : '1px solid var(--border)',
                background: answers[i] !== -1 ? 'var(--green-bg)' : 'var(--bg-layer-1)',
                color: answers[i] !== -1 ? '#15803d' : 'var(--text-muted)',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}>{i + 1}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
