import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Award, BookOpen, Briefcase, Star, GraduationCap } from 'lucide-react';

const experience = [
  { role: 'Senior Lecturer', org: 'National Institute of Education', period: '2018 – Present', desc: 'Leading curriculum development and delivering lectures in Mathematics and Science at the national level.' },
  { role: 'Private Tutor & Trainer', org: 'English Club', period: '2014 – Present', desc: 'Providing personalized one-on-one and group tutoring for A/L and O/L students, as well as professional development courses.' },
  { role: 'Lecturer', org: 'University of Colombo', period: '2012 – 2018', desc: 'Taught undergraduate mathematics courses and supervised student research projects.' },
];

const certifications = [
  'Cambridge International Educator Certificate',
  'Google Certified Educator Level 2',
  'Teaching English as a Foreign Language (TEFL)',
  'Project Management Professional (PMP)',
];

export default function ProfilePage() {
  return (
    <div>
      <section className="section-padding bg-gradient-to-br from-brand-50 to-indigo-50">
        <div className="container-custom text-center">
          <Badge variant="brand" className="mb-4">Profile</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Academic &amp; Professional Profile</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">A decade of academic excellence and professional training experience.</p>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Experience */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Briefcase className="h-6 w-6 text-brand-600" />Professional Experience</h2>
              <div className="space-y-6">
                {experience.map((exp, i) => (
                  <div key={i} className="relative pl-8 pb-6 border-l-2 border-brand-200 last:border-l-0">
                    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-brand-600 border-2 border-white shadow" />
                    <div className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-bold text-gray-900">{exp.role}</h3>
                        <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0">{exp.period}</Badge>
                      </div>
                      <p className="text-brand-600 font-medium text-sm mb-2">{exp.org}</p>
                      <p className="text-gray-600 text-sm">{exp.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Certifications & Skills */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Award className="h-5 w-5 text-brand-600" />Certifications</h3>
                  <ul className="space-y-3">
                    {certifications.map(c => (
                      <li key={c} className="flex items-start gap-2 text-sm">
                        <Star className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{c}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><BookOpen className="h-5 w-5 text-brand-600" />Subjects Taught</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Mathematics', 'Physics', 'Chemistry', 'English', 'ICT', 'Statistics', 'Biology', 'Economics'].map(s => (
                      <Badge key={s} variant="brand">{s}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-brand-50 border-brand-200">
                <CardContent className="p-5 text-center">
                  <GraduationCap className="h-10 w-10 text-brand-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-brand-700">500+</div>
                  <p className="text-sm text-gray-600">Students Successfully Guided</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
