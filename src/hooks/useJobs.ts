import { useState, useEffect, useMemo } from 'react'
import type { Job, CachedJob, JobApplication } from '../types'

export function useJobs() {
  const [activeJobs, setActiveJobs] = useState<Job[]>([])
  const [removedJobs, setRemovedJobs] = useState<Job[]>([])
  const [allEverSeenJobs, setAllEverSeenJobs] = useState<Record<string, CachedJob>>(() => {
    const saved = localStorage.getItem('all_ever_seen_jobs')
    return saved ? JSON.parse(saved) : {}
  })
  const [lastVisitAt, setLastVisitAt] = useState<string | null>(() => localStorage.getItem('last_visit_at'))
  
  const [starredJobIds, setStarredJobIds] = useState<Set<string>>(() => {
    const savedStarred = localStorage.getItem('starred_job_ids')
    return savedStarred ? new Set<string>(JSON.parse(savedStarred) as string[]) : new Set<string>()
  })
  
  const [hiddenJobIds, setHiddenJobIds] = useState<Set<string>>(() => {
    const savedHidden = localStorage.getItem('hidden_job_ids')
    return savedHidden ? new Set<string>(JSON.parse(savedHidden) as string[]) : new Set<string>()
  })

  const [appliedJobs, setAppliedJobs] = useState<Record<string, JobApplication>>(() => {
    const saved = localStorage.getItem('applied_jobs_data')
    return saved ? JSON.parse(saved) : {}
  })

  const [customJobs, setCustomJobs] = useState<Record<string, Job>>(() => {
    const saved = localStorage.getItem('custom_jobs_data')
    return saved ? JSON.parse(saved) : {}
  })
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const savedAllJobs = localStorage.getItem('all_ever_seen_jobs')
    const savedLastVisit = localStorage.getItem('last_visit_at')
    const allEverSeen: Record<string, CachedJob> = savedAllJobs ? JSON.parse(savedAllJobs) : {}

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

        const updatedAllEverSeen: Record<string, CachedJob> = { ...allEverSeen }
        const nowStr = new Date().toISOString()
        data.forEach(job => {
          const existing = allEverSeen[job.id]
          updatedAllEverSeen[job.id] = {
            ...job,
            firstSeenAt: existing?.firstSeenAt || nowStr
          }
        })

        // Prune cache details older than 180 days since first seen, unless they are active, starred, or tracked
        const savedStarred = localStorage.getItem('starred_job_ids')
        const starredSet = savedStarred ? new Set<string>(JSON.parse(savedStarred) as string[]) : new Set<string>()
        
        const savedApplied = localStorage.getItem('applied_jobs_data')
        const appliedKeys = savedApplied ? new Set<string>(Object.keys(JSON.parse(savedApplied) as Record<string, JobApplication>)) : new Set<string>()

        const cutoffTime = Date.now() - 180 * 24 * 60 * 60 * 1000
        const prunedAllEverSeen: Record<string, CachedJob> = {}
        
        Object.values(updatedAllEverSeen).forEach(job => {
          const isActive = currentIds.has(job.id)
          const isStarred = starredSet.has(job.id)
          const isTracked = appliedKeys.has(job.id)
          
          // Use firstSeenAt if available, fallback to postedAt for existing listings
          const seenTime = new Date(job.firstSeenAt || job.postedAt).getTime()
          const isRecent = seenTime > cutoffTime
          
          if (isActive || isStarred || isTracked || isRecent) {
            prunedAllEverSeen[job.id] = job
          }
        })
        localStorage.setItem('all_ever_seen_jobs', JSON.stringify(prunedAllEverSeen))
        setAllEverSeenJobs(prunedAllEverSeen)

        // First-time users: start tracking from now so the next visit has a clean baseline.
        if (!savedLastVisit) {
          const now = new Date().toISOString()
          localStorage.setItem('last_visit_at', now)
          setLastVisitAt(now)
        }

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

  // Jobs discovered since the user's previous visit. On the very first visit the baseline is
  // established after load, so nothing is flagged as new during that session.
  const newJobIds = useMemo(() => {
    if (!lastVisitAt) return new Set<string>()
    const cutoff = new Date(lastVisitAt).getTime()
    return new Set(
      activeJobs
        .filter(job => {
          const firstSeen = allEverSeenJobs[job.id]?.firstSeenAt
          return firstSeen ? new Date(firstSeen).getTime() > cutoff : false
        })
        .map(job => job.id)
    )
  }, [activeJobs, lastVisitAt, allEverSeenJobs])

  // Persist the end of the current session so the next visit can compute newly discovered jobs.
  useEffect(() => {
    const markVisit = () => {
      const now = new Date().toISOString()
      localStorage.setItem('last_visit_at', now)
      setLastVisitAt(now)
    }

    window.addEventListener('beforeunload', markVisit)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') markVisit()
    })

    return () => {
      window.removeEventListener('beforeunload', markVisit)
    }
  }, [])

  const allEverSeenJobsList = useMemo(() => {
    const uniqueMap = new Map<string, Job>()
    Object.values(customJobs).forEach(j => uniqueMap.set(j.id, j))
    activeJobs.forEach(j => uniqueMap.set(j.id, j))
    removedJobs.forEach(j => uniqueMap.set(j.id, j))
    return Array.from(uniqueMap.values())
  }, [activeJobs, removedJobs, customJobs])

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

  const saveJobApplication = (jobId: string, application: Partial<JobApplication> & { status: JobApplication['status'] }) => {
    setAppliedJobs(prev => {
      const existing = prev[jobId] || {
        jobId,
        status: 'applied',
        appliedAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString(),
      }
      
      const next = {
        ...prev,
        [jobId]: {
          ...existing,
          ...application,
          updatedAt: new Date().toISOString(),
        }
      }
      localStorage.setItem('applied_jobs_data', JSON.stringify(next))
      return next
    })
  }

  const removeJobApplication = (jobId: string) => {
    setAppliedJobs(prev => {
      const next = { ...prev }
      delete next[jobId]
      localStorage.setItem('applied_jobs_data', JSON.stringify(next))
      return next
    })
  }

  const addCustomJob = (job: Omit<Job, 'id'>) => {
    const jobId = `custom-${Date.now()}`
    const newJob: Job = {
      ...job,
      id: jobId,
    }
    setCustomJobs(prev => {
      const next = { ...prev, [jobId]: newJob }
      localStorage.setItem('custom_jobs_data', JSON.stringify(next))
      return next
    })
    return newJob
  }

  return {
    loading,
    error,
    activeJobs,
    removedJobs,
    newJobIds,
    starredJobIds,
    hiddenJobIds,
    starredJobs,
    hiddenJobs,
    starredCount,
    activeJobIds,
    appliedJobs,
    customJobs,
    allEverSeenJobsList,
    toggleStarred,
    hideJob,
    unhideJob,
    saveJobApplication,
    removeJobApplication,
    addCustomJob
  }
}
