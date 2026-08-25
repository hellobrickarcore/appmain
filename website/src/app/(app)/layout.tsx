import Header from "@/components/layout/Header";
import RequirePremium from "@/components/layout/RequirePremium";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequirePremium>
      <div className="min-h-screen bg-[#F5F5F7] font-sans">
        <Header />
        <main className="pb-20">{children}</main>
      </div>
    </RequirePremium>
  );
}
