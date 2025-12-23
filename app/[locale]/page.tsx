import DemoPage from "@/components/demo/DemoPage";
import MarketingFooter from "@/app/[locale]/components/MarketingFooter";

export default function Page() {
    return (
        <DemoPage footer={<MarketingFooter />} />
    );
}
