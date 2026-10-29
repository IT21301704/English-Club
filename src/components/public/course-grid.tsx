'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Clock, Users, Star, ArrowRight, Search, X } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

export type CourseCard = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  level: string | null;
  duration: string | null;
  price: number;
  currency: string;
  isFeatured: boolean;
  enrollments: number;
};

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={cn(
        'relative px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors',
        active ? 'text-white' : 'text-gray-600 bg-gray-100 hover:bg-gray-200',
      )}>
      {active && (
        <motion.span layoutId="course-chip" className="absolute inset-0 rounded-full bg-brand-600"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
      )}
      <span className="relative">{children}</span>
    </button>
  );
}

export function CourseGrid({ courses }: { courses: CourseCard[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(courses.map(c => c.category).filter(Boolean) as string[]))],
    [courses],
  );
  const levels = useMemo(
    () => ['All', ...Array.from(new Set(courses.map(c => c.level).filter(Boolean) as string[]))],
    [courses],
  );

  const filtered = courses.filter(c => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || c.title.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
    return matchesQuery
      && (category === 'All' || c.category === category)
      && (level === 'All' || c.level === level);
  });

  const reset = () => { setQuery(''); setCategory('All'); setLevel('All'); };

  return (
    <>
      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search courses…"
              className="pl-9 pr-9" aria-label="Search courses" />
            {query && (
              <button onClick={() => setQuery('')} aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-gray-400 hover:text-gray-700">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {levels.length > 2 && (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by level">
              {levels.map(l => (
                <button key={l} onClick={() => setLevel(l)}
                  className={cn(
                    'px-3 py-1 rounded-md text-xs font-medium border transition-colors',
                    level === l ? 'border-brand-600 text-brand-700 bg-brand-50' : 'border-gray-200 text-gray-500 hover:border-gray-300',
                  )}>
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>
        {categories.length > 2 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            {categories.map(c => <Chip key={c} active={category === c} onClick={() => setCategory(c)}>{c}</Chip>)}
          </div>
        )}
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Showing {filtered.length} of {courses.length} courses
        </p>
      </div>

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((course, i) => (
            <motion.div key={course.id} layout
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0, transition: { delay: Math.min(i, 6) * 0.04 } }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
              whileHover={{ y: -4 }}
            >
              <Card className="group h-full overflow-hidden flex flex-col transition-shadow duration-300 hover:shadow-xl">
                <div className="h-44 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 flex items-center justify-center relative overflow-hidden">
                  <BookOpen className="h-16 w-16 text-white/50 transition-transform duration-500 group-hover:scale-125 group-hover:-rotate-6" />
                  {course.isFeatured && <Badge className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 border-0">⭐ Featured</Badge>}
                </div>
                <CardContent className="p-5 flex flex-col flex-1">
                  <div className="flex gap-2 mb-3">
                    {course.category && <Badge variant="brand">{course.category}</Badge>}
                    {course.level && <Badge variant="secondary">{course.level}</Badge>}
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-brand-700 transition-colors">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 flex-1 leading-relaxed">{course.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    {course.duration && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{course.duration}</span>}
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{course.enrollments}</span>
                    <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />4.8</span>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-2xl font-bold text-brand-700">{formatCurrency(course.price, course.currency)}</span>
                    <Link href={`/courses/${course.slug}`}>
                      <Button variant="brand" size="sm" className="gap-1">
                        Enroll <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-center py-16">
            <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">No courses match your filters.</p>
            <Button variant="outline" size="sm" onClick={reset}>Clear filters</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
