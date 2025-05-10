'use client';

import Link from 'next/link';
import Image from 'next/image';
import {useCallback, useState} from 'react';
import {Menu} from 'lucide-react';
import {type Metadata} from 'next';
import {SignedIn, SignedOut, SignInButton, UserButton, useUser} from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'WoodWyze',
  description: 'Your woodworking community',
};

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const {user} = useUser();

  // Get the username or fallback to a placeholder
  const getUsername = useCallback(() => {
    return user?.username ?? user?.firstName ?? user?.emailAddresses[0].emailAddress?.split("@")[0] ?? 'guest';
  }, [user]);

  return (
    <nav className="bg-green-900 text-white px-6 py-4 shadow-md">

      <div className="container mx-auto flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center">
          <Image src="/i/logo.png" alt="WoodWyze Logo" width={48} height={48}/>
          <span className="ml-3 text-2xl font-bold text-white">WoodWyze</span>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-8 text-lg font-semibold">
          <li>
            <Link href="/" className="text-white hover:text-green-300">Home</Link>
          </li>
          <SignedIn>
            <li>
              <Link href={`/${getUsername()}/branches`} className="text-white hover:text-green-300">
                Branches
              </Link>
            </li>
          </SignedIn>
          <li>
            <SignedOut>
              <SignInButton/>
            </SignedOut>
            <SignedIn>
              <UserButton/>
            </SignedIn>
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Menu size={32}/>
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <ul className="md:hidden bg-green-900 text-white space-y-4 p-4 mt-2 rounded-lg">
          <li>
            <Link href="/" onClick={() => setIsOpen(false)} className="text-white hover:text-green-300">Home</Link>
          </li>
          <SignedIn>
            <li>
              <Link href={`/${getUsername()}/branches`} onClick={() => setIsOpen(false)}
                    className="text-white hover:text-green-300">
                Branches
              </Link>
            </li>
          </SignedIn>
          <li>
            <SignedOut>
              <SignInButton/>
            </SignedOut>
            <SignedIn>
              <UserButton/>
            </SignedIn>
          </li>
        </ul>
      )}
    </nav>
  );
}