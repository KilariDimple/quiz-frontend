import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/utils/api';

export default function CreateQuiz() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [content, setContent] = useState('');
  const [config, setConfig] = useState({ numQuestions: 10, timer: 0, resultMode: 'instant' });
  const [questions, setQuestions] = useState([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdQuiz, setCreatedQuiz] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/faculty/login');
  }, [authLoading, isAuthenticated, router]);

  const handleUpload = async () => {
    if (!file) return setError('Please select a file');
    setLoading(true); setError('');
    const formData = new FormData();
    formData.append('document', file);
    try {
      const res = await api.post('/quizzes/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setContent(res.data.content);
      setQuizTitle(file.name.replace(/\.[^/.]+$/, ''));
      setStep(2);
    } catch (err) { setError(err.response?.data?.message || 'Upload failed'); }
    finally { setLoading(false); }
  };

  const handleGenerate = async () => {
    setLoading(true); setError('');
    try {
      const res = await api.post('/quizzes/generate-questions', { content, numQuestions: config.numQuestions, title: quizTitle });
      setQuestions(res.data.questions);
      setStep(3);
    } catch (err) { setError(err.response?.data?.message || 'Error generating questions'); }
    finally { setLoading(false); }
  };

  const handlePublish = async () => {
    if (!quizTitle.trim()) return setError('Enter a quiz title');
    setLoading(true); setError('');
    try {
      const res = await api.post('/quizzes/create', {
        title: quizTitle, questions, timer: parseInt(config.timer) || 0,
        resultMode: config.resultMode, sourceFileName: file?.name || '',
      });
      setCreatedQuiz(res.data.quiz);
      setStep(4);
    } catch (err) { setError(err.response?.data?.message || 'Failed to create quiz'); }
    finally { setLoading(false); }
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions]; updated[index] = { ...updated[index], [field]: value }; setQuestions(updated);
  };

  const updateOption = (qi, oi, value) => {
    const updated = [...questions]; updated[qi].options[oi] = value; setQuestions(updated);
  };

  const removeQuestion = (index) => setQuestions(questions.filter((_, i) => i !== index));

  const steps = ['Upload', 'Configure', 'Review', 'Done'];

  return (
    <Layout>
      <div className="page-header">
        <h1>Create Quiz</h1>
        <p>Upload a document and let AI generate questions</p>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: step > i + 1 ? 'var(--gray-900)' : step === i + 1 ? 'var(--gray-900)' : 'var(--gray-200)',
              color: step >= i + 1 ? 'var(--white)' : 'var(--text-muted)',
              fontSize: 12, fontWeight: 600,
            }}>{i + 1}</div>
            <span className="text-xs" style={{ marginLeft: 6, color: step >= i + 1 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: step === i + 1 ? 600 : 400 }}>{s}</span>
            {i < steps.length - 1 && <div style={{ width: 40, height: 1, background: step > i + 1 ? 'var(--gray-900)' : 'var(--gray-200)', margin: '0 12px' }} />}
          </div>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Upload Document</h3>
          <div style={{
            border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: 48,
            textAlign: 'center', marginBottom: 20, background: 'var(--gray-50)',
          }}>
            <input type="file" accept=".pdf,.ppt,.pptx" onChange={(e) => setFile(e.target.files[0])} id="file-upload"
              style={{ display: 'block', margin: '0 auto' }} />
            <p className="text-xs text-muted" style={{ marginTop: 12 }}>PDF or PPT, max 50MB</p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={handleUpload} disabled={loading || !file} style={{ width: '100%' }}>
            {loading ? 'Processing...' : 'Upload and Extract'}
          </button>
        </div>
      )}

      {/* Step 2: Configure */}
      {step === 2 && (
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Configure Quiz</h3>
          <div className="form-group">
            <label>Number of Questions</label>
            <input type="number" className="form-input" min="1" max="50" value={config.numQuestions}
              onChange={(e) => setConfig({ ...config, numQuestions: parseInt(e.target.value) || 10 })} />
          </div>
          <div className="form-group">
            <label>Timer (minutes, 0 = unlimited)</label>
            <select className="form-input" value={config.timer} onChange={(e) => setConfig({ ...config, timer: e.target.value })}>
              <option value="0">Unlimited Time</option>
              <option value="5">5 minutes</option><option value="10">10 minutes</option>
              <option value="15">15 minutes</option><option value="20">20 minutes</option>
              <option value="30">30 minutes</option><option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>
          <div className="form-group">
            <label>Result Visibility</label>
            <select className="form-input" value={config.resultMode} onChange={(e) => setConfig({ ...config, resultMode: e.target.value })}>
              <option value="instant">Show results instantly</option>
              <option value="hidden">Hidden until released</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn" onClick={() => setStep(1)}>Back</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleGenerate} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Questions'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div>
          <div className="card mb-6">
            <div className="form-group">
              <label>Quiz Title</label>
              <input type="text" className="form-input" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} placeholder="Enter a title for this quiz" />
            </div>
            <p className="text-sm text-secondary">{questions.length} questions generated. Review and edit below.</p>
          </div>

          {questions.map((q, qi) => (
            <div className="card mb-4" key={qi}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <span className="text-xs text-muted font-medium">Question {qi + 1}</span>
                <button className="btn btn-sm btn-danger" onClick={() => removeQuestion(qi)}>Remove</button>
              </div>
              <textarea className="form-input" value={q.question} onChange={(e) => updateQuestion(qi, 'question', e.target.value)}
                rows={2} style={{ marginBottom: 14 }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {q.options.map((opt, oi) => (
                  <div key={oi} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="radio" name={`q${qi}`} checked={q.correctAnswer === oi}
                      onChange={() => updateQuestion(qi, 'correctAnswer', oi)} />
                    <input type="text" className="form-input" value={opt} onChange={(e) => updateOption(qi, oi, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <button className="btn" onClick={() => setStep(2)}>Back</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handlePublish} disabled={loading || questions.length === 0}>
              {loading ? 'Publishing...' : 'Publish Quiz'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Done */}
      {step === 4 && createdQuiz && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <h2 style={{ marginBottom: 8 }}>Quiz Created</h2>
          <p className="text-secondary text-sm" style={{ marginBottom: 24 }}>{createdQuiz.title}</p>
          <div style={{
            display: 'inline-block', padding: '16px 32px', background: 'var(--gray-50)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', marginBottom: 24,
          }}>
            <p className="text-xs text-muted" style={{ marginBottom: 4 }}>Quiz Code</p>
            <span className="font-mono" style={{ fontSize: 32, fontWeight: 700, letterSpacing: 6 }}>{createdQuiz.quizCode}</span>
          </div>
          <p className="text-sm text-secondary" style={{ marginBottom: 24 }}>
            Share this code with your students. They can enter it on their dashboard to start the quiz.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn" onClick={() => { navigator.clipboard.writeText(createdQuiz.quizCode); }}>Copy Code</button>
            <button className="btn btn-primary" onClick={() => router.push('/faculty/my-quizzes')}>View Quizzes</button>
          </div>
        </div>
      )}
    </Layout>
  );
}
