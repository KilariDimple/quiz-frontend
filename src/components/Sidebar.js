import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import styles from '@/styles/components.module.css';

const studentLinks = [
  { href: '/student/dashboard', label: 'Dashboard' },
  { href: '/student/results', label: 'Results' },
  { href: '/student/analytics', label: 'Analytics' },
  { href: '/student/leaderboard', label: 'Leaderboard' },
  { href: '/student/feedback', label: 'Feedback' },
];

const facultyLinks = [
  { href: '/faculty/dashboard', label: 'Dashboard' },
  { href: '/faculty/create-quiz', label: 'Create Quiz' },
  { href: '/faculty/my-quizzes', label: 'My Quizzes' },
  { href: '/faculty/results', label: 'Results' },
  { href: '/faculty/class-feedback', label: 'Class Feedback' },
  { href: '/faculty/monitor', label: 'Monitor' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { isStudent, isFaculty } = useAuth();
  const router = useRouter();
  const links = isStudent() ? studentLinks : isFaculty() ? facultyLinks : [];

  return (
    <>
      {isOpen && <div className={styles.sidebarOverlay} onClick={onClose} />}
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`} id="sidebar">
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarBrand}>EduQuiz</div>
          <div className={styles.sidebarBrandSub}>
            {isStudent() ? 'Student' : 'Faculty'} Portal
          </div>
        </div>
        <ul className={styles.navLinks}>
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`${styles.navLink} ${router.pathname === link.href ? styles.navLinkActive : ''}`}
                onClick={onClose}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}
