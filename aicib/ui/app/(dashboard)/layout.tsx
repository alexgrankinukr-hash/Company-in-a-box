import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { BriefInput } from "@/components/brief-input";
import { SSEProvider } from "@/components/sse-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SSEProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <BriefInput />
          <main className="flex flex-1 flex-col overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </SSEProvider>
  );
}
