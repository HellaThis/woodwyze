// app/page.tsx

// src/app/page.tsx
export default function HomePage() {
  return (
    <div>
      <section className="text-center my-12 px-4" id="overview">
        <h2 className="text-3xl font-bold text-green-900">The Smarter Way to Work with Wood</h2>
        <p className="mt-4 text-neutral-700 max-w-2xl mx-auto">
          WoodWyze is your all-in-one hub for discovering hardwood, planning your builds, managing your workshop, and selling your handcrafted creations. We're just getting started—join us as we redefine what's possible in modern woodworking.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4" id="features">
        <h2 className="text-2xl font-semibold text-center text-green-900 mb-8">What You'll Be Able to Do</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white p-6 shadow">
            <h3 className="text-lg font-bold text-green-800 mb-2">Discover New Sources</h3>
            <p className="text-sm text-neutral-700">
              Find hardwood in your region through verified vendor listings and community contributions.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow">
            <h3 className="text-lg font-bold text-green-800 mb-2">Track Your Builds</h3>
            <p className="text-sm text-neutral-700">
              Organize materials, costs, and progress on all your current and past woodworking projects.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow">
            <h3 className="text-lg font-bold text-green-800 mb-2">Sell What You Make</h3>
            <p className="text-sm text-neutral-700">
              Create transparent listings that showcase your skill and help customers request custom builds.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow">
            <h3 className="text-lg font-bold text-green-800 mb-2">Compare and Plan Smarter</h3>
            <p className="text-sm text-neutral-700">
              Use smart tools to plan projects, compare options, and learn what makes each species unique.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow">
            <h3 className="text-lg font-bold text-green-800 mb-2">Learn and Share</h3>
            <p className="text-sm text-neutral-700">
              Read expert tips and community stories to learn new techniques or explore niche specialties.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow">
            <h3 className="text-lg font-bold text-green-800 mb-2">Grow Your Reputation</h3>
            <p className="text-sm text-neutral-700">
              Build trust through profile achievements, community feedback, and visible project history.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}