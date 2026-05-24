import { useState, useEffect, useMemo } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { Job } from './types'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { JobsView } from './components/jobs/JobsView'
import { CompaniesView } from './components/companies/CompaniesView'

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [selectedCompany, setSelectedCompany] = useState('All')
  const [activeJobs, setActiveJobs] = useState<Job[]>([])
  const [removedJobs, setRemovedJobs] = useState<Job[]>([])
  const [seenJobIds] = useState<Set<string>>(() => {
    const savedSeen = localStorage.getItem('seen_job_ids')
    return savedSeen ? new Set<string>(JSON.parse(savedSeen) as string[]) : new Set<string>()
  })
  const [starredJobIds, setStarredJobIds] = useState<Set<string>>(() => {
    const savedStarred = localStorage.getItem('starred_job_ids')
    return savedStarred ? new Set<string>(JSON.parse(savedStarred) as string[]) : new Set<string>()
  })
  const [hiddenJobIds, setHiddenJobIds] = useState<Set<string>>(() => {
    const savedHidden = localStorage.getItem('hidden_job_ids')
    return savedHidden ? new Set<string>(JSON.parse(savedHidden) as string[]) : new Set<string>()
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      document.documentElement.style.colorScheme = 'dark'
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.style.colorScheme = 'light'
      localStorage.setItem('theme', 'light')
    }
  }, [isDarkMode])

  useEffect(() => {
    const savedSeen = localStorage.getItem('seen_job_ids')
    const savedAllJobs = localStorage.getItem('all_ever_seen_jobs')
    
    const initialSeen = savedSeen ? new Set<string>(JSON.parse(savedSeen) as string[]) : new Set<string>()
    const allEverSeen: Record<string, Job> = savedAllJobs ? JSON.parse(savedAllJobs) : {}

    fetch('jobs.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch jobs')
        return res.json()
      })
      .then((data: Job[]) => {
        setActiveJobs(data)
        const currentIds = new Set(data.map(j => j.id))
        const removed = Object.values(allEverSeen).filter(j => !currentIds.has(j.id))
        setRemovedJobs(removed.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()))

        const updatedAllEverSeen = { ...allEverSeen }
        data.forEach(job => {
          updatedAllEverSeen[job.id] = job
        })
        localStorage.setItem('all_ever_seen_jobs', JSON.stringify(updatedAllEverSeen))

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

  const toggleStarred = (jobId: string) => {
    setStarredJobIds(prev => {
      const next = new Set(prev)
      if (next.has(jobId)) {
        next.delete(jobId)
      } else {
        next.add(jobId)
      }
      localStorage.setItem('starred_job_ids', JSON.stringify(Array.from(next)))
      return next
    })
  }

  const hideJob = (jobId: string) => {
    setHiddenJobIds(prev => {
      const next = new Set(prev)
      next.add(jobId)
      localStorage.setItem('hidden_job_ids', JSON.stringify(Array.from(next)))
      return next
    })
  }

  const unhideJob = (jobId: string) => {
    setHiddenJobIds(prev => {
      const next = new Set(prev)
      next.delete(jobId)
      localStorage.setItem('hidden_job_ids', JSON.stringify(Array.from(next)))
      return next
    })
  }

  const companiesFromJobs = useMemo(() => {
    const unique = new Set(activeJobs.map(job => job.company))
    return ['All', ...Array.from(unique).sort()]
  }, [activeJobs])

  const allEverSeenJobsList = useMemo(() => {
    const uniqueMap = new Map<string, Job>()
    activeJobs.forEach(j => uniqueMap.set(j.id, j))
    removedJobs.forEach(j => uniqueMap.set(j.id, j))
    return Array.from(uniqueMap.values())
  }, [activeJobs, removedJobs])

  const starredJobs = useMemo(() => {
    return allEverSeenJobsList.filter(job => starredJobIds.has(job.id))
  }, [allEverSeenJobsList, starredJobIds])

  const hiddenJobs = useMemo(() => {
    return allEverSeenJobsList.filter(job => hiddenJobIds.has(job.id))
  }, [allEverSeenJobsList, hiddenJobIds])

  const starredCount = useMemo(() => {
    return starredJobs.filter(job => !hiddenJobIds.has(job.id)).length
  }, [starredJobs, hiddenJobIds])

  const activeJobIds = useMemo(() => {
    return new Set(activeJobs.map(j => j.id))
  }, [activeJobs])

  const filterSource = (source: Job[], excludeHidden = true) => {
    return source.filter(job => {
      if (excludeHidden && hiddenJobIds.has(job.id)) return false
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.location.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRegion = selectedRegion === 'All' || job.region === selectedRegion
      const matchesCompany = selectedCompany === 'All' || job.company === selectedCompany
      return matchesSearch && matchesRegion && matchesCompany
    })
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 font-sans transition-colors duration-300">
        <Header 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          setSelectedCompany={setSelectedCompany}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          starredCount={starredCount}
        />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={
              <JobsView 
                loading={loading}
                error={error}
                jobs={filterSource(activeJobs)}
                selectedRegion={selectedRegion}
                setSelectedRegion={setSelectedRegion}
                selectedCompany={selectedCompany}
                setSelectedCompany={setSelectedCompany}
                companiesFromJobs={companiesFromJobs}
                seenJobIds={seenJobIds}
                currentView="active"
                starredJobIds={starredJobIds}
                hiddenJobIds={hiddenJobIds}
                activeJobIds={activeJobIds}
                onToggleStarred={toggleStarred}
                onHide={hideJob}
                onUnhide={unhideJob}
              />
            } />
            <Route path="/starred" element={
              <JobsView 
                loading={loading}
                error={error}
                jobs={filterSource(starredJobs)}
                selectedRegion={selectedRegion}
                setSelectedRegion={setSelectedRegion}
                selectedCompany={selectedCompany}
                setSelectedCompany={setSelectedCompany}
                companiesFromJobs={companiesFromJobs}
                seenJobIds={seenJobIds}
                currentView="starred"
                starredJobIds={starredJobIds}
                hiddenJobIds={hiddenJobIds}
                activeJobIds={activeJobIds}
                onToggleStarred={toggleStarred}
                onHide={hideJob}
                onUnhide={unhideJob}
              />
            } />
            <Route path="/history" element={
              <JobsView 
                loading={loading}
                error={error}
                jobs={filterSource(removedJobs)}
                selectedRegion={selectedRegion}
                setSelectedRegion={setSelectedRegion}
                selectedCompany={selectedCompany}
                setSelectedCompany={setSelectedCompany}
                companiesFromJobs={companiesFromJobs}
                seenJobIds={seenJobIds}
                currentView="history"
                starredJobIds={starredJobIds}
                hiddenJobIds={hiddenJobIds}
                hiddenJobs={filterSource(hiddenJobs, false)}
                activeJobIds={activeJobIds}
                onToggleStarred={toggleStarred}
                onHide={hideJob}
                onUnhide={unhideJob}
              />
            } />
            <Route path="/companies" element={
              <CompaniesView 
                searchTerm={searchTerm}
                activeJobs={activeJobs}
                setSelectedCompany={setSelectedCompany}
              />
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer 
          activeCount={activeJobs.filter(j => !hiddenJobIds.has(j.id)).length} 
          removedCount={removedJobs.filter(j => !hiddenJobIds.has(j.id)).length} 
          starredCount={starredCount}
        />
      </div>
    </HashRouter>
  )
}

export default App
