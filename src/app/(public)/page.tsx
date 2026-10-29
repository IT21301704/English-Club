import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Award, Star, ArrowRight, Play, CheckCircle, TrendingUp, Clock, GraduationCap } from 'lucide-react';
import { Reveal, Stagger, StaggerItem, HoverLift, CountUp } from '@/components/motion';
import { HeroVideo } from '@/components/public/hero-video';

const stats = [
  { label: 'Students Enrolled', value: 500, suffix: '+', icon: Users },
  { label: 'Courses Available', value: 20, suffix: '+', icon: BookOpen },
  { label: 'Years Experience', value: 10, suffix: '+', icon: Award },
  { label: 'Success Rate', value: 95, suffix: '%', icon: TrendingUp },
];

const features = [
  { title: 'Expert Instruction', desc: 'Learn from an experienced professional with proven academic and industry credentials.', icon: GraduationCap },
  { title: 'Flexible Learning', desc: 'Study at your own pace with recorded lectures, notes, and on-demand content access.', icon: Clock },
  { title: 'Track Your Progress', desc: 'Monitor your learning journey with detailed progress tracking and performance analytics.', icon: TrendingUp },
  { title: 'Certification', desc: 'Earn recognized certificates upon course completion to boost your career prospects.', icon: Award },
];

const featuredCourses = [
  { title: 'Advanced Mathematics', category: 'Mathematics', price: 'LKR 15,000', duration: '3 months', students: 120, rating: 4.9, level: 'Advanced' },
  { title: 'Science Foundations', category: 'Science', price: 'LKR 12,000', duration: '2 months', students: 85, rating: 4.8, level: 'Beginner' },
  { title: 'English Proficiency', category: 'Languages', price: 'LKR 10,000', duration: '2 months', students: 200, rating: 4.7, level: 'Intermediate' },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-indigo-500 text-white min-h-[85vh] flex items-center">
        <HeroVideo />
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-white blur-3xl animate-float" />
          <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-white blur-3xl animate-float-slow" />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="container-custom section-padding relative z-10 w-full pb-24 md:pb-28">
          <Stagger gap={0.12} className="max-w-3xl mx-auto text-center">
            <StaggerItem>
              <Badge className="mb-6 bg-white/20 text-white border-white/30 px-4 py-1.5">🎓 Professional Learning Platform</Badge>
            </StaggerItem>
            <StaggerItem>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
                Unlock Your
                <span className="block bg-gradient-to-r from-yellow-200 via-yellow-300 to-amber-300 bg-clip-text text-transparent bg-[length:200%_auto] animate-shine">Full Potential</span>
              </h1>
            </StaggerItem>
            <StaggerItem>
              <p className="text-lg md:text-xl text-brand-100 mb-8 leading-relaxed">
                Expert-led courses, personalized mentorship, and a proven track record of student success. Start your learning journey today.
              </p>
            </StaggerItem>
            <StaggerItem className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses">
                <Button size="lg" className="group bg-white text-brand-700 hover:bg-gray-100 font-semibold gap-2 w-full sm:w-auto">
                  Explore Courses <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 gap-2 w-full sm:w-auto">
                  <Play className="h-4 w-4" /> Learn About Me
                </Button>
              </Link>
            </StaggerItem>
          </Stagger>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-12 border-b">
        <div className="container-custom">
          <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(({ label, value, suffix, icon: Icon }) => (
              <StaggerItem key={label} className="group text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-100 mb-3 transition-all duration-300 group-hover:bg-brand-600 group-hover:scale-110">
                  <Icon className="h-6 w-6 text-brand-600 transition-colors group-hover:text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900"><CountUp value={value} suffix={suffix} /></div>
                <div className="text-sm text-gray-500 mt-1">{label}</div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <Reveal className="text-center mb-12">
            <Badge variant="brand" className="mb-4">Our Courses</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Training Programmes</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Carefully designed curricula to help you master skills and achieve your academic and professional goals.</p>
          </Reveal>
          <Stagger gap={0.12} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <StaggerItem key={course.title}>
              <HoverLift>
              <Card className="group h-full overflow-hidden transition-shadow duration-300 hover:shadow-xl">
                <div className="h-40 bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center overflow-hidden">
                  <BookOpen className="h-16 w-16 text-white/60 transition-transform duration-500 group-hover:scale-125 group-hover:-rotate-6" />
                </div>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="brand">{course.category}</Badge>
                    <Badge variant="secondary">{course.level}</Badge>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{course.title}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.duration}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.students} students</span>
                    <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{course.rating}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-brand-700">{course.price}</span>
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
          <div className="text-center mt-10">
            <Link href="/courses"><Button variant="outline" size="lg" className="gap-2">View All Courses <ArrowRight className="h-4 w-4" /></Button></Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <Reveal className="text-center mb-12">
            <Badge variant="brand" className="mb-4">Why English Club?</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need to Succeed</h2>
          </Reveal>
          <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ title, desc, icon: Icon }) => (
              <StaggerItem key={title}>
                <HoverLift className="group text-center p-6 rounded-xl border bg-white hover:border-brand-300 hover:shadow-lg transition-[border-color,box-shadow]">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-100 mb-4 transition-all duration-300 group-hover:bg-brand-600 group-hover:rotate-6">
                    <Icon className="h-7 w-7 text-brand-600 transition-colors group-hover:text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                </HoverLift>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding gradient-brand">
        <Reveal className="container-custom text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-brand-100 text-lg mb-8 max-w-xl mx-auto">Join hundreds of students who have transformed their careers with English Club.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register"><Button size="lg" className="bg-white text-brand-700 hover:bg-gray-100 font-semibold">Create Free Account</Button></Link>
            <Link href="/contact"><Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">Contact Us</Button></Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
