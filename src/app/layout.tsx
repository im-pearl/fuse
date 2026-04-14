import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FUSE',
  description: '터지기 전에, 녹이세요.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="h-full bg-black flex items-center justify-center">
        {/* 모바일 비율 컨테이너 — 항상 세로 */}
        <div className="w-full max-w-[430px] h-full max-h-dvh bg-zinc-950 relative overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
