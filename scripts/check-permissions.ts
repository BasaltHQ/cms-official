
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdminStatus() {
    console.log('Checking admin status...');

    const emails = ['admin@ledger1.com', 'admin@ledger1.ai'];

    for (const email of emails) {
        const user = await prisma.users.findUnique({
            where: { email },
            select: { id: true, email: true, is_admin: true, cmsModules: true, roleId: true }
        });

        if (user) {
            console.log(`User found: ${email}`);
            console.log(JSON.stringify(user, null, 2));
        } else {
            console.log(`User NOT found: ${email}`);
        }
    }
}

checkAdminStatus()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
