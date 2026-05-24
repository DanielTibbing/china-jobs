import { useState, useEffect, useMemo } from 'react'
import type { Job } from '../types'

export function useJobs() {
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

  return {
    loading,
    error,
    activeJobs,
    removedJobs,
    seenJobIds,
    starredJobIds,
    hiddenJobIds,
    starredJobs,
    hiddenJobs,
    starredCount,
    activeJobIds,
    toggleStarred,
    hideJob,
    unhideJob
  }
}
