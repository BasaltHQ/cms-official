import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SubscriptionClient from "./components/SubscriptionClient";

export default async function SubscriptionsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect(`/${locale}/cms/login`);
    }

    // Check module permission
    // Assuming we add logic here or the layout handles it?
    // For now, allow access if session exists, matching other pages pattern sort of.
    // Ideally we check modules.

    return <SubscriptionClient />;
}
