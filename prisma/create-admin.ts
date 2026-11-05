import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Creates an admin account, or promotes an existing account to admin.
// Usage (PowerShell):
//   $env:ADMIN_EMAIL="you@example.com"; $env:ADMIN_PASSWORD="a-strong-password"; $env:ADMIN_NAME="Your Name"
//   npm run admin:create
// ADMIN_PASSWORD is optional when the account already exists (its password is kept).

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || 'Administrator';

  if (!email) throw new Error('Set ADMIN_EMAIL.');

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: {
        role: Role.ADMIN,
        isActive: true,
        ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}),
      },
    });
    console.log(`✅ ${email} is now an admin${password ? ' (password updated)' : ''}.`);
    return;
  }

  if (!password || password.length < 8) {
    throw new Error('Set ADMIN_PASSWORD (at least 8 characters) to create a new admin.');
  }

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log(`✅ Admin account created: ${email}`);
}

main()
  .catch((e) => {
    console.error('❌', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
