"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Branch {
  name: string;
  slug: string;
  description: string;
}

export default function BranchesPage() {
  const params = useParams();
  const username = params?.username || 'User';
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    async function fetchBranches() {
      try {
        const res = await fetch(`/api/branches?username=${username}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setBranches(data);
        } else {
          console.error(data);
        }
      } catch (error) {
        console.error("Failed to fetch branches:", error);
      }
    }

    fetchBranches();
  }, [username]);

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6 text-green-800">{username}'s branches</h1>
      <ul className="space-y-4">
        {branches.map((branch) => (
          <li key={branch.slug}>
            <Link href={`/${username}/branches/${branch.slug}`} className="text-green-800 hover:text-green-600">
              <div className="p-4 border rounded-lg bg-white shadow-md">
                <h2 className="text-2xl font-bold">{branch.name}</h2>
                <p className="text-sm text-black">{branch.description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}