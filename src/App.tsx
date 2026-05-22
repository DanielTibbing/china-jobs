import { useState, useEffect, useMemo } from 'react'
import { Search, MapPin, Building2, Briefcase, Bookmark, ExternalLink, RefreshCw, Filter, History, Clock } from 'lucide-react'

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
  const [activeJobs, setActiveJobs] = useState<Job[]>([])
  const [removedJobs, setRemovedJobs] = useState<Job[]>([])
  const [seenJobIds, setSeenJobIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<'active' | 'history'>('active')

  useEffect(() => {
    // 1. Load seen IDs and history from localStorage
    const savedSeen = localStorage.getItem('seen_job_ids')
    const savedAllJobs = localStorage.getItem('all_ever_seen_jobs')
    
    const initialSeen = savedSeen ? new Set(JSON.parse(savedSeen)) : new Set<string>()
    const allEverSeen: Record<string, Job> = savedAllJobs ? JSON.parse(savedAllJobs) : {}
    
    setSeenJobIds(initialSeen)

    // 2. Fetch current jobs
    fetch('jobs.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch jobs')
        return res.json()
      })
      .then((data: Job[]) => {
        setActiveJobs(data)
        
        // 3. Identify removed jobs
        // Any job that was in "allEverSeen" but is NOT in the current "data" is removed
        const currentIds = new Set(data.map(j => j.id))
        const removed = Object.values(allEverSeen).filter(j => !currentIds.has(j.id))
        setRemovedJobs(removed.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()))

        // 4. Update "allEverSeen" with current jobs for future visits
        const updatedAllEverSeen = { ...allEverSeen }
        data.forEach(job => {
          updatedAllEverSeen[job.id] = job
        })
        localStorage.setItem('all_ever_seen_jobs', JSON.stringify(updatedAllEverSeen))

        // 5. Mark all currently active jobs as "seen" for the NEXT visit
        // We do this after a small delay to ensure the current render shows them as "NEW"
        setTimeout(() => {
          const newSeenIds = new Set([...Array.from(initialSeen), ...data.map(j => j.id)])
          localStorage.setItem('seen_job_ids', JSON.stringify(Array.from(newSeenIds)))
        }, 2000)

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
    const jobsSource = currentView === 'active' ? activeJobs : removedJobs
    const unique = new Set(jobsSource.map(job => job.company))
    return ['All', ...Array.from(unique).sort()]
  }, [activeJobs, removedJobs, currentView])

  const filteredJobs = useMemo(() => {
    const source = currentView === 'active' ? activeJobs : removedJobs
    return source.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.location.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRegion = selectedRegion === 'All' || job.region === selectedRegion
      const matchesCompany = selectedCompany === 'All' || job.company === selectedCompany
      return matchesSearch && matchesRegion && matchesCompany
    })
  }, [activeJobs, removedJobs, currentView, searchTerm, selectedRegion, selectedCompany])

  const REGION_FLAGS: Record<string, string> = {
    'China': '🇨🇳',
    'Hong Kong': '🇭🇰',
    'Singapore': '🇸🇬',
    'Sweden': '🇸🇪',
    'All': '🌎'
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-1.5 rounded-lg">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">China-Nordic Jobs</h1>
              </div>
              <p className="text-sm text-gray-500 mt-1">Tracking {activeJobs.length} active roles across tech hubs</p>
            </div>
            
            <div className="flex flex-1 max-w-md gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                  placeholder="Search roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* View Switcher */}
          <div className="flex items-center gap-1 mt-6 border-b border-gray-100">
            <button
              onClick={() => {setCurrentView('active'); setSelectedCompany('All')}}
              className={`px-4 py-2 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
                currentView === 'active' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <Briefcase className="h-4 w-4" />
              Active Jobs
              <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs ml-1">
                {activeJobs.length}
              </span>
            </button>
            <button
              onClick={() => {setCurrentView('history'); setSelectedCompany('All')}}
              className={`px-4 py-2 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${
                currentView === 'history' 
                ? 'border-orange-500 text-orange-600' 
                : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <History className="h-4 w-4" />
              History
              <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-xs ml-1">
                {removedJobs.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {Object.keys(REGION_FLAGS).map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-4 py-2 rounded-full text-sm font-bold border transition duration-150 ease-in-out flex items-center gap-2 ${
                  selectedRegion === region
                    ? 'bg-gray-900 border-gray-900 text-white shadow-sm'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <span className="text-base leading-none">{REGION_FLAGS[region]}</span>
                {region}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="block w-full pl-10 pr-10 py-2.5 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-xl bg-white shadow-sm appearance-none border font-bold text-gray-700"
            >
              <option value="All">All Companies</option>
              {companies.filter(c => c !== 'All').map(company => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-gray-500 font-medium">
            Showing {filteredJobs.length} {filteredJobs.length === 1 ? 'result' : 'results'}
            {selectedCompany !== 'All' && <span> at <span className="text-gray-900 font-bold">{selectedCompany}</span></span>}
            {selectedRegion !== 'All' && <span> in <span className="text-gray-900 font-bold">{selectedRegion}</span></span>}
          </div>
          {currentView === 'history' && (
            <div className="bg-orange-50 text-orange-700 px-3 py-1 rounded-lg text-xs font-bold border border-orange-100">
              Listing roles no longer active on career sites
            </div>
          )}
        </div>

        {/* Job List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-20">
              <RefreshCw className="mx-auto h-12 w-12 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Fetching job listings...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-red-50 rounded-xl border border-red-200">
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 shadow-sm">
              <Briefcase className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-900">No jobs found</h3>
              <p className="text-gray-500 max-w-xs mx-auto">Try clearing your filters or checking the history tab.</p>
              <button 
                onClick={() => {setSearchTerm(''); setSelectedRegion('All'); setSelectedCompany('All')}}
                className="mt-6 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-xl font-bold transition-colors text-sm"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const isNew = currentView === 'active' && !seenJobIds.has(job.id);
              
              return (
                <div key={job.id} className={`bg-white p-6 rounded-2xl border-2 transition-all duration-200 group relative overflow-hidden ${
                  currentView === 'history' 
                  ? 'border-gray-100 opacity-80 grayscale-[0.5]' 
                  : 'border-gray-100 hover:border-blue-100 shadow-sm hover:shadow-md'
                }`}>
                  {isNew && (
                    <div className="absolute top-0 left-0">
                       <div className="bg-blue-600 text-white text-[10px] font-black uppercase px-6 py-1 -rotate-45 -translate-x-6 translate-y-1 shadow-sm">
                         New
                       </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className={`text-xl font-black leading-tight ${currentView === 'history' ? 'text-gray-700' : 'text-gray-900 group-hover:text-blue-600 transition-colors'}`}>
                          {job.title}
                        </h2>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-500 mt-4">
                        <div className="flex items-center font-bold text-gray-700">
                          <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                          {job.company}
                        </div>
                        <div className="flex items-center font-medium">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          {job.location}
                        </div>
                        <div className="flex items-center text-gray-500 font-bold bg-gray-100 px-3 py-1 rounded-lg text-[11px] uppercase tracking-wider">
                          <span className="mr-1.5 text-sm">{REGION_FLAGS[job.region] || '📍'}</span>
                          {job.region}
                        </div>
                        <div className="flex items-center text-[11px] font-bold text-gray-400">
                          <Clock className="h-3.5 w-3.5 mr-1.5" />
                          {new Date(job.postedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {currentView === 'active' ? (
                        <>
                          <button className="p-3 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Save job">
                            <Bookmark className="h-5 w-5" />
                          </button>
                          <a
                            href={job.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-black rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                          >
                            Apply <ExternalLink className="ml-2 h-4 w-4" />
                          </a>
                        </>
                      ) : (
                        <div className="text-gray-400 text-xs font-bold uppercase italic px-4 py-2 bg-gray-50 rounded-lg">
                          Expired
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                 <div className="bg-gray-900 p-1.5 rounded-lg">
                    <Briefcase className="h-4 w-4 text-white" />
                 </div>
                 <h3 className="text-sm font-black text-gray-900 tracking-wider uppercase">China-Nordic Jobs</h3>
              </div>
              <p className="text-gray-500 text-sm max-w-sm leading-relaxed mx-auto md:mx-0">
                A community-driven job board tracking technical leadership and engineering roles across the world's most dynamic tech hubs.
              </p>
            </div>
            <div className="md:text-right flex flex-col items-center md:items-end">
              <h3 className="text-sm font-black text-gray-900 tracking-wider uppercase mb-4">Dashboard</h3>
              <div className="flex flex-wrap justify-center md:justify-end gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-black bg-blue-50 text-blue-700 border border-blue-100">
                  {activeJobs.length} ACTIVE
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-black bg-orange-50 text-orange-700 border border-orange-100">
                  {removedJobs.length} REMOVED
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-black bg-gray-50 text-gray-600 border border-gray-100">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
              &copy; {new Date().getFullYear()} Curated by Daniel Tibbing
            </p>
            <div className="flex items-center gap-6">
               <a href="https://github.com/danieltibbing/china-jobs" className="text-gray-400 hover:text-gray-900 transition-colors">
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
