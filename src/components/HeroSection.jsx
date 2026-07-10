import { useState } from 'react'

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Find <span className="text-indigo-600">Part-Time Jobs</span> <br />
              Near You
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Connecting people who need work done with people who want to work.
            </p>

            <div className="flex gap-4 mb-8">
              <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                Browse Notices
              </button>
              <button className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 font-medium">
                Post a Notice
              </button>
            </div>

            {/* Search bar */}
            <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
              <input
                type="text"
                placeholder="Search jobs (e.g. Catering, Helper, Cleaner...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent px-4 py-2 focus:outline-none text-gray-700"
              />
              <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                Search
              </button>
            </div>
          </div>

          {/* Right side - Illustration */}
          <div className="flex justify-center items-center">
            <div className="relative w-full max-w-md">
              {/* Placeholder for illustration - using SVG circles and shapes */}
              <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl p-12 aspect-square flex items-center justify-center relative">
                <div className="absolute top-8 right-8 bg-yellow-200 rounded-full w-16 h-16 flex items-center justify-center text-3xl">
                  👤
                </div>
                <div className="absolute bottom-8 left-8 bg-pink-200 rounded-full w-16 h-16 flex items-center justify-center text-3xl">
                  👩
                </div>
                <div className="absolute top-1/2 right-12 bg-gray-200 rounded-full w-12 h-12 flex items-center justify-center text-2xl">
                  🔔
                </div>
                <div className="text-center">
                  <div className="text-5xl mb-4">💼</div>
                  <p className="text-gray-600 font-medium">Opportunities Await</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
