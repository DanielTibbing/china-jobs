import { useState, useMemo } from 'react'
import { Plus, Search, Briefcase, ExternalLink, Calendar, MessageSquare, User, Building2, CheckSquare, RefreshCw, X, AlertCircle } from 'lucide-react'
import type { Job, JobApplication } from '../../types'
import { COMPANY_DETAILS } from '../../constants/companies'
import { ApplicationModal } from './ApplicationModal'

interface ApplicationsViewProps {
  allJobs: Job[];
  appliedJobs: Record<string, JobApplication>;
  onSaveApplication: (jobId: string, app: Partial<JobApplication> & { status: JobApplication['status'] }) => void;
  onRemoveApplication: (jobId: string) => void;
  onAddCustomJob: (job: Omit<Job, 'id'>) => Job;
}

const REGION_OPTIONS = ['Sweden', 'Denmark', 'Norway', 'Finland', 'Iceland', 'China', 'Remote']

const STATUS_BADGES: Record<JobApplication['status'], { label: string; class: string }> = {
  applied: { label: 'Applied', class: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30' },
  interviewing: { label: 'Interviewing', class: 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/30' },
  offer: { label: 'Offer Received', class: 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30 font-bold animate-pulse' },
  rejected: { label: 'Rejected', class: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30' },
  withdrawn: { label: 'Withdrawn', class: 'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border border-gray-200 dark:border-slate-700' }
}

export function ApplicationsView({
  allJobs, appliedJobs, onSaveApplication, onRemoveApplication, onAddCustomJob
}: ApplicationsViewProps) {
  // Navigation & filtering state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | JobApplication['status']>('all')
  
  // Custom job creation modal state
  const [isCustomJobModalOpen, setIsCustomJobModalOpen] = useState(false)
  const [customTitle, setCustomTitle] = useState('')
  const [customCompany, setCustomCompany] = useState('')
  const [customLocation, setCustomLocation] = useState('')
  const [customRegion, setCustomRegion] = useState('Remote')
  const [customLink, setCustomLink] = useState('')
  const [customError, setCustomError] = useState('')

  // Selected job for Application Details editor modal
  const [selectedJobForEdit, setSelectedJobForEdit] = useState<Job | null>(null)

  // Look up jobs for tracked applications
  const trackedApplicationsList = useMemo(() => {
    return Object.values(appliedJobs).map(app => {
      const job = allJobs.find(j => j.id === app.jobId) || {
        id: app.jobId,
        title: 'Unknown Role',
        company: 'Unknown Company',
        location: 'Unknown Location',
        region: 'Remote',
        link: '',
        postedAt: app.appliedAt,
      } as Job
      return { app, job }
    }).sort((a, b) => new Date(b.app.updatedAt).getTime() - new Date(a.app.updatedAt).getTime())
  }, [appliedJobs, allJobs])

  // Count and Stats summaries
  const stats = useMemo(() => {
    const counts = { all: 0, applied: 0, interviewing: 0, offer: 0, rejected: 0, withdrawn: 0 }
    counts.all = trackedApplicationsList.length
    trackedApplicationsList.forEach(item => {
      if (counts[item.app.status] !== undefined) {
        counts[item.app.status]++
      }
    })
    return counts
  }, [trackedApplicationsList])

  // Filtered applications based on search and selected filter card
  const filteredApplications = useMemo(() => {
    return trackedApplicationsList.filter(item => {
      const matchesStatus = 
        selectedStatusFilter === 'all' || 
        (selectedStatusFilter === 'rejected' 
          ? (item.app.status === 'rejected' || item.app.status === 'withdrawn') 
          : item.app.status === selectedStatusFilter)
      
      const searchStr = searchTerm.toLowerCase()
      const matchesSearch = 
        item.job.title.toLowerCase().includes(searchStr) ||
        item.job.company.toLowerCase().includes(searchStr) ||
        item.job.location.toLowerCase().includes(searchStr) ||
        (item.app.processStep && item.app.processStep.toLowerCase().includes(searchStr)) ||
        (item.app.notes && item.app.notes.toLowerCase().includes(searchStr))

      return matchesStatus && matchesSearch
    })
  }, [trackedApplicationsList, selectedStatusFilter, searchTerm])

  const handleAddCustomJob = (e: React.FormEvent) => {
    e.preventDefault()
    setCustomError('')

    if (!customTitle.trim() || !customCompany.trim() || !customLocation.trim()) {
      setCustomError('Please fill in all required fields.')
      return
    }

    // 1. Create the custom job
    const newJob = onAddCustomJob({
      title: customTitle.trim(),
      company: customCompany.trim(),
      location: customLocation.trim(),
      region: customRegion,
      link: customLink.trim(),
      postedAt: new Date().toISOString()
    })

    // 2. Set default application status as 'applied'
    onSaveApplication(newJob.id, {
      status: 'applied',
      appliedAt: new Date().toISOString().split('T')[0]
    })

    // 3. Reset form and close
    setCustomTitle('')
    setCustomCompany('')
    setCustomLocation('')
    setCustomRegion('Remote')
    setCustomLink('')
    setIsCustomJobModalOpen(false)

    // 4. Open the edit modal to allow the user to fill in contacts / notes immediately
    setTimeout(() => {
      setSelectedJobForEdit(newJob)
    }, 150)
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2.5">
            <CheckSquare className="h-8 w-8 text-blue-600 dark:text-blue-500" />
            Application Tracker
          </h2>
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-1.5 max-w-lg leading-relaxed">
            Manage active submissions, track pipeline progress, schedule interview checkpoints, and record contact history.
          </p>
        </div>
        <button
          onClick={() => setIsCustomJobModalOpen(true)}
          className="inline-flex items-center px-5 py-3 border border-transparent text-xs font-black rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all duration-200 hover:scale-102 active:scale-98 shrink-0"
        >
          <Plus className="mr-2 h-4 w-4 stroke-[3px]" /> Track Custom Job
        </button>
      </div>

      {/* Stats Pipeline Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        
        {/* All applications card */}
        <button
          onClick={() => setSelectedStatusFilter('all')}
          className={`p-4 rounded-2xl border-2 text-left transition-all ${
            selectedStatusFilter === 'all'
              ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-102 font-black'
              : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-950 dark:text-slate-100 hover:border-gray-250 dark:hover:border-slate-750 hover:shadow-sm'
          }`}
        >
          <div className="text-xs font-black uppercase tracking-wider opacity-80">All Tracked</div>
          <div className="text-3xl font-black mt-2 leading-none">{stats.all}</div>
        </button>

        {/* Applied card */}
        <button
          onClick={() => setSelectedStatusFilter('applied')}
          className={`p-4 rounded-2xl border-2 text-left transition-all ${
            selectedStatusFilter === 'applied'
              ? 'bg-blue-500 border-blue-500 text-white shadow-md scale-102 font-black'
              : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-950 dark:text-slate-100 hover:border-gray-250 dark:hover:border-slate-750 hover:shadow-sm'
          }`}
        >
          <div className="text-xs font-black uppercase tracking-wider opacity-85 text-blue-600 dark:text-blue-400 group-hover:text-white">Applied</div>
          <div className="text-3xl font-black mt-2 leading-none">{stats.applied}</div>
        </button>

        {/* Interviewing card */}
        <button
          onClick={() => setSelectedStatusFilter('interviewing')}
          className={`p-4 rounded-2xl border-2 text-left transition-all ${
            selectedStatusFilter === 'interviewing'
              ? 'bg-purple-600 border-purple-600 text-white shadow-md scale-102 font-black'
              : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-950 dark:text-slate-100 hover:border-gray-250 dark:hover:border-slate-750 hover:shadow-sm'
          }`}
        >
          <div className="text-xs font-black uppercase tracking-wider opacity-85 text-purple-600 dark:text-purple-400">Interviewing</div>
          <div className="text-3xl font-black mt-2 leading-none">{stats.interviewing}</div>
        </button>

        {/* Offers card */}
        <button
          onClick={() => setSelectedStatusFilter('offer')}
          className={`p-4 rounded-2xl border-2 text-left transition-all ${
            selectedStatusFilter === 'offer'
              ? 'bg-green-600 border-green-600 text-white shadow-md scale-102 font-black'
              : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-950 dark:text-slate-100 hover:border-gray-250 dark:hover:border-slate-750 hover:shadow-sm'
          }`}
        >
          <div className="text-xs font-black uppercase tracking-wider opacity-85 text-green-600 dark:text-green-400">Offers</div>
          <div className="text-3xl font-black mt-2 leading-none">{stats.offer}</div>
        </button>

        {/* Inactive card (Rejected & Withdrawn combined) */}
        <button
          onClick={() => setSelectedStatusFilter('rejected')}
          className={`p-4 rounded-2xl border-2 text-left transition-all col-span-2 md:col-span-1 ${
            selectedStatusFilter === 'rejected'
              ? 'bg-red-600 border-red-600 text-white shadow-md scale-102 font-black'
              : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-950 dark:text-slate-100 hover:border-gray-250 dark:hover:border-slate-750 hover:shadow-sm'
          }`}
        >
          <div className="text-xs font-black uppercase tracking-wider opacity-85 text-red-600 dark:text-red-400">Rejected / Closed</div>
          <div className="text-3xl font-black mt-2 leading-none">{stats.rejected + stats.withdrawn}</div>
        </button>

      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-150/80 dark:border-slate-800/80 shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-slate-550">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-slate-750 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white placeholder-gray-450 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium transition duration-150 ease-in-out"
            placeholder="Search tracked apps by title, company, stage or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Clear Filter / Status label */}
        {selectedStatusFilter !== 'all' && (
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Filtered:</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200/40">
              {selectedStatusFilter === 'rejected' ? 'REJECTED / CLOSED' : selectedStatusFilter.toUpperCase()}
              <button 
                onClick={() => setSelectedStatusFilter('all')} 
                className="ml-1.5 p-0.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-900"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          
          /* Empty State */
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-gray-250 dark:border-slate-800">
            <CheckSquare className="mx-auto h-14 w-14 text-gray-300 dark:text-slate-700 mb-4" />
            <h3 className="text-lg font-black dark:text-slate-400">No tracked applications found</h3>
            <p className="text-xs font-bold text-gray-400 dark:text-slate-500 mt-2 max-w-sm mx-auto uppercase tracking-wider">
              {searchTerm 
                ? 'Try broadening your search criteria or removing active status filters.'
                : 'Click "Track Application" on any job card, or click "+ Track Custom Job" above to get started.'}
            </p>
          </div>
        ) : (
          
          /* Applications grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredApplications.map(({ app, job }) => {
              const companyInfo = COMPANY_DETAILS[job.company]
              
              return (
                <div 
                  key={app.jobId} 
                  className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-gray-100 dark:border-slate-800/80 p-5 shadow-sm hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900/50 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden"
                >
                  <div>
                    {/* Header: Logo, Title & Status */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex gap-3.5 items-center">
                        <div className="w-11 h-11 rounded-lg border border-gray-100 dark:border-slate-750 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                          {companyInfo?.customLogo ? (
                            <img src={companyInfo.customLogo} alt={job.company} className="max-w-full max-h-full object-contain p-1" />
                          ) : companyInfo?.logoDomain ? (
                            <img 
                              src={`https://logo.clearbit.com/${companyInfo.logoDomain}`} 
                              alt={job.company} 
                              className="max-w-full max-h-full object-contain p-1"
                              onError={(e) => {
                                (e.target as HTMLImageElement).onerror = null;
                                (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(job.company) + '&background=random';
                              }}
                            />
                          ) : (
                            <Briefcase className="h-5 w-5 text-gray-300 dark:text-slate-650" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-black text-base text-gray-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{job.title}</h3>
                          <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-tight">{job.company}</p>
                        </div>
                      </div>

                      {/* Status badge */}
                      <span className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 ${STATUS_BADGES[app.status]?.class || ''}`}>
                        {STATUS_BADGES[app.status]?.label || app.status}
                      </span>
                    </div>

                    {/* Pipeline / Process details */}
                    <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-gray-100 dark:border-slate-850/60">
                      
                      {/* Applied Date */}
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-slate-400">
                        <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                        <div>
                          <span className="text-[10px] font-bold block uppercase text-gray-400 leading-none">Applied</span>
                          <span className="font-bold text-gray-700 dark:text-slate-350">{new Date(app.appliedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Process Stage */}
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-505 dark:text-slate-400">
                        <RefreshCw className="h-4 w-4 text-gray-400 shrink-0" />
                        <div className="truncate">
                          <span className="text-[10px] font-bold block uppercase text-gray-400 leading-none">Stage</span>
                          <span className="font-bold text-gray-700 dark:text-slate-350 truncate">{app.processStep || 'None logged'}</span>
                        </div>
                      </div>

                    </div>

                    {/* Recruiter / Contact info */}
                    {(app.contactName || app.contactEmail) && (
                      <div className="mt-4 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/40 border border-gray-150/40 dark:border-slate-800/40 flex items-center justify-between text-xs text-gray-600 dark:text-slate-400">
                        <div className="flex items-center gap-2 truncate">
                          <User className="h-3.5 w-3.5 text-gray-400" />
                          <span className="font-bold truncate">{app.contactName || 'Recruiter'}</span>
                        </div>
                        {app.contactEmail && (
                          <div className="flex items-center gap-1.5 truncate max-w-[50%]">
                            <span className="text-[10px] text-gray-400 font-bold uppercase shrink-0">Info:</span>
                            {app.contactEmail.startsWith('http') ? (
                              <a 
                                href={app.contactEmail} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-600 dark:text-blue-400 font-bold hover:underline truncate"
                              >
                                Link <ExternalLink className="inline h-3 w-3" />
                              </a>
                            ) : (
                              <span className="font-bold truncate text-gray-600 dark:text-slate-400" title={app.contactEmail}>
                                {app.contactEmail}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notes Snippet */}
                    {app.notes && (
                      <div className="mt-4 p-3 rounded-xl bg-blue-50/20 dark:bg-slate-800/20 border border-blue-100/10 dark:border-slate-800/30 text-xs text-gray-600 dark:text-slate-400 flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-blue-500/60 shrink-0 mt-0.5" />
                        <p className="line-clamp-2 italic leading-relaxed text-gray-605 dark:text-slate-400">{app.notes}</p>
                      </div>
                    )}

                  </div>

                  {/* Quick updates actions */}
                  <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-slate-850/60">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      Updated: {new Date(app.updatedAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      {job.link && (
                        <a 
                          href={job.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 text-gray-450 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                          title="Open Original Job Listing"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        onClick={() => setSelectedJobForEdit(job)}
                        className="inline-flex items-center px-4 py-2 border border-blue-600 dark:border-blue-500 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white transition-all hover:scale-102 active:scale-95"
                      >
                        Update Progress
                      </button>
                    </div>
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Global Application Detail modal */}
      {selectedJobForEdit && (
        <ApplicationModal
          isOpen={!!selectedJobForEdit}
          onClose={() => setSelectedJobForEdit(null)}
          job={selectedJobForEdit}
          existingApplication={appliedJobs[selectedJobForEdit.id]}
          onSave={onSaveApplication}
          onDelete={onRemoveApplication}
        />
      )}

      {/* Track Custom Job Modal */}
      {isCustomJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCustomJobModalOpen(false)}
          />

          {/* Dialog content */}
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden transition-all z-10 max-h-[90vh] flex flex-col animate-scale-up">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-850 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-xl text-gray-900 dark:text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                  Track Custom Job
                </h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tight mt-0.5">Manually log external applications</p>
              </div>
              <button 
                onClick={() => setIsCustomJobModalOpen(false)} 
                className="p-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body Form */}
            <form onSubmit={handleAddCustomJob} className="p-6 space-y-4 overflow-y-auto flex-1">
              {customError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-xs font-bold text-red-650 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                  {customError}
                </div>
              )}

              {/* Role Title */}
              <div>
                <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Role Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Software Engineer"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="block w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white placeholder-gray-450 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
                />
              </div>

              {/* Company */}
              <div>
                <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electrolux, Spotify"
                  value={customCompany}
                  onChange={(e) => setCustomCompany(e.target.value)}
                  className="block w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white placeholder-gray-450 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Location */}
                <div>
                  <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stockholm, Sweden"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    className="block w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white placeholder-gray-450 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
                  />
                </div>

                {/* Region Select */}
                <div>
                  <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Region
                  </label>
                  <select
                    value={customRegion}
                    onChange={(e) => setCustomRegion(e.target.value)}
                    className="block w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
                  >
                    {REGION_OPTIONS.map(reg => (
                      <option key={reg} value={reg}>{reg}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Job Link */}
              <div>
                <label className="block text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Job Posting URL
                </label>
                <input
                  type="url"
                  placeholder="https://company.career/job-description"
                  value={customLink}
                  onChange={(e) => setCustomLink(e.target.value)}
                  className="block w-full px-3.5 py-2.5 border border-gray-300 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 dark:text-white placeholder-gray-450 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
                />
              </div>

            </form>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-850 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsCustomJobModalOpen(false)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-750 text-xs font-bold rounded-xl text-gray-700 dark:text-slate-350 bg-white dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleAddCustomJob}
                className="px-5 py-2 border border-transparent text-xs font-black rounded-xl text-white bg-blue-600 hover:bg-blue-750 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm transition-all hover:scale-102 active:scale-95"
              >
                Create & Track
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
