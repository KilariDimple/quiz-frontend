import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/utils/api';
import styles from '@/styles/auth.module.css';

export default function StudentRegister() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await api.post('/students/register', form);
      login(res.data.user, res.data.token);
      router.push('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
            <h1>Create Account</h1>
            <p>Student registration</p>
          </div>
          {error && <div className={styles.errorMsg}>{error}</div>}
          <form className={styles.authForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}><label>Username</label><input type="text" name="username" className={styles.formInput} placeholder="Choose a username" value={form.username} onChange={handleChange} required /></div>
            <div className={styles.formGroup}><label>Email</label><input type="email" name="email" className={styles.formInput} placeholder="Enter your email" value={form.email} onChange={handleChange} required /></div>
            <div className={styles.formGroup}><label>Password</label><input type="password" name="password" className={styles.formInput} placeholder="Create password" value={form.password} onChange={handleChange} required /></div>
            <div className={styles.formGroup}><label>Confirm Password</label><input type="password" name="confirmPassword" className={styles.formInput} placeholder="Confirm password" value={form.confirmPassword} onChange={handleChange} required /></div>
            <button type="submit" className={styles.authSubmitBtn} disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
          <div className={styles.authFooter}>
            Already have an account? <Link href="/student/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
