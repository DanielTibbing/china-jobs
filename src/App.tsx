import { useState, useEffect } from 'react'
import { Search, MapPin, Building2, Briefcase, Bookmark, ExternalLink, RefreshCw } from 'lucide-react'

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  link: string;
  postedAt: string;
  region: string;
}

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/jobs.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch jobs')
        return res.json()
      })
      .then(data => {
        setJobs(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError('Could not load jobs. Please try again later.')
        setLoading(false)
      })
  }, [])

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRegion = selectedRegion === 'All' || job.region === selectedRegion
    return matchesSearch && matchesRegion
  })

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">China-Nordic Jobs</h1>
              <p className="text-sm text-gray-500">Aggregating jobs from top companies in China, HK, SG, and Sweden</p>
            </div>
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                placeholder="Search by title, company, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters / Regions */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['All', 'China', 'Hong Kong', 'Singapore', 'Sweden'].map((region) => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition duration-150 ease-in-out ${
                selectedRegion === region
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              {region}
            </button>
          ))}
        </div>

        {/* Job List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-20">
              <RefreshCw className="mx-auto h-12 w-12 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-500">Loading latest job listings...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-red-50 rounded-xl border border-red-200">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No jobs found matching your criteria</h3>
              <p className="text-gray-500">Try adjusting your search or filters.</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div key={job.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-1 leading-tight">{job.title}</h2>
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-600 mt-2">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-1.5 text-gray-400" />
                        <span className="font-medium text-gray-800">{job.company}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-blue-100">
                          {job.region}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100">
                      <Bookmark className="h-5 w-5" />
                    </button>
                    <a
                      href={job.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      View Job <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">About</h3>
              <p className="text-gray-500 text-sm max-w-xs">
                A simple job aggregator focused on tech and engineering roles for companies operating in the China-Nordic corridor.
              </p>
            </div>
            <div className="md:text-right">
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">Data Source</h3>
              <p className="text-gray-500 text-sm">
                Last updated: {new Date().toLocaleDateString()}
              </p>
              <p className="text-gray-400 text-xs mt-2">
                Hosted on GitHub Pages &sdot; Data refreshed daily
              </p>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-100 pt-8 flex justify-between items-center">
            <p className="text-gray-400 text-xs">
              &copy; {new Date().getFullYear()} China-Nordic Job Aggregator.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
