import { Sidebar } from './components/sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="ml-64 min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}