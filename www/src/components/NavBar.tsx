'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu } from 'lucide-react';

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-green-900 text-white px-6 py-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center">
          <Image src="/i/logo.png" alt="WoodWyze Logo" width={48} height={48} />
          <span className="ml-3 text-2xl font-bold text-white">WoodWyze</span>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-8 text-lg font-semibold">
          <li>
            <Link href="/" className="text-white hover:text-green-300">Home</Link>
          </li>
          <li>
            <Link href="/adam/branches" className="text-white hover:text-green-300">Branches</Link>
          </li>
          <li>
            <Link href="/marketplace" className="text-white hover:text-green-300">Marketplace</Link>
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
            <Link href="/" onClick={() => setIsOpen(false)} className="text-white hover:text-green-300">Home</Link>
          </li>
          <li>
            <Link href="/adam/branches" onClick={() => setIsOpen(false)} className="text-white hover:text-green-300">Branches</Link>
          </li>
          <li>
            <Link href="/marketplace" onClick={() => setIsOpen(false)} className="text-white hover:text-green-300">Marketplace</Link>
          </li>
        </ul>
      )}
    </nav>
  );
}