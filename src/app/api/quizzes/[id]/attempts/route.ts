import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { handler, parseBody, requireUser, ApiError, type RouteContext } from '@/lib/api';
import { hasCourseAccess, syncEnrollmentCompletion } from '@/lib/enrollment';

/** Grades a quiz server-side (correct answers never reach the client before submission). */
export const POST = handler<RouteContext<{ id: string }>>(async (req, { params }) => {
  const user = await requireUser();
  const { id: quizId } = await params;
  const { answers } = await parseBody(req, z.object({ answers: z.record(z.string(), z.number().int()) }));

  const quiz = await db.quiz.findUniqueOrThrow({
    where: { id: quizId },
    include: { questions: { orderBy: { order: 'asc' } }, lesson: { include: { module: { select: { courseId: true } } } } },
  });
  const courseId = quiz.lesson.module.courseId;
  if (!(await hasCourseAccess(user.id, courseId))) throw new ApiError(403, 'You are not enrolled in this course');

  const results = quiz.questions.map(q => ({
    questionId: q.id,
    selected: answers[q.id] ?? null,
    correctIndex: q.correctIndex,
    isCorrect: answers[q.id] === q.correctIndex,
    explanation: q.explanation,
  }));
  const score = results.filter(r => r.isCorrect).length;
  const maxScore = quiz.questions.length;
  const passed = maxScore > 0 && (score / maxScore) * 100 >= quiz.passMark;

  const attempt = await db.quizAttempt.create({
    data: { quizId, userId: user.id, score, maxScore, answersJson: answers },
  });

  // Passing a quiz completes its lesson.
  if (passed) {
    await db.progress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId: quiz.lessonId } },
      update: {},
      create: { userId: user.id, lessonId: quiz.lessonId },
    });
    await syncEnrollmentCompletion(user.id, courseId);
  }

  return NextResponse.json({ attemptId: attempt.id, score, maxScore, passed, passMark: quiz.passMark, results });
});
