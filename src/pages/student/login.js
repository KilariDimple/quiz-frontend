import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import styles from '@/styles/auth.module.css';

export default function StudentLogin() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/students/login', { identifier, password });
      login(res.data.user, res.data.token);
      router.push('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <div className={styles.authLogo}>EduQuiz</div>
            <h1>Student Login</h1>
            <p>Sign in to your account</p>
          </div>
          {error && <div className={styles.errorMsg}>{error}</div>}
          <form className={styles.authForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>Username or Email</label>
              <input type="text" className={styles.formInput} placeholder="Enter username or email" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required id="login-identifier" />
            </div>
            <div className={styles.formGroup}>
              <label>Password</label>
              <input type="password" className={styles.formInput} placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required id="login-password" />
            </div>
            <button type="submit" className={styles.authSubmitBtn} disabled={loading} id="login-submit">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <div className={styles.authFooter}>
            No account? <Link href="/student/register">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
