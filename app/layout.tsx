import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'OpenClaw Mission Control',
  description: 'Local-first dashboard for OpenClaw',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <div className="grid grid-cols-[260px_1fr] min-h-screen">
          <aside className="border-r border-white/[0.08] bg-surface-1/50 px-3.5 py-4">
            <Sidebar />
          </aside>
          <main className="p-6 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
