import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Chaotic Pen Studio',
  description: 'Deterministic scribble portrait drawing — one continuous stroke',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#050505] text-gray-200 antialiased">{children}</body>
    </html>
  );
}
