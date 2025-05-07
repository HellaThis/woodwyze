'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu } from 'lucide-react';

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-green-800 text-white px-6 py-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center">
          <Image src="/i/logo.png" alt="WoodWyze Logo" width={48} height={48} />
          <span className="ml-3 text-2xl font-bold whitespace-nowrap">WoodWyze</span>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-8 text-lg font-semibold">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/linktree">Linktree</Link>
          </li>
          <li>
            <Link href="/marketplace">Marketplace</Link>
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu size={32} />
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <ul className="md:hidden bg-green-900 text-white space-y-4 p-4 mt-2 rounded-lg">
          <li>
            <Link href="/" onClick={() => setIsOpen(false)}>Home</Link>
          </li>
          <li>
            <Link href="/linktree" onClick={() => setIsOpen(false)}>Linktree</Link>
          </li>
          <li>
            <Link href="/marketplace" onClick={() => setIsOpen(false)}>Marketplace</Link>
          </li>
        </ul>
      )}
    </nav>
  );
}