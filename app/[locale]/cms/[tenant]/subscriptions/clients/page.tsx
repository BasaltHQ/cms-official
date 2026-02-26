
import { ClientManagement } from "@/components/cms/ClientManagement";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Client Management",
    description: "Manage client subscriptions and accounts",
};

export default function ClientsPage() {
    return (
        <div className="flex-1 w-full bg-[#030303] min-h-screen p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <ClientManagement />
            </div>
        </div>
    );
}
