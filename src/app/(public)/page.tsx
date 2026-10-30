import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen, Users, Award, Star, ArrowRight, CheckCircle, TrendingUp, Clock, GraduationCap,
  MessageCircle, PenLine, Quote,
} from 'lucide-react';
import { Reveal, Stagger, StaggerItem, HoverLift, CountUp, ImageReveal, Parallax, Float } from '@/components/motion';
import { HeroVideo } from '@/components/public/hero-video';
import { BRAND_NAME, TEACHER_NAME } from '@/lib/brand';

const stats = [
  { label: 'Students Taught', value: 500, suffix: '+', icon: Users },
  { label: 'English Courses', value: 20, suffix: '+', icon: BookOpen },
  { label: 'Years Teaching', value: 10, suffix: '+', icon: Award },
  { label: 'Exam Pass Rate', value: 95, suffix: '%', icon: TrendingUp },
];

const programmes = [
  { title: 'Spoken English', desc: 'Fluency and confidence for conversations, interviews and presentations.', image: '/images/group-learning.jpg', icon: MessageCircle },
  { title: 'Grammar & Writing', desc: 'Clear grammar, rich vocabulary and well-structured essays.', image: '/images/writing.jpg', icon: PenLine },
  { title: 'English Literature', desc: 'Poetry, prose and drama through close reading and analysis.', image: '/images/open-books.jpg', icon: BookOpen },
  { title: 'O/L & A/L Exam Prep', desc: 'Past papers, model answers and exam technique for top grades.', image: '/images/teacher-classroom.jpg', icon: GraduationCap },
];

const teacherPoints = [
  'Small groups and one-to-one classes',
  'Lessons shaped around each student’s goals',
  'Recorded lessons, notes and practice papers',
  'Regular feedback and progress tracking',
];

const features = [
  { title: 'Expert Instruction', desc: 'Learn from an experienced English teacher with a proven record of student success.', icon: GraduationCap },
  { title: 'Flexible Learning', desc: 'Join live classes or catch up with recorded lessons and notes whenever suits you.', icon: Clock },
  { title: 'Track Your Progress', desc: 'See your growth lesson by lesson with quizzes, assignments and clear feedback.', icon: TrendingUp },
  { title: 'Certification', desc: 'Earn a certificate on completion to show schools and employers your English level.', icon: Award },
];

const featuredCourses = [
  { title: 'Spoken English Mastery', category: 'Speaking', image: '/images/conversation.jpg', price: 'LKR 10,000', duration: '2 months', students: 200, rating: 4.9, level: 'All levels' },
  { title: 'O/L English Language', category: 'Exam Prep', image: '/images/lecture.jpg', price: 'LKR 12,000', duration: '3 months', students: 120, rating: 4.8, level: 'Grade 10–11' },
  { title: 'A/L English Literature', category: 'Literature', image: '/images/apple-books.jpg', price: 'LKR 15,000', duration: '6 months', students: 85, rating: 4.9, level: 'Advanced' },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-950 text-white min-h-[88vh] flex items-center">
        <HeroVideo />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 right-0 w-96 h-96 rounded-full bg-gold-500/20 blur-3xl animate-float" />
          <div className="absolute bottom-0 -left-10 w-72 h-72 rounded-full bg-brand-400/20 blur-3xl animate-float-slow" />
        </div>
        <div className="container-custom section-padding relative z-10 w-full pb-32 md:pb-40">
          <Stagger gap={0.14} className="max-w-3xl mx-auto text-center">
            <StaggerItem>
              <span className="eyebrow mb-6 text-center text-gold-300 before:hidden after:hidden sm:before:block sm:after:block before:bg-gold-300 after:bg-gold-300">{BRAND_NAME}</span>
            </StaggerItem>
            <StaggerItem>
              <h1 className="text-[2.6rem] sm:text-5xl md:text-7xl leading-[1.05] mb-6">
                Speak English with
                <span className="block italic bg-gradient-to-r from-gold-200 via-gold-400 to-gold-200 bg-clip-text text-transparent bg-[length:200%_auto] animate-shine pb-2">
                  Confidence
                </span>
              </h1>
            </StaggerItem>
            <StaggerItem>
              <p className="text-lg md:text-xl text-brand-100/90 mb-10 leading-relaxed max-w-2xl mx-auto">
                Friendly, expert-led English classes for school students and adults: spoken English, grammar, literature and exam preparation.
              </p>
            </StaggerItem>
            <StaggerItem className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses">
                <Button size="lg" variant="gold" className="group gap-2 w-full sm:w-auto">
                  Explore Courses <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="bg-white/5 border-white/40 text-white hover:bg-white/15 hover:text-white backdrop-blur-sm w-full sm:w-auto">
                  Meet Your Teacher
                </Button>
              </Link>
            </StaggerItem>
          </Stagger>
        </div>
      </section>

      {/* Stats, overlapping the hero */}
      <section className="relative z-20 -mt-16 md:-mt-20">
        <div className="container-custom">
          <Reveal>
            <Stagger className="grid grid-cols-2 lg:grid-cols-4 rounded-2xl bg-white shadow-2xl shadow-brand-950/10 ring-1 ring-brand-950/5 divide-x divide-y lg:divide-y-0 divide-gold-100">
              {stats.map(({ label, value, suffix, icon: Icon }) => (
                <StaggerItem key={label} className="group text-center px-4 py-7 md:py-8">
                  <Icon className="h-6 w-6 mx-auto mb-2 text-gold-500 transition-transform duration-300 group-hover:scale-125 group-hover:-rotate-6" />
                  <div className="font-display text-4xl md:text-5xl font-semibold text-brand-950"><CountUp value={value} suffix={suffix} /></div>
                  <div className="text-xs md:text-sm uppercase tracking-wider text-gray-500 mt-1">{label}</div>
                </StaggerItem>
              ))}
            </Stagger>
          </Reveal>
        </div>
      </section>

      {/* Meet the teacher */}
      <section className="section-padding bg-white overflow-hidden">
        <div className="container-custom grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            {/* Her face sits right of centre in the photo, so the frame, inset photo and badge
                are arranged around the left and edges to keep it clear. */}
            <div className="absolute -top-5 -right-5 w-2/3 h-2/3 rounded-3xl border-2 border-gold-300" aria-hidden />
            <ImageReveal className="relative aspect-[4/5] rounded-3xl shadow-2xl">
              <Image src="/images/devika-perera.jpg" alt={`${TEACHER_NAME} — English Lecturer`} fill
                sizes="(min-width: 1024px) 40vw, 90vw" className="object-cover object-[66%_center]" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-brand-950/85 to-transparent" />
              <div className="absolute bottom-5 right-5 text-right text-white">
                <p className="font-display text-2xl md:text-3xl font-semibold leading-tight">{TEACHER_NAME}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-gold-300 mt-1">English Lecturer</p>
              </div>
            </ImageReveal>
            <ImageReveal from="bottom" delay={0.35}
              className="absolute -bottom-8 -left-4 md:-left-8 w-1/3 aspect-square rounded-2xl border-[6px] border-white shadow-xl">
              <Image src="/images/apple-books.jpg" alt="Books, an apple and alphabet blocks on a teacher's desk" fill
                sizes="20vw" className="object-cover" />
            </ImageReveal>
            <Float delay={0.8} className="absolute top-8 -left-2 md:-left-6">
              <div className="rounded-2xl bg-brand-950 text-white px-5 py-4 shadow-xl">
                <div className="font-display text-3xl font-semibold text-gold-400 leading-none">10+</div>
                <div className="text-xs uppercase tracking-wider text-brand-200 mt-1">Years teaching</div>
              </div>
            </Float>
          </div>

          <Reveal>
            <span className="eyebrow mb-4">Meet {TEACHER_NAME}</span>
            <h2 className="text-4xl md:text-5xl text-brand-950 leading-tight mb-6">
              English lessons that build <em className="text-gold-600">real confidence</em>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              Every class is warm, structured and practical. You’ll read, write, listen and speak more in each lesson, with patient guidance and clear explanations, so the progress shows in your exams and in everyday life.
            </p>
            <Stagger className="grid sm:grid-cols-2 gap-x-6 gap-y-3 mb-10">
              {teacherPoints.map(point => (
                <StaggerItem key={point} className="flex items-start gap-2.5 text-gray-700">
                  <CheckCircle className="h-5 w-5 text-gold-500 shrink-0 mt-0.5" />
                  <span className="text-sm">{point}</span>
                </StaggerItem>
              ))}
            </Stagger>
            <Link href="/about">
              <Button variant="brand" size="lg" className="group gap-2">
                More About Me <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Programmes */}
      <section className="section-padding bg-brand-50/60">
        <div className="container-custom">
          <Reveal className="text-center mb-14">
            <span className="eyebrow mb-4">What You’ll Learn</span>
            <h2 className="text-4xl md:text-5xl text-brand-950">Programmes for Every Learner</h2>
          </Reveal>
          <Stagger gap={0.1} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {programmes.map(({ title, desc, image, icon: Icon }) => (
              <StaggerItem key={title}>
                <Link href="/courses" className="group relative block aspect-[3/4] overflow-hidden rounded-2xl shadow-lg">
                  <Image src={image} alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/50 to-transparent transition-colors duration-500 group-hover:via-brand-900/70" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-gold-500 text-brand-950 transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-12">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-2xl font-semibold mb-1">{title}</h3>
                    {/* Description slides open on hover on desktop; always shown on touch screens. */}
                    <div className="grid grid-rows-[1fr] lg:grid-rows-[0fr] transition-[grid-template-rows] duration-500 lg:group-hover:grid-rows-[1fr]">
                      <p className="overflow-hidden text-sm text-brand-100">{desc}</p>
                    </div>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gold-300">
                      View courses <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <Reveal className="text-center mb-14">
            <span className="eyebrow mb-4">Our Courses</span>
            <h2 className="text-4xl md:text-5xl text-brand-950 mb-4">Featured English Courses</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Carefully designed courses to help you speak, write and succeed in English.</p>
          </Reveal>
          <Stagger gap={0.12} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <StaggerItem key={course.title}>
                <HoverLift>
                  <Card className="group h-full overflow-hidden border-brand-100 transition-shadow duration-300 hover:shadow-2xl hover:shadow-brand-950/10">
                    <div className="relative h-52 overflow-hidden">
                      <Image src={course.image} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 to-transparent" />
                      <Badge variant="gold" className="absolute top-4 left-4 shadow">{course.category}</Badge>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2 text-xs text-gray-500">
                        <span className="uppercase tracking-wider">{course.level}</span>
                        <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />{course.rating}</span>
                      </div>
                      <h3 className="font-display text-2xl font-semibold text-brand-950 mb-3">{course.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-5">
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{course.duration}</span>
                        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{course.students} students</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-brand-100 pt-4">
                        <span className="text-xl font-bold text-brand-800">{course.price}</span>
                        <Link href="/courses">
                          <Button size="sm" variant="brand">Enroll Now</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </HoverLift>
              </StaggerItem>
            ))}
          </Stagger>
          <div className="text-center mt-12">
            <Link href="/courses"><Button variant="outline" size="lg" className="gap-2 border-brand-200 text-brand-800 hover:bg-brand-50">View All Courses <ArrowRight className="h-4 w-4" /></Button></Link>
          </div>
        </div>
      </section>

      {/* Quote band */}
      <section className="relative isolate text-white">
        <Parallax className="absolute inset-0 -z-10" offset={80}>
          <Image src="/images/library.jpg" alt="" fill sizes="100vw" className="object-cover" />
        </Parallax>
        <div className="absolute inset-0 -z-10 bg-brand-950/80" />
        <Reveal className="container-custom py-24 md:py-32 text-center max-w-4xl">
          <Quote className="h-10 w-10 mx-auto mb-6 text-gold-400" />
          <blockquote className="font-display italic text-3xl md:text-5xl leading-snug">
            The limits of my language mean the limits of my world.
          </blockquote>
          <p className="mt-6 text-sm uppercase tracking-[0.25em] text-gold-300">Ludwig Wittgenstein</p>
        </Reveal>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <Reveal className="text-center mb-14">
            <span className="eyebrow mb-4">Why English Club?</span>
            <h2 className="text-4xl md:text-5xl text-brand-950">Everything You Need to Succeed</h2>
          </Reveal>
          <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ title, desc, icon: Icon }) => (
              <StaggerItem key={title}>
                <HoverLift className="group relative overflow-hidden text-center p-8 rounded-2xl border border-brand-100 bg-white hover:border-gold-300 hover:shadow-xl transition-[border-color,box-shadow]">
                  <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-gold-400 to-gold-600 transition-transform duration-500 group-hover:scale-x-100" />
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-50 mb-5 transition-all duration-500 group-hover:bg-brand-950 group-hover:rotate-[360deg]">
                    <Icon className="h-7 w-7 text-brand-700 transition-colors group-hover:text-gold-400" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-brand-950 mb-2">{title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                </HoverLift>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden gradient-brand">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gold-500/20 blur-3xl animate-float" aria-hidden />
        <div className="container-custom section-padding relative grid lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          <Reveal className="text-center lg:text-left text-white">
            <span className="eyebrow mb-4 text-gold-300 before:bg-gold-300 after:bg-gold-300">Start Today</span>
            <h2 className="text-4xl md:text-5xl mb-5">Ready to Love Learning English?</h2>
            <p className="text-brand-100 text-lg mb-8 max-w-xl mx-auto lg:mx-0">Join hundreds of students who have grown their English and their confidence with English Club.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/register"><Button size="lg" variant="gold" className="w-full sm:w-auto">Create Free Account</Button></Link>
              <Link href="/contact"><Button size="lg" variant="outline" className="bg-transparent border-white/50 text-white hover:bg-white/10 hover:text-white w-full sm:w-auto">Contact Us</Button></Link>
            </div>
          </Reveal>
          <ImageReveal className="hidden lg:block relative aspect-[4/3] rounded-3xl shadow-2xl ring-4 ring-gold-400/30">
            <Image src="/images/conversation.jpg" alt="Students practising English together" fill sizes="40vw" className="object-cover" />
          </ImageReveal>
        </div>
      </section>
    </div>
  );
}
