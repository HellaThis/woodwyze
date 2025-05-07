"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface LinkItem {
  title: string;
  url: string;
  description: string;
  level: string;
  tags: string[];
  video?: boolean;
  image?: string;
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

      <ul className="space-y-8">
        {branch.links.map((link) => (
          <li key={link.url} className="rounded-lg bg-white shadow-lg overflow-hidden">
            {/* Image or Video */}
            {link.image && !link.video && (
              <div className="relative w-full h-64 overflow-hidden">
                <img
                  src={link.image}
                  alt={link.title}
                  className="w-full h-full object-cover rounded-t-lg"
                />
              </div>
            )}
            {link.video && (
              <div className="relative w-full overflow-hidden aspect-video">
                <iframe
                  src={link.url}
                  title={link.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full rounded-t-lg"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-green-800 mb-2">{link.title}</h2>
              <p className="text-sm text-black mb-2">{link.description}</p>
              <div className="text-xs text-gray-600 mb-2">
                <strong>Level:</strong> {link.level}
                {link.tags && link.tags.length > 0 && (
                  <span> | <strong>Tags:</strong> {link.tags.join(", ")}</span>
                )}
              </div>

              {/* Button */}
              {!link.video && (
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 bg-green-800 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                >
                  View Project →
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>

      <Link href={`/${username}/branches`} className="text-green-800 hover:text-green-600 mt-8 inline-block">
        ← Back to Branches
      </Link>
    </div>
  );
}