import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// Get email and new password from command line arguments
const email = process.argv[2];
const newPassword = process.argv[3];

async function resetUserPassword() {
    if (!email || !newPassword) {
        console.log('Usage: npx ts-node scripts/reset-user-password.ts <email> <new-password>');
        console.log('Example: npx ts-node scripts/reset-user-password.ts user@example.com NewPassword123');
        process.exit(1);
    }

    console.log(`\n--- Resetting Password for ${email} ---\n`);

    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
        console.error(`User with email ${email} not found.`);
        process.exit(1);
    }

    console.log(`User found: ${user.name || 'No name'} (${user.email})`);
    console.log(`Current password length: ${user.password?.length || 0}`);

    if (newPassword.length < 6) {
        console.error('Password must be at least 6 characters.');
        process.exit(1);
    }

    const hashedPassword = await hash(newPassword, 12);
    console.log(`New hashed password generated (length: ${hashedPassword.length})`);

    await prisma.users.update({
        where: { id: user.id },
        data: { password: hashedPassword }
    });

    console.log(`✅ Password reset successfully for ${email}`);
    console.log(`New password: ${newPassword}`);
}

resetUserPassword()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
