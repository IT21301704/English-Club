import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handler, parseBody, requireAdmin, type RouteContext } from '@/lib/api';
import { quizSchema } from '@/lib/validators';

/** Creates or replaces the lesson's quiz. Questions are replaced wholesale; past attempts are kept. */
export const PUT = handler<RouteContext<{ id: string }>>(async (req, { params }) => {
  await requireAdmin();
  const { id: lessonId } = await params;
  const { questions, ...quizData } = await parseBody(req, quizSchema);

  const quiz = await db.$transaction(async tx => {
    const existing = await tx.quiz.findFirst({ where: { lessonId } });
    const quiz = existing
      ? await tx.quiz.update({ where: { id: existing.id }, data: quizData })
      : await tx.quiz.create({ data: { ...quizData, lessonId } });
    await tx.quizQuestion.deleteMany({ where: { quizId: quiz.id } });
    await tx.quizQuestion.createMany({
      data: questions.map((q, i) => ({ ...q, quizId: quiz.id, order: i + 1 })),
    });
    return quiz;
  });
  return NextResponse.json(quiz);
});
