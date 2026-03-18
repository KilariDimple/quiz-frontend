import { useRouter } from 'next/router';
import styles from '@/styles/auth.module.css';

export default function Home() {
  const router = useRouter();

  return (
    <div className={styles.authPage}>
      <div style={{ textAlign: 'center', maxWidth: 500 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px',
          background: 'var(--accent-light)', borderRadius: 100, fontSize: '0.75rem',
          fontWeight: 600, color: 'var(--accent-dark)', marginBottom: 24,
        }}>
          Powered by Gemini AI
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 10, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          AI-Powered Quiz Platform
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 36, lineHeight: 1.7 }}>
          Generate quizzes from your documents using AI.
          Track student performance and get personalized feedback.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-primary btn-lg" onClick={() => router.push('/student/login')} id="student-login-btn"
            style={{ padding: '12px 28px' }}>
            Student Login
          </button>
          <button className="btn btn-accent btn-lg" onClick={() => router.push('/faculty/login')} id="faculty-login-btn"
            style={{ padding: '12px 28px' }}>
            Faculty Login
          </button>
        </div>
        <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center', gap: 32 }}>
          {[
            { label: 'AI Questions', color: 'var(--blue)' },
            { label: 'Auto Grading', color: 'var(--green)' },
            { label: 'Analytics', color: 'var(--accent)' },
            { label: 'Anti-Cheat', color: 'var(--purple)' },
          ].map((f, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%', background: f.color,
                margin: '0 auto 6px',
              }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
