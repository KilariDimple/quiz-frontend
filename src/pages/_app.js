import '@/styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Head>
        <title>EduQuiz - AI Powered Quiz Platform</title>
        <meta name="description" content="AI Powered Quiz Application with intelligent question generation, performance analytics, and personalized feedback." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎓</text></svg>" />
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
