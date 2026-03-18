import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#595959', font: { family: 'Inter', size: 11 }, usePointStyle: true, pointStyle: 'circle' } },
    tooltip: {
      backgroundColor: '#1a1a2e',
      titleFont: { family: 'Inter', size: 12 },
      bodyFont: { family: 'Inter', size: 11 },
      cornerRadius: 8,
      padding: 10,
    },
  },
  scales: {
    x: { grid: { color: '#f0f0f0', drawBorder: false }, ticks: { color: '#8c8c8c', font: { family: 'Inter', size: 11 } } },
    y: { grid: { color: '#f0f0f0', drawBorder: false }, ticks: { color: '#8c8c8c', font: { family: 'Inter', size: 11 } } },
  },
};

export function PerformanceChart({ labels, scores, percentages }) {
  const data = {
    labels,
    datasets: [
      {
        type: 'bar', label: 'Score', data: scores,
        backgroundColor: '#ffa11633', borderColor: '#ffa116', borderWidth: 1.5,
        borderRadius: 6, barThickness: 28,
      },
      {
        type: 'line', label: 'Percentage', data: percentages,
        borderColor: '#2cbb5d', backgroundColor: '#2cbb5d',
        borderWidth: 2, pointRadius: 4, pointBackgroundColor: '#2cbb5d', tension: 0.35,
      },
    ],
  };
  return <div style={{ height: 280 }}><Bar data={data} options={baseOptions} /></div>;
}

export function DifficultyChart({ labels, correctPercentages, wrongPercentages }) {
  const data = {
    labels,
    datasets: [
      { label: 'Correct', data: correctPercentages, backgroundColor: '#2cbb5d88', borderColor: '#2cbb5d', borderWidth: 1, borderRadius: 4, barThickness: 18 },
      { label: 'Wrong', data: wrongPercentages, backgroundColor: '#ef474388', borderColor: '#ef4743', borderWidth: 1, borderRadius: 4, barThickness: 18 },
    ],
  };
  const options = { ...baseOptions, indexAxis: 'y', scales: { ...baseOptions.scales, x: { ...baseOptions.scales.x, max: 100 } } };
  return <div style={{ height: Math.max(200, labels.length * 40) }}><Bar data={data} options={options} /></div>;
}

export function ScoreDonut({ score, total }) {
  const pct = Math.round((score / total) * 100);
  const color = pct >= 70 ? '#2cbb5d' : pct >= 40 ? '#ffa116' : '#ef4743';
  const data = {
    labels: ['Correct', 'Incorrect'],
    datasets: [{ data: [score, total - score], backgroundColor: [color, '#f0f0f0'], borderWidth: 0, cutout: '74%' }],
  };
  return (
    <div style={{ position: 'relative', width: 130, height: 130 }}>
      <Doughnut data={data} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } } }} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 26, fontWeight: 700, color }}>{pct}%</span>
      </div>
    </div>
  );
}
