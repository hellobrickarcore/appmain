import MobileNav from "@/components/layout/MobileNav";
import Header from "@/components/layout/Header";
import RequirePremium from "@/components/layout/RequirePremium";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequirePremium>
      <div className="page-container">
        <Header />
        <main className="content-area pb-20">{children}</main>
        <MobileNav />
      </div>
    </RequirePremium>
  );
}
