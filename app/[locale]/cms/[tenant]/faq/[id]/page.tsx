import { prismadb } from "@/lib/prisma";
import { FaqEditor } from "../_components/FaqEditor";
import { notFound } from "next/navigation";

export default async function EditFaqPage(props: { params: Promise<{ locale: string; id: string }> }) {
    const params = await props.params;

    // Safety check for 'new' collision if routing wasn't handled by folder structure, 
    // but Next.js prefers specific folders over slugs so /new/page.tsx should take precedence.
    if (params.id === 'new') return <FaqEditor locale={params.locale} />;

    const faq = await prismadb.faq.findUnique({
        where: { id: params.id }
    });

    if (!faq) {
        return notFound();
    }

    return <FaqEditor initialData={faq} locale={params.locale} />;
}
