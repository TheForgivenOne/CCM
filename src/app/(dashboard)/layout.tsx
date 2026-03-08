import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import TopBar from '@/components/layout/TopBar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Sidebar />
      <div className="lg:pl-64">
        <TopBar />
        <main className="min-h-screen pb-20 lg:pb-0">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
