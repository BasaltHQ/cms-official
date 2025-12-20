
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CMS_MODULES = [
    { slug: "dashboard", label: "Dashboard" },
    { slug: "applications", label: "Applications" },
    { slug: "blog", label: "Blog" },
    { slug: "careers", label: "Careers" },
    { slug: "docs", label: "Documentation" },
    { slug: "footer", label: "Footer" },
    { slug: "social", label: "Social Media" },
    { slug: "media", label: "Media Library" },
    { slug: "team", label: "Team & Admins" },
    { slug: "integrations", label: "Integrations" },
    { slug: "settings", label: "Settings" },
    { slug: "activity", label: "Activity Log" },
    { slug: "voice", label: "Universal Voice" },
];

async function verifyCmsModules() {
    console.log('--- Verifying CMS Modules Logic ---');

    // 1. Test Super Admin (admin@ledger1.ai)
    const superAdmin = await prisma.users.findUnique({ where: { email: 'admin@ledger1.ai' } });
    if (!superAdmin) {
        console.error('Super Admin not found!');
    } else {
        console.log(`\nUser: ${superAdmin.email} (IsAdmin: ${superAdmin.is_admin})`);
        // Simulate Layout Logic
        let enabledModules: string[] = [];
        if (superAdmin.email === 'admin@ledger1.ai' || superAdmin.is_admin) {
            enabledModules = CMS_MODULES.map(m => m.slug);
            console.log('  [PASS] Authorization: Full Access Granted (Admin Override)');
        } else {
            enabledModules = superAdmin.cmsModules;
            console.log('  [FAIL] Authorization: Limited Access (Should be Full)');
        }
        console.log(`  Visible Modules: ${enabledModules.length}/${CMS_MODULES.length}`);
    }

    // 2. Test Standard User (Create temp if needed, or use existing)
    // Let's use 'admin@ledger1.com' which we know is NOT an admin
    const stdUser = await prisma.users.findUnique({ where: { email: 'admin@ledger1.com' } });
    if (!stdUser) {
        console.warn('\nStandard user admin@ledger1.com not found, skipping specific test.');
    } else {
        console.log(`\nUser: ${stdUser.email} (IsAdmin: ${stdUser.is_admin})`);

        // Update modules to just 'dashboard' and 'blog'
        await prisma.users.update({
            where: { id: stdUser.id },
            data: { cmsModules: ['dashboard', 'blog'] }
        });
        console.log('  Updated CMS Modules to: [dashboard, blog]');

        const updatedUser = await prisma.users.findUnique({ where: { id: stdUser.id } });

        // Simulate Layout Logic
        let enabledModules: string[] = [];
        if (updatedUser?.email === 'admin@ledger1.ai' || updatedUser?.is_admin) {
            enabledModules = CMS_MODULES.map(m => m.slug);
        } else {
            enabledModules = updatedUser?.cmsModules || [];
        }

        console.log(`  Actual Enabled Modules: ${enabledModules.join(', ')}`);

        const hasDashboard = enabledModules.includes('dashboard');
        const hasBlog = enabledModules.includes('blog');
        const hasSettings = enabledModules.includes('settings');

        if (hasDashboard && hasBlog && !hasSettings) {
            console.log('  [PASS] Sidebar Logic: Correctly filtered modules');
        } else {
            console.error('  [FAIL] Sidebar Logic: Incorrect filtering');
        }
    }
}

verifyCmsModules()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
