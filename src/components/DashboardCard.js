import styles from '@/styles/components.module.css';

export default function DashboardCard({ title, value, subtitle, onClick }) {
  return (
    <div
      className={styles.dashCard}
      onClick={onClick}
      data-clickable={onClick ? 'true' : 'false'}
    >
      <div className={styles.dashCardTitle}>{title}</div>
      {value !== undefined && value !== null && (
        <div className={styles.dashCardValue}>{value}</div>
      )}
      {subtitle && <div className={styles.dashCardSub}>{subtitle}</div>}
      <div className={styles.dashCardAccent} />
    </div>
  );
}
