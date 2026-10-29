import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Production: set SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD and SEED_DEMO_DATA=false.
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@edupro.lk';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@1234';
  const demoData = process.env.SEED_DEMO_DATA !== 'false';
  if (!demoData && adminPassword === 'Admin@1234') {
    throw new Error('Refusing to create a production admin with the default password — set SEED_ADMIN_PASSWORD.');
  }

  // Create Admin
  const adminPass = await bcrypt.hash(adminPassword, 12);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Admin User',
      email: adminEmail,
      passwordHash: adminPass,
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log('✅ Admin created:', admin.email);

  if (!demoData) {
    console.log('\n🎉 Seeding complete (admin only — no demo data).');
    return;
  }

  // Create Demo Student
  const studentPass = await bcrypt.hash('Student@1234', 12);
  const student = await prisma.user.upsert({
    where: { email: 'student@edupro.lk' },
    update: {},
    create: {
      name: 'Priya Perera',
      email: 'student@edupro.lk',
      passwordHash: studentPass,
      role: Role.STUDENT,
      isActive: true,
      phone: '+94701234567',
    },
  });
  console.log('✅ Student created:', student.email);

  // Create Courses
  const mathCourse = await prisma.course.upsert({
    where: { slug: 'advanced-mathematics' },
    update: {},
    create: {
      title: 'Advanced Mathematics',
      slug: 'advanced-mathematics',
      description: 'Master calculus, algebra, and statistics for A/L exams and university entrance. Comprehensive 3-month programme with weekly assessments.',
      category: 'Mathematics',
      level: 'Advanced',
      duration: '3 months',
      price: 15000,
      currency: 'LKR',
      isPublished: true,
      isFeatured: true,
      syllabus: 'Week 1-2: Algebra Review\nWeek 3-4: Functions & Graphs\nWeek 5-6: Calculus Fundamentals\nWeek 7-8: Integration\nWeek 9-10: Statistics\nWeek 11-12: Past Paper Practice',
    },
  });

  const englishCourse = await prisma.course.upsert({
    where: { slug: 'english-proficiency' },
    update: {},
    create: {
      title: 'English Proficiency',
      slug: 'english-proficiency',
      description: 'Improve reading, writing, grammar and spoken English. Perfect for O/L, A/L and professional development.',
      category: 'Languages',
      level: 'Intermediate',
      duration: '2 months',
      price: 10000,
      currency: 'LKR',
      isPublished: true,
      isFeatured: false,
    },
  });

  const scienceCourse = await prisma.course.upsert({
    where: { slug: 'science-foundations' },
    update: {},
    create: {
      title: 'Science Foundations',
      slug: 'science-foundations',
      description: 'Build a strong base in Physics, Chemistry, and Biology. Perfect for O/L students.',
      category: 'Science',
      level: 'Beginner',
      duration: '2 months',
      price: 12000,
      currency: 'LKR',
      isPublished: true,
      isFeatured: false,
    },
  });

  console.log('✅ Courses created');

  // Create Modules & Lessons for Math Course (only once — the seed is safe to re-run)
  const existingModule = await prisma.module.findFirst({ where: { courseId: mathCourse.id } });
  if (!existingModule) {
    const mathModule1 = await prisma.module.create({
      data: { courseId: mathCourse.id, title: 'Algebra Fundamentals', order: 1 },
    });

    await prisma.lesson.createMany({
      data: [
        { moduleId: mathModule1.id, title: 'Introduction to Algebra', type: 'VIDEO', order: 1, duration: 45,
          contentUrl: 'https://www.youtube.com/watch?v=NybHckSEQBI', description: 'Variables, expressions and the basic rules of algebra.' },
        { moduleId: mathModule1.id, title: 'Algebra Notes — Chapter 1', type: 'PDF', order: 2 },
      ],
    });

    const quizLesson = await prisma.lesson.create({
      data: { moduleId: mathModule1.id, title: 'Algebra Quiz 1', type: 'QUIZ', order: 3 },
    });
    await prisma.quiz.create({
      data: {
        lessonId: quizLesson.id,
        title: 'Algebra Quiz 1',
        passMark: 60,
        questions: {
          create: [
            { order: 1, question: 'Solve for x: 2x + 6 = 14', options: ['x = 3', 'x = 4', 'x = 5', 'x = 10'], correctIndex: 1, explanation: '2x = 8, so x = 4.' },
            { order: 2, question: 'Simplify: 3(a + 2) − a', options: ['2a + 6', '3a + 2', '2a + 2', '4a + 6'], correctIndex: 0, explanation: '3a + 6 − a = 2a + 6.' },
            { order: 3, question: 'What is the value of x² when x = −3?', options: ['−9', '6', '9', '−6'], correctIndex: 2 },
          ],
        },
      },
    });

    const assignmentLesson = await prisma.lesson.create({
      data: { moduleId: mathModule1.id, title: 'Practice Set 1', type: 'ASSIGNMENT', order: 4 },
    });
    const due = new Date();
    due.setDate(due.getDate() + 14);
    await prisma.assignment.create({
      data: {
        lessonId: assignmentLesson.id,
        title: 'Practice Set 1 — Linear Equations',
        description: 'Solve the 10 linear equations from Chapter 1 (page 12). Show your working and upload a photo or PDF of your answers.',
        dueDate: due,
        maxMarks: 50,
      },
    });
  }

  // Create Training Packages
  if ((await prisma.trainingPackage.count()) === 0) await prisma.trainingPackage.createMany({
    data: [
      {
        name: 'Starter Pack',
        description: 'Perfect for beginners exploring a single subject.',
        features: ['1 Course Access', '2 Live Sessions / month', 'Study Notes (PDF)', 'Email Support', 'Progress Tracking'],
        price: 5000,
        currency: 'LKR',
        duration: '1 month',
        isPopular: false,
        isActive: true,
        order: 1,
      },
      {
        name: 'Standard Pack',
        description: 'Our most popular option for dedicated learners.',
        features: ['3 Course Access', '8 Live Sessions / month', 'Study Notes + Recordings', 'Quizzes & Assignments', 'Priority Support', 'Progress Analytics'],
        price: 12000,
        currency: 'LKR',
        duration: '3 months',
        isPopular: true,
        isActive: true,
        order: 2,
      },
      {
        name: 'Premium Pack',
        description: 'Comprehensive training for serious students.',
        features: ['Unlimited Course Access', 'Unlimited Live Sessions', 'All Study Materials', 'Personalized Mentorship', '1-on-1 Coaching', 'Certificate of Completion', 'Career Guidance'],
        price: 25000,
        currency: 'LKR',
        duration: '6 months',
        isPopular: false,
        isActive: true,
        order: 3,
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Training packages created');

  // Enroll student in math course
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: mathCourse.id } },
    update: {},
    create: { userId: student.id, courseId: mathCourse.id, status: 'ACTIVE' },
  });

  // Sample testimonial
  if ((await prisma.testimonial.count()) === 0) await prisma.testimonial.create({
    data: {
      userId: student.id,
      content: 'The course structure was incredible. I went from struggling with mathematics to scoring top marks in my A/L exams. The personalized attention made all the difference.',
      rating: 5,
      course: 'Advanced Mathematics',
      isApproved: true,
      isFeatured: true,
    },
  }).catch(() => {});

  // Create upcoming session
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  if ((await prisma.session.count()) === 0) await prisma.session.create({
    data: {
      courseId: mathCourse.id,
      title: 'Calculus — Limits & Derivatives',
      description: 'Live session covering limits, continuity, and introduction to derivatives.',
      scheduledAt: nextWeek,
      duration: 90,
      meetLink: 'https://meet.google.com/your-meeting-link',
    },
  }).catch(() => {});

  console.log('✅ Sessions and enrollment created');
  console.log('\n🎉 Seeding complete!');
  console.log('\n📋 Login Credentials:');
  console.log(`  Admin: ${adminEmail} / ${process.env.SEED_ADMIN_PASSWORD ? '(from SEED_ADMIN_PASSWORD)' : adminPassword}`);
  console.log('  Student: student@edupro.lk / Student@1234');
}

main()
  .catch(e => { console.error(e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
