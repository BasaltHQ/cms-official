import { DocEditor } from "@/components/cms/DocEditor";

export default async function DocEditorPage(props: { params: Promise<{ id: string, locale: string }> }) {
    const params = await props.params;
    return <DocEditor id={params.id} locale={params.locale} defaultType="university" />;
}
