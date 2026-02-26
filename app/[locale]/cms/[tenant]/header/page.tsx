import { getHeaderConfig } from "@/actions/cms/header-actions";
import HeaderEditor from "@/components/cms/header/HeaderEditor";

export default async function HeaderPage() {
    const config = await getHeaderConfig();

    return (
        <div className="p-8">
            <HeaderEditor initialConfig={config} />
        </div>
    );
}
