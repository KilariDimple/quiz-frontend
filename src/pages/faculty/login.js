import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import styles from '@/styles/auth.module.css';

export default function FacultyLogin() {
  const [facultyId, setFacultyId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await api.post('/faculty/login', { facultyId, password });
      login(res.data.user, res.data.token);
      router.push('/faculty/dashboard');
    } catch (err) { setError(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <div className={styles.authLogo}>EduQuiz</div>
            <h1>Faculty Login</h1>
            <p>Sign in to your faculty account</p>
          </div>
          {error && <div className={styles.errorMsg}>{error}</div>}
          <form className={styles.authForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}><label>Faculty ID</label><input type="text" className={styles.formInput} placeholder="Enter faculty ID" value={facultyId} onChange={(e) => setFacultyId(e.target.value)} required /></div>
            <div className={styles.formGroup}><label>Password</label><input type="password" className={styles.formInput} placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            <button type="submit" className={styles.authSubmitBtn} disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
          </form>
          <div className={styles.authFooter}>No account? <Link href="/faculty/register">Create one</Link></div>
        </div>
      </div>
    </div>
  );
}
