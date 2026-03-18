import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/components.module.css';

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className={styles.navbar} id="main-navbar">
      <div className={styles.navLeft}>
        <button className={styles.menuToggle} onClick={onMenuToggle} id="menu-toggle">
          &#9776;
        </button>
        <span className={styles.navLogo}>EduQuiz</span>
      </div>
      <div className={styles.navRight}>
        {user && (
          <>
            <span className={styles.userInfo}>
              <span className={styles.userName}>{user.username || user.facultyId}</span>
            </span>
            <button className={styles.logoutBtn} onClick={handleLogout} id="logout-btn">
              Sign out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
