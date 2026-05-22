import { useState, useEffect, useMemo } from 'react'
import { Search, MapPin, Building2, Briefcase, Bookmark, ExternalLink, RefreshCw, Filter } from 'lucide-react'

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
  const [selectedCompany, setSelectedCompany] = useState('All')
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('jobs.json')
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

  // Derive unique companies for the dropdown
  const companies = useMemo(() => {
    const unique = new Set(jobs.map(job => job.company))
    return ['All', ...Array.from(unique).sort()]
  }, [jobs])

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRegion = selectedRegion === 'All' || job.region === selectedRegion
    const matchesCompany = selectedCompany === 'All' || job.company === selectedCompany
    return matchesSearch && matchesRegion && matchesCompany
  })

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-blue-600 tracking-tight">China-Nordic Jobs</h1>
              <p className="text-sm text-gray-500">Curated tech roles from top global companies</p>
            </div>
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out shadow-sm"
                placeholder="Search by title, company, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          {/* Region Chips */}
          <div className="flex flex-wrap gap-2">
            {['All', 'China', 'Hong Kong', 'Singapore', 'Sweden'].map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition duration-150 ease-in-out ${
                  selectedRegion === region
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                }`}
              >
                {region}
              </button>
            ))}
          </div>

          {/* Company Dropdown */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-full bg-white shadow-sm appearance-none border"
            >
              <option value="All">All Companies ({jobs.length})</option>
              {companies.filter(c => c !== 'All').map(company => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-4 text-sm text-gray-500">
          Showing {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
          {selectedCompany !== 'All' && <span> at <span className="font-semibold text-gray-700">{selectedCompany}</span></span>}
          {selectedRegion !== 'All' && <span> in <span className="font-semibold text-gray-700">{selectedRegion}</span></span>}
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
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300 shadow-sm">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No jobs found matching your criteria</h3>
              <p className="text-gray-500">Try adjusting your search or filters.</p>
              <button 
                onClick={() => {setSearchTerm(''); setSelectedRegion('All'); setSelectedCompany('All')}}
                className="mt-4 text-blue-600 font-medium hover:underline text-sm"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div key={job.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-1 leading-tight group-hover:text-blue-600 transition-colors">{job.title}</h2>
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-600 mt-3">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="font-semibold text-gray-800">{job.company}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-blue-100 shadow-sm">
                          {job.region}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <button className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100" title="Save job">
                      <Bookmark className="h-5 w-5" />
                    </button>
                    <a
                      href={job.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-bold rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      Apply Now <ExternalLink className="ml-2 h-4 w-4" />
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-sm font-bold text-gray-900 tracking-wider uppercase mb-4">About</h3>
              <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
                A curated job aggregator for high-growth tech companies across the China-Nordic corridor. Data is refreshed daily via automated scrapers.
              </p>
            </div>
            <div className="md:text-right">
              <h3 className="text-sm font-bold text-gray-900 tracking-wider uppercase mb-4">Live Data</h3>
              <p className="text-gray-600 text-sm font-medium">
                Last updated: {new Date().toLocaleDateString()}
              </p>
              <div className="flex flex-wrap justify-end gap-2 mt-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800">
                  {jobs.length} total roles
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                  {companies.length - 1} companies
                </span>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-xs font-medium">
              &copy; {new Date().getFullYear()} China-Nordic Jobs. Built for the community.
            </p>
            <div className="flex items-center gap-6">
               <a href="https://github.com" className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
               </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
