import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ayam Boiler',
  description: 'Menghitung jumlah ayam boiler!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased font-sans">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
