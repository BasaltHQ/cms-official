import { FaqEditor } from "../_components/FaqEditor";

export default async function NewFaqPage(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    return <FaqEditor locale={params.locale} />;
}
