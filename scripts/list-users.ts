
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
    console.log('Listing Users...');
    const users = await prisma.users.findMany({
        select: {
            id: true,
            email: true,
            userStatus: true,
            is_admin: true,
            roleId: true,
            password: true // Only to check if it exists and looks hashed
        }
    });

    users.forEach(u => {
        console.log(`User: ${u.email}`);
        console.log(`  Status: ${u.userStatus}`);
        console.log(`  Admin: ${u.is_admin}`);
        console.log(`  Role: ${u.roleId}`);
        console.log(`  Password Set: ${!!u.password}`);
        console.log(`  Password Length: ${u.password?.length}`);
        console.log('---');
    });
}

listUsers()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
