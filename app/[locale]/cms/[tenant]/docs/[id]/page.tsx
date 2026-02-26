import { DocEditor } from "@/components/cms/DocEditor";

export default async function DocEditorPage(props: { params: Promise<{ id: string, locale: string }>, searchParams: Promise<{ type?: string }> }) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    // If editing existing, type comes from DB (handled in component). If new, use searchParam or default to 'docs'.
    // However, DocEditor takes `defaultType`.
    const type = (searchParams.type === "university" ? "university" : "docs") as "docs" | "university";

    return <DocEditor id={params.id} locale={params.locale} defaultType={type} />;
}
