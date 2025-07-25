import { ZaloAutoReplyManager } from "@/components/ZaloAutoReplyManager";
import { ZaloLabelManager } from "@/components/ZaloLabelManager";
import { ZaloAiCareManager } from "@/components/ZaloAiCareManager";

const ZaloSettings = () => {
  return (
    <main className="flex-1 space-y-6 p-6 sm:p-8">
      <h2 className="text-3xl font-bold tracking-tight">Cấu hình Zalo</h2>
      <div className="space-y-6">
        <ZaloAutoReplyManager />
        <ZaloAiCareManager />
        <ZaloLabelManager />
      </div>
    </main>
  );
};

export default ZaloSettings;