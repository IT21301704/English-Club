import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Award, BookOpen, Users, Mail, Download } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ImageReveal, Stagger, StaggerItem } from '@/components/motion';
import { TEACHER_NAME } from '@/lib/brand';

const qualifications = [
  { title: 'Bachelor of Science in Mathematics', institution: 'University of Colombo', year: '2008' },
  { title: 'Master of Education', institution: 'University of Peradeniya', year: '2012' },
  { title: 'PhD in Educational Psychology', institution: 'University of Kelaniya', year: '2018' },
];

const achievements = [
  { label: 'Students Mentored', value: '500+' },
  { label: 'Years Teaching', value: '10+' },
  { label: 'Courses Created', value: '20+' },
  { label: 'Success Rate', value: '95%' },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="section-padding page-hero">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <Badge variant="brand" className="mb-4">About Me</Badge>
              <p className="font-display italic text-2xl text-gold-700 mb-2">{TEACHER_NAME}</p>
              <h1 className="text-5xl md:text-6xl text-brand-950 mb-6 leading-tight">
                Passionate About <span className="text-gradient">Education & Growth</span>
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                With over 10 years of experience in professional education and training, I have dedicated my career to helping students unlock their true potential. My teaching approach combines academic rigor with practical application.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                I believe every student has unique strengths, and my role is to create personalized learning experiences that bring out the best in each individual. From foundational concepts to advanced topics, I guide students with patience, clarity, and dedication.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link href="/contact"><Button variant="brand" size="lg" className="gap-2"><Mail className="h-4 w-4" />Get in Touch</Button></Link>
                <Button variant="outline" size="lg" className="gap-2"><Download className="h-4 w-4" />Download CV</Button>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="relative">
                <div className="absolute -bottom-4 -right-4 w-2/3 h-2/3 rounded-2xl border-2 border-gold-300" aria-hidden />
                {/* 4:3 matches the photo, so on desktop it shows uncropped; on phones it keeps her face in view. */}
                <ImageReveal className="relative aspect-[4/3] rounded-2xl shadow-xl">
                  <Image src="/images/devika-perera.jpg" alt={`${TEACHER_NAME} — English Lecturer`} fill
                    sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover object-[62%_30%]" priority />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-brand-950/85 to-transparent" />
                  <div className="absolute bottom-4 left-5 text-white">
                    <p className="font-display text-2xl font-semibold leading-tight">{TEACHER_NAME}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-gold-300 mt-1">English Lecturer</p>
                  </div>
                </ImageReveal>
              </div>
              <Stagger className="grid grid-cols-2 gap-4">
                {achievements.map(a => (
                  <StaggerItem key={a.label} className="bg-white rounded-xl p-4 text-center shadow-sm border border-brand-100 transition-all duration-300 hover:-translate-y-1 hover:border-gold-300 hover:shadow-md">
                    <div className="font-display text-4xl font-semibold text-brand-900">{a.value}</div>
                    <div className="text-sm text-gray-500 mt-1">{a.label}</div>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </div>
        </div>
      </section>

      {/* Qualifications */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-10">
            <Badge variant="brand" className="mb-3">Education</Badge>
            <h2 className="text-3xl text-brand-950">Academic Qualifications</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {qualifications.map((q, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="h-6 w-6 text-brand-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{q.title}</h3>
                    <p className="text-sm text-gray-500">{q.institution}</p>
                  </div>
                  <Badge variant="secondary">{q.year}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Teaching Philosophy */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="brand" className="mb-4">Philosophy</Badge>
            <h2 className="text-3xl text-brand-950 mb-6">My Teaching Philosophy</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Education is not just about transferring knowledge — it's about inspiring curiosity, building confidence, and nurturing a lifelong love of learning.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              {[
                { title: 'Student-Centered', desc: 'Every lesson is tailored to individual learning styles and goals.', icon: Users },
                { title: 'Results-Driven', desc: 'I measure success by real outcomes: exam results, skills, confidence.', icon: Award },
                { title: 'Continuous Growth', desc: 'I stay updated with the latest teaching methodologies and tools.', icon: BookOpen },
              ].map(({ title, desc, icon: Icon }) => (
                <div key={title} className="bg-white rounded-xl p-6 shadow-sm border text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-100 mb-3">
                    <Icon className="h-6 w-6 text-brand-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
