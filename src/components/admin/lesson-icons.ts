import { Video, FileText, HelpCircle, ClipboardList } from 'lucide-react';
import type { LessonType } from '@prisma/client';

export const lessonIcons: Record<LessonType, typeof Video> = {
  VIDEO: Video, PDF: FileText, QUIZ: HelpCircle, ASSIGNMENT: ClipboardList,
};

export const lessonTypeLabels: Record<LessonType, string> = {
  VIDEO: 'Video', PDF: 'Notes', QUIZ: 'Quiz', ASSIGNMENT: 'Assignment',
};
