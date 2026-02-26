
import { NewsletterManagement } from "@/components/cms/NewsletterManagement";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Newsletter Subscribers",
    description: "Manage newsletter subscriptions",
};

export default function NewsletterPage() {
    return (
        <div className="flex-1 w-full bg-[#030303] min-h-screen p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <NewsletterManagement />
            </div>
        </div>
    );
}
