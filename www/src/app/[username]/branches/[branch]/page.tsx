"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface LinkItem {
  title: string;
  url: string;
  description: string;
}

interface Branch {
  name: string;
  slug: string;
  description: string;
  links: LinkItem[];
}

export default function BranchDetailPage() {
  const params = useParams();
  const username = params?.username || 'User';
  const branchSlug = params?.branch || 'Branch';
  const [branch, setBranch] = useState<Branch | null>(null);

  useEffect(() => {
    async function fetchBranch() {
      try {
        const res = await fetch(`/api/branches?username=${username}`);
        const data = await res.json();

        const foundBranch = data.find((b: Branch) => b.slug === branchSlug);
        setBranch(foundBranch || null);
      } catch (error) {
        console.error("Failed to fetch branch:", error);
      }
    }

    fetchBranch();
  }, [username, branchSlug]);

  if (!branch) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-6 text-red-800">Branch Not Found</h1>
        <Link href={`/${username}/branches`} className="text-green-800 hover:text-green-600">
          Back to Branches
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6 text-green-800">{branch.name}</h1>
      <p className="text-lg text-black mb-6">{branch.description}</p>
      <ul className="space-y-4">
        {branch.links.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 border rounded-lg bg-white shadow-md hover:bg-gray-50"
            >
              <h2 className="text-2xl font-bold text-green-800">{link.title}</h2>
              <p className="text-sm text-black">{link.description}</p>
            </a>
          </li>
        ))}
      </ul>
      <Link href={`/${username}/branches`} className="text-green-800 hover:text-green-600 mt-8 inline-block">
        ← Back to Branches
      </Link>
    </div>
  );
}