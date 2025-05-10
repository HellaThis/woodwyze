// src/app/layout.tsx
import './globals.css';
import {Metadata} from 'next';
import NavBar from '../components/NavBar';
import {ClerkProvider} from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'WoodWyze',
  description: 'Your all-in-one woodworking hub.',
  icons: {
    icon: '/i/logo.ico',
  },
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
      <body className="bg-neutral-50 text-neutral-800 font-sans">
      <header className="bg-green-900 text-white p-4 shadow">
        <NavBar/>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
      </body>
      </html>
    </ClerkProvider>

  );
}
