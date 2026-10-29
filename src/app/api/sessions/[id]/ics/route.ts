import { db } from '@/lib/db';
import { handler, requireUser, ApiError, type RouteContext } from '@/lib/api';
import { hasCourseAccess } from '@/lib/enrollment';

function icsDate(d: Date) {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escapeText(s: string) {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Calendar invite (.ics) for a session — works with Google Calendar, Outlook and Apple Calendar. */
export const GET = handler<RouteContext<{ id: string }>>(async (_req, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const session = await db.session.findUniqueOrThrow({ where: { id }, include: { course: { select: { title: true } } } });
  if (user.role !== 'ADMIN' && !(await hasCourseAccess(user.id, session.courseId))) throw new ApiError(403, 'Forbidden');

  const start = new Date(session.scheduledAt);
  const end = new Date(start.getTime() + session.duration * 60_000);
  const description = [session.description, session.meetLink && `Join: ${session.meetLink}`].filter(Boolean).join('\n');

  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//English Club//Sessions//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${session.id}@edupro-lms`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${escapeText(`${session.title} — ${session.course.title}`)}`,
    description && `DESCRIPTION:${escapeText(description)}`,
    session.meetLink && `URL:${session.meetLink}`,
    session.meetLink && `LOCATION:${escapeText(session.meetLink)}`,
    'BEGIN:VALARM', 'TRIGGER:-PT15M', 'ACTION:DISPLAY', 'DESCRIPTION:Session starts in 15 minutes', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');

  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="session-${session.id}.ics"`,
    },
  });
});
