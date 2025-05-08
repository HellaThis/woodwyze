import React from 'react';
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="bg-gray-100 min-h-screen">

      <main className="max-w-7xl mx-auto py-16 px-6">
        <h2 className="text-5xl font-bold text-green-900 text-center mb-8">The Smarter Way to Work with Wood</h2>
        <p className="text-lg text-center text-gray-700 mb-16">
          WoodWyze is your all-in-one hub for discovering hardwood, planning your builds, managing your workshop, and
          selling your handcrafted creations. Join us as we redefine what&#39;s possible in modern woodworking.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardContent>
              <h3 className="text-2xl font-semibold text-green-800">Discover New Sources</h3>
              <p className="text-gray-600">Find hardwood in your region through verified vendor listings and community
                contributions.</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="text-2xl font-semibold text-green-800">Track Your Builds</h3>
              <p className="text-gray-600">Organize materials, costs, and progress on all your current and past
                woodworking projects.</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="text-2xl font-semibold text-green-800">Sell What You Make</h3>
              <p className="text-gray-600">Create transparent listings that showcase your skill and help customers
                request custom builds.</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="text-2xl font-semibold text-green-800">Join a Woodworking Guild</h3>
              <p className="text-gray-600">Connect with local woodworkers, share projects, plan group builds, and
                organize events.</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="text-2xl font-semibold text-green-800">Plan Your Workshop</h3>
              <p className="text-gray-600">Design your ideal workspace, organize tools, and share your shop setup with
                the community.</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h3 className="text-2xl font-semibold text-green-800">Grow Your Reputation</h3>
              <p className="text-gray-600">Build trust through profile achievements, community feedback, and visible
                project history.</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-3xl font-bold text-green-900 mb-4">Ready to Join the Movement?</h3>
          <p className="text-lg text-gray-700 mb-8">Join the waiting list to be the first to know when WoodWyze
            launches.</p>
          <Button className="text-black px-8 py-4 rounded-xl text-lg">
            <Link className="text-white" href="https://accounts.woodwyze.com/waitlist">Join the Waiting List</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
