import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// USAGE: Add emails to this array to fix specific users, or modify query to find all relevant users
const USERS_TO_FIX: string[] = [
    // 'user@example.com',
];

const TEMP_PASSWORD = process.env.TEMP_FIX_PASSWORD;

async function fixPlaintextPasswords() {
    console.log('--- Fixing Plaintext Passwords ---\n');

    if (!TEMP_PASSWORD) {
        console.error("ERROR: Please set TEMP_FIX_PASSWORD environment variable to run this script safely.");
        process.exit(1);
    }

    if (USERS_TO_FIX.length === 0) {
        console.log("No specific users defined in USERS_TO_FIX. Exiting.");
        return;
    }

    const hashedPassword = await hash(TEMP_PASSWORD, 12);
    console.log(`New hashed password generated (length: ${hashedPassword.length})`);

    for (const email of USERS_TO_FIX) {
        const user = await prisma.users.findUnique({ where: { email } });

        if (!user) {
            console.log(`[SKIP] ${email} - User not found`);
            continue;
        }

        const pwdLength = user.password?.length || 0;

        // bcrypt hashes are always 60 characters
        if (pwdLength > 0 && pwdLength < 60) {
            console.log(`[FIX] ${email} - Password length ${pwdLength} (plaintext detected)`);

            await prisma.users.update({
                where: { id: user.id },
                data: { password: hashedPassword }
            });

            console.log(`      ✅ Password reset to hashed version`);
        } else if (pwdLength === 60) {
            console.log(`[OK] ${email} - Password already hashed (length 60)`);
        } else {
            console.log(`[WARN] ${email} - No password set`);
        }
    }

    console.log(`\n--- Done ---`);
    console.log(`Temporary password set for affected users.`);
    console.log(`Users should change their password after first login.`);
}

fixPlaintextPasswords()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
