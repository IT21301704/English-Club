'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Circle, Loader2, XCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/file-upload';
import { apiFetch } from '@/lib/fetcher';
import { cn } from '@/lib/utils';

export function MarkCompleteButton({ lessonId, completed, nextHref }: { lessonId: string; completed: boolean; nextHref?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      await apiFetch('/api/progress', { body: { lessonId, completed: !completed } });
      if (!completed && nextHref) router.push(nextHref);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant={completed ? 'outline' : 'brand'} onClick={toggle} disabled={loading} className="gap-2">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : completed ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4" />}
      {completed ? 'Completed — mark as not done' : nextHref ? 'Mark complete & continue' : 'Mark complete'}
    </Button>
  );
}

type QuizQuestion = { id: string; question: string; options: string[] };
type QuizResult = {
  score: number; maxScore: number; passed: boolean; passMark: number;
  results: { questionId: string; selected: number | null; correctIndex: number; isCorrect: boolean; explanation: string | null }[];
};

export function QuizRunner({ quiz }: { quiz: { id: string; title: string; passMark: number; timeLimit: number | null; questions: QuizQuestion[] } }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const unanswered = quiz.questions.length - Object.keys(answers).length;

  async function submit() {
    if (unanswered > 0 && !confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
    setLoading(true);
    setError('');
    try {
      setResult(await apiFetch(`/api/quizzes/${quiz.id}/attempts`, { body: { answers } }));
      router.refresh();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const byId = new Map(result?.results.map(r => [r.questionId, r]));

  return (
    <div className="space-y-5">
      {result && (
        <div className={cn('rounded-lg p-4 border', result.passed ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200')}>
          <p className="font-semibold text-gray-900">
            {result.passed ? '🎉 Passed!' : 'Not passed yet'} — {result.score} / {result.maxScore} ({Math.round((result.score / Math.max(result.maxScore, 1)) * 100)}%)
          </p>
          <p className="text-sm text-gray-600">Pass mark: {result.passMark}%. {result.passed ? 'This lesson is now complete.' : 'Review the answers below and try again.'}</p>
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        {quiz.questions.length} questions · pass mark {quiz.passMark}%{quiz.timeLimit ? ` · suggested time ${quiz.timeLimit} min` : ''}
      </p>

      {quiz.questions.map((q, i) => {
        const r = byId.get(q.id);
        return (
          <div key={q.id} className="rounded-lg border p-4 space-y-3">
            <p className="font-medium text-gray-900"><span className="text-muted-foreground mr-2">{i + 1}.</span>{q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                const selected = answers[q.id] === oi;
                const state = r ? (oi === r.correctIndex ? 'correct' : selected ? 'wrong' : 'idle') : selected ? 'selected' : 'idle';
                return (
                  <label key={oi} className={cn(
                    'flex items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors',
                    !r && 'cursor-pointer hover:bg-gray-50',
                    state === 'selected' && 'border-brand-500 bg-brand-50',
                    state === 'correct' && 'border-emerald-500 bg-emerald-50',
                    state === 'wrong' && 'border-red-400 bg-red-50',
                  )}>
                    <input type="radio" name={q.id} checked={selected} disabled={!!r}
                      onChange={() => setAnswers(a => ({ ...a, [q.id]: oi }))} className="h-4 w-4 accent-brand-600" />
                    <span className="flex-1">{opt}</span>
                    {state === 'correct' && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                    {state === 'wrong' && <XCircle className="h-4 w-4 text-red-500" />}
                  </label>
                );
              })}
            </div>
            {r?.explanation && <p className="text-sm text-gray-600 bg-gray-50 rounded-md p-3">💡 {r.explanation}</p>}
          </div>
        );
      })}

      {error && <p className="text-sm text-destructive">{error}</p>}
      {result ? (
        <Button variant="outline" onClick={() => { setResult(null); setAnswers({}); }}>Try Again</Button>
      ) : (
        <Button variant="brand" onClick={submit} disabled={loading || Object.keys(answers).length === 0}>
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Submitting...</> : 'Submit Answers'}
        </Button>
      )}
    </div>
  );
}

export function SubmissionForm({ assignmentId, submission }: {
  assignmentId: string;
  submission: { fileUrl: string | null; textContent: string | null; status: string; grade: number | null; feedback: string | null } | null;
}) {
  const router = useRouter();
  const [fileUrl, setFileUrl] = useState(submission?.fileUrl ?? '');
  const [text, setText] = useState(submission?.textContent ?? '');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const graded = submission?.status === 'GRADED';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      await apiFetch(`/api/assignments/${assignmentId}/submission`, { body: { fileUrl: fileUrl || null, textContent: text || null } });
      setMsg({ ok: true, text: 'Submitted! Your trainer will grade it soon.' });
      router.refresh();
    } catch (err: any) {
      setMsg({ ok: false, text: err.message });
    } finally {
      setLoading(false);
    }
  }

  if (graded) {
    return (
      <div className="space-y-2">
        <Badge variant="success">Graded</Badge>
        <p className="text-sm">Your submission has been graded — see the result above.</p>
        {submission?.fileUrl && <a href={submission.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-brand-600 hover:underline">Your file ↗</a>}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {submission && <Badge variant="warning">Submitted — awaiting grading (you can still update it)</Badge>}
      <div className="space-y-1.5">
        <Label>Upload your work</Label>
        <FileUpload folder="submissions" value={fileUrl} onChange={setFileUrl} allowUrl={false} accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,image/*" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="answer">Or type your answer</Label>
        <Textarea id="answer" value={text} onChange={e => setText(e.target.value)} className="min-h-[140px]" />
      </div>
      {msg && <p className={`text-sm ${msg.ok ? 'text-emerald-600' : 'text-destructive'}`}>{msg.text}</p>}
      <Button type="submit" variant="brand" className="gap-2" disabled={loading || (!fileUrl && !text.trim())}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {submission ? 'Update Submission' : 'Submit Assignment'}
      </Button>
    </form>
  );
}
