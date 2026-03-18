import { useRouter } from 'next/router';

// Redirect /student/enter-code to dashboard (code entry is on dashboard)
export default function EnterCode() {
  const router = useRouter();
  if (typeof window !== 'undefined') {
    router.replace('/student/dashboard');
  }
  return null;
}
